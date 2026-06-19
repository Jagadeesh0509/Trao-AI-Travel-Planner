const Trip = require('../models/Trip');

// ──────────────────────────────────────────────
// Exponential backoff for external API resilience
// ──────────────────────────────────────────────
async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`⚠️  Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      const errorBody = await response.text();
      throw new Error(`Gemini API Error [${response.status}]: ${errorBody}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`⚠️  Request failed. Retrying in ${delay}ms... (${retries} retries left)`, error.message);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// Build the Gemini API URL
// ──────────────────────────────────────────────
const getGeminiUrl = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
};

// ──────────────────────────────────────────────
// Call Gemini and return parsed JSON
// ──────────────────────────────────────────────
async function callGemini(prompt) {
  const url = getGeminiUrl();
  const requestPayload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  };

  const data = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload),
  });

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API.');

  // Strip markdown code fences if present
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return JSON.parse(cleaned);
}

// ──────────────────────────────────────────────
// Build full trip generation prompt
// ──────────────────────────────────────────────
function buildTripPrompt(destination, durationDays, budgetTier, interests) {
  const budgetGuide = {
    Low: 'budget backpacker style — hostels, street food, free attractions',
    Medium: 'mid-range comfort — 3-star hotels, local restaurants, popular sights',
    High: 'luxury experience — 5-star hotels, fine dining, exclusive experiences',
  };

  return `
You are an expert AI travel planner. Create a detailed, realistic travel plan for a ${durationDays}-day trip to ${destination}.
Budget tier: ${budgetTier} (${budgetGuide[budgetTier]}).
Traveler interests: ${interests.join(', ')}.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no explanation. Exact structure:

{
  "itinerary": [
    {
      "dayNumber": 1,
      "theme": "Day theme title",
      "activities": [
        {
          "title": "Activity name",
          "description": "2-3 sentence description of the activity",
          "estimatedCostUSD": 25,
          "timeOfDay": "Morning"
        },
        {
          "title": "Another activity",
          "description": "2-3 sentence description",
          "estimatedCostUSD": 15,
          "timeOfDay": "Afternoon"
        },
        {
          "title": "Evening activity",
          "description": "2-3 sentence description",
          "estimatedCostUSD": 30,
          "timeOfDay": "Evening"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "tier": "${budgetTier}",
      "estimatedCostNightUSD": 85,
      "rating": "4.2/5",
      "amenities": ["WiFi", "Breakfast", "Pool"]
    },
    {
      "name": "Second hotel option",
      "tier": "${budgetTier}",
      "estimatedCostNightUSD": 95,
      "rating": "4.5/5",
      "amenities": ["WiFi", "Gym", "Restaurant"]
    },
    {
      "name": "Third hotel option",
      "tier": "${budgetTier}",
      "estimatedCostNightUSD": 75,
      "rating": "4.0/5",
      "amenities": ["WiFi", "Parking"]
    }
  ],
  "estimatedBudget": {
    "transport": 150,
    "accommodation": 600,
    "food": 300,
    "activities": 200,
    "total": 1250
  },
  "packingList": [
    { "item": "Passport", "category": "Documents", "isPacked": false },
    { "item": "Travel insurance documents", "category": "Documents", "isPacked": false },
    { "item": "Flight tickets printout", "category": "Documents", "isPacked": false },
    { "item": "Weather-appropriate jacket", "category": "Clothing", "isPacked": false },
    { "item": "Comfortable walking shoes", "category": "Clothing", "isPacked": false },
    { "item": "Sunscreen SPF 50", "category": "Gear", "isPacked": false },
    { "item": "Universal power adapter", "category": "Gear", "isPacked": false },
    { "item": "Portable phone charger", "category": "Gear", "isPacked": false }
  ],
  "season": "Summer",
  "climateNotes": "Brief note on expected weather at ${destination} during this trip"
}

Rules:
- Generate exactly ${durationDays} day objects in the itinerary array
- Each day must have exactly 3 activities (Morning, Afternoon, Evening)
- All cost estimates must be realistic for ${budgetTier} budget in ${destination}
- Hotel costs should reflect ${durationDays}-night stay totals in estimatedBudget.accommodation
- Packing list should be weather and activity appropriate (minimum 12 items)
- The JSON must be valid and parseable
`;
}

// ──────────────────────────────────────────────
// Build day regeneration prompt
// ──────────────────────────────────────────────
function buildRegenerateDayPrompt(destination, dayNumber, durationDays, budgetTier, interests, userFeedback, existingDay) {
  return `
You are an expert AI travel planner. Regenerate Day ${dayNumber} of a ${durationDays}-day trip to ${destination}.
Budget tier: ${budgetTier}. Interests: ${interests.join(', ')}.
User feedback for this day: "${userFeedback || 'Make it more interesting and varied'}"
Previous day activities were: ${existingDay.activities.map((a) => a.title).join(', ')}.

Respond ONLY with a valid JSON object for a single day:

{
  "dayNumber": ${dayNumber},
  "theme": "New day theme",
  "activities": [
    {
      "title": "Activity name",
      "description": "2-3 sentence description",
      "estimatedCostUSD": 25,
      "timeOfDay": "Morning"
    },
    {
      "title": "Afternoon activity",
      "description": "2-3 sentence description",
      "estimatedCostUSD": 15,
      "timeOfDay": "Afternoon"
    },
    {
      "title": "Evening activity",
      "description": "2-3 sentence description",
      "estimatedCostUSD": 30,
      "timeOfDay": "Evening"
    }
  ]
}

Do NOT repeat the previous activities. Be creative and specific to ${destination}.
`;
}

// ══════════════════════════════════════════════
// CONTROLLER FUNCTIONS
// ══════════════════════════════════════════════

// @route   POST /api/trips
// @desc    Generate a new AI-powered trip
// @access  Private
exports.generateNewTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests } = req.body;
    const userId = req.user.id;

    if (!destination || !durationDays || !budgetTier) {
      return res.status(400).json({ message: 'Destination, duration, and budget tier are required.' });
    }

    const prompt = buildTripPrompt(destination, durationDays, budgetTier, interests || []);

    console.log(`🤖 Generating trip to ${destination} (${durationDays} days, ${budgetTier} budget)...`);
    const cleanResult = await callGemini(prompt);

    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: interests || [],
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList,
      season: cleanResult.season || '',
      climateNotes: cleanResult.climateNotes || '',
    });

    const savedTrip = await newTrip.save();
    console.log(`✅ Trip saved: ${savedTrip._id}`);
    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error('❌ Trip generation error:', error);
    return res.status(500).json({
      message: 'AI generation encountered an error. Please try again.',
      error: error.message,
    });
  }
};

// @route   GET /api/trips
// @desc    Get all trips for the authenticated user
// @access  Private
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    return res.status(200).json(trips);
  } catch (error) {
    console.error('❌ Get trips error:', error);
    return res.status(500).json({ message: 'Failed to fetch trips.' });
  }
};

// @route   GET /api/trips/:id
// @desc    Get a single trip by ID (ownership enforced)
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }
    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Get trip error:', error);
    return res.status(500).json({ message: 'Failed to fetch trip.' });
  }
};

// @route   PUT /api/trips/:id
// @desc    Update trip fields (itinerary edits, packing toggles)
// @access  Private
exports.updateTrip = async (req, res) => {
  try {
    const allowedUpdates = ['itinerary', 'packingList', 'hotels', 'estimatedBudget', 'destination'];
    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }
    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Update trip error:', error);
    return res.status(500).json({ message: 'Failed to update trip.' });
  }
};

// @route   DELETE /api/trips/:id
// @desc    Delete a trip (ownership enforced)
// @access  Private
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }
    return res.status(200).json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('❌ Delete trip error:', error);
    return res.status(500).json({ message: 'Failed to delete trip.' });
  }
};

// @route   POST /api/trips/:id/regenerate-day
// @desc    Regenerate a specific day using AI (with user feedback)
// @access  Private
exports.regenerateDay = async (req, res) => {
  try {
    const { dayNumber, userFeedback } = req.body;

    if (!dayNumber) {
      return res.status(400).json({ message: 'dayNumber is required.' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    const existingDay = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!existingDay) {
      return res.status(404).json({ message: `Day ${dayNumber} not found in itinerary.` });
    }

    const prompt = buildRegenerateDayPrompt(
      trip.destination,
      dayNumber,
      trip.durationDays,
      trip.budgetTier,
      trip.interests,
      userFeedback,
      existingDay
    );

    console.log(`🔄 Regenerating Day ${dayNumber} for trip ${trip._id}...`);
    const regeneratedDay = await callGemini(prompt);

    // Replace the specific day in the itinerary
    const updatedItinerary = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber ? { ...day.toObject(), ...regeneratedDay } : day
    );

    trip.itinerary = updatedItinerary;
    await trip.save();

    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Regenerate day error:', error);
    return res.status(500).json({ message: 'Failed to regenerate day. Please try again.' });
  }
};
