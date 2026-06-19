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
// HELPER: Map Markers Fallback Generator
// ══════════════════════════════════════════════
function ensureTripMapMarkers(trip) {
  if (trip.mapMarkers && trip.mapMarkers.length > 0) {
    return;
  }

  const cityCoordinates = {
    paris: { lat: 48.8566, lng: 2.3522 },
    london: { lat: 51.5074, lng: -0.1278 },
    tokyo: { lat: 35.6762, lng: 139.6503 },
    newyork: { lat: 40.7128, lng: -74.0060 },
    nyc: { lat: 40.7128, lng: -74.0060 },
    rome: { lat: 41.9028, lng: 12.4964 },
    bali: { lat: -8.4095, lng: 115.1889 },
    sydney: { lat: -33.8688, lng: 151.2093 },
    barcelona: { lat: 41.3851, lng: 2.1734 },
    dubai: { lat: 25.2048, lng: 55.2708 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
    singapore: { lat: 1.3521, lng: 103.8198 },
    amsterdam: { lat: 52.3676, lng: 4.9041 },
    cairo: { lat: 30.0444, lng: 31.2357 },
    kyoto: { lat: 35.0116, lng: 135.7681 },
    santorini: { lat: 36.3932, lng: 25.4615 },
  };

  const destLower = trip.destination.toLowerCase().replace(/[^a-z]/g, '');
  let center = { lat: 40.7128, lng: -74.0060 }; // fallback to New York

  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (destLower.includes(city)) {
      center = coords;
      break;
    }
  }

  if (center.lat === 40.7128 && center.lng === -74.0060 && !destLower.includes('newyork') && !destLower.includes('nyc')) {
    let hash = 0;
    for (let i = 0; i < trip.destination.length; i++) {
      hash = trip.destination.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 10 + Math.abs((hash % 40));
    const lng = -10 + Math.abs(((hash >> 8) % 120));
    center = { lat, lng };
  }

  const markers = [];
  
  if (trip.hotels && trip.hotels.length > 0) {
    trip.hotels.forEach((hotel, idx) => {
      markers.push({
        name: hotel.name,
        lat: center.lat + (Math.sin(idx) * 0.01),
        lng: center.lng + (Math.cos(idx) * 0.01),
        dayNumber: 0,
        type: 'hotel'
      });
    });
  }

  if (trip.itinerary && trip.itinerary.length > 0) {
    trip.itinerary.forEach((day) => {
      day.activities.forEach((act, actIdx) => {
        const angle = (day.dayNumber * 1.5) + (actIdx * 0.5);
        const distance = 0.008 + (actIdx * 0.005);
        markers.push({
          name: act.title,
          lat: center.lat + (Math.sin(angle) * distance),
          lng: center.lng + (Math.cos(angle) * distance),
          dayNumber: day.dayNumber,
          type: 'activity'
        });
      });
    });
  }

  trip.mapMarkers = markers;
}

// ══════════════════════════════════════════════
// CONTROLLER FUNCTIONS
// ══════════════════════════════════════════════

// @route   POST /api/trips
// @desc    Generate a new AI-powered trip
// @access  Private
exports.generateNewTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests, startDate, title } = req.body;
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
      title: title || destination,
      startDate: startDate || new Date(),
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

    ensureTripMapMarkers(newTrip);

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

    // Backward compatibility: ensure map markers are present
    let updatedAny = false;
    for (const trip of trips) {
      if (!trip.mapMarkers || trip.mapMarkers.length === 0) {
        ensureTripMapMarkers(trip);
        await trip.save();
        updatedAny = true;
      }
    }

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

    // Add map markers fallback for backward compatibility
    if (!trip.mapMarkers || trip.mapMarkers.length === 0) {
      ensureTripMapMarkers(trip);
      await trip.save();
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
    const allowedUpdates = [
      'itinerary', 'packingList', 'hotels', 'estimatedBudget', 
      'destination', 'title', 'startDate', 'isPublic', 'chatHistory', 'travelStyle',
      'isCompleted'
    ];
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
    ensureTripMapMarkers(trip); // refresh coordinates in case activities changed
    await trip.save();

    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Regenerate day error:', error);
    return res.status(500).json({ message: 'Failed to regenerate day. Please try again.' });
  }
};

// @route   GET /api/trips/public/:id
// @desc    Get a public shared trip (no auth required)
// @access  Public
exports.getPublicTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).select('-__v');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    if (!trip.isPublic) {
      return res.status(403).json({ message: 'This trip is not public.' });
    }
    
    // Add map markers fallback for public shared trip
    if (!trip.mapMarkers || trip.mapMarkers.length === 0) {
      ensureTripMapMarkers(trip);
      await trip.save();
    }

    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Get public trip error:', error);
    return res.status(500).json({ message: 'Failed to fetch public trip.' });
  }
};

// @route   POST /api/trips/:id/duplicate
// @desc    Duplicate a trip for the current user
// @access  Private
exports.duplicateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    const tripObj = trip.toObject();
    delete tripObj._id;
    delete tripObj.createdAt;
    delete tripObj.updatedAt;

    tripObj.title = tripObj.title ? `Copy of ${tripObj.title}` : `Copy of ${tripObj.destination}`;
    tripObj.isPublic = false;
    tripObj.isCompleted = false;
    tripObj.chatHistory = []; // clear chat history for new copy

    const newTrip = new Trip(tripObj);
    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error('❌ Duplicate trip error:', error);
    return res.status(500).json({ message: 'Failed to duplicate trip.' });
  }
};

// @route   POST /api/trips/:id/chat
// @desc    Context-aware ChatGPT travel chatbot inside the trip
// @access  Private
exports.chatWithTripAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    const itineraryContext = trip.itinerary.map(day => {
      const activitiesText = day.activities.map(act => `- [${act.timeOfDay}] ${act.title}: ${act.description} (Cost: $${act.estimatedCostUSD})`).join('\n');
      return `Day ${day.dayNumber} (${day.theme}):\n${activitiesText}`;
    }).join('\n\n');

    const hotelsContext = trip.hotels.map(h => `- ${h.name} (${h.tier} Tier, Rating: ${h.rating}, $${h.estimatedCostNightUSD}/night)`).join('\n');

    const contextPrompt = `
You are an expert AI travel guide and assistant for "Trao" travel SaaS.
You are helping the user with their trip to ${trip.destination}.

Trip details:
Destination: ${trip.destination}
Duration: ${trip.durationDays} days
Budget Tier: ${trip.budgetTier}
Traveler Interests: ${trip.interests.join(', ')}
Total Estimated Budget: $${trip.estimatedBudget.total} (Transport: $${trip.estimatedBudget.transport}, Accommodation: $${trip.estimatedBudget.accommodation}, Food: $${trip.estimatedBudget.food}, Activities: $${trip.estimatedBudget.activities})

Current Itinerary:
${itineraryContext}

Recommended Hotels:
${hotelsContext}

Guidelines:
- Provide high quality, friendly, actionable, and structured travel tips.
- Focus on destination details, local culture, customs, packing checklists, weather advices, dining, cafes, hidden spots, transport routes, and budget optimization.
- Write in clean Markdown format. Keep answers engaging and concise.

Conversation history:
${trip.chatHistory.map(ch => `${ch.role === 'user' ? 'User' : 'Assistant'}: ${ch.message}`).join('\n')}

User's question: "${message}"

Assistant:`;

    const url = getGeminiUrl();
    const requestPayload = {
      contents: [{ parts: [{ text: contextPrompt }] }],
      generationConfig: {
        temperature: 0.7,
      },
    };

    console.log(`🤖 Generating chat reply for trip to ${trip.destination}...`);
    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) throw new Error('Empty response from Gemini API.');

    trip.chatHistory.push({ role: 'user', message });
    trip.chatHistory.push({ role: 'model', message: aiText });
    await trip.save();

    return res.status(200).json({ response: aiText, chatHistory: trip.chatHistory });
  } catch (error) {
    console.error('❌ Chat assistant error:', error);
    return res.status(500).json({ message: 'Failed to generate assistant response.' });
  }
};

// @route   GET /api/trips/:id/weather
// @desc    Retrieve cached weather forecast or generate it using Gemini
// @access  Private
exports.getTripWeather = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (trip.weatherReport && trip.weatherReport.generatedAt && (new Date() - new Date(trip.weatherReport.generatedAt) < ONE_DAY)) {
      return res.status(200).json(trip.weatherReport);
    }

    const weatherPrompt = `
Generate a highly realistic weather report and 7-day forecast for a trip to ${trip.destination} during ${trip.season || 'Summer'}.
Also provide travel and weather warnings (e.g., UV warnings, sudden rainfall, typhoons, hot temperatures, extreme cold, altitude sickness).

Respond ONLY with a valid JSON object. No markdown, no explanation. Exact format:
{
  "current": {
    "tempC": 24,
    "condition": "Partly Cloudy",
    "rainProbabilityPercent": 15,
    "humidityPercent": 60,
    "windSpeedKph": 12
  },
  "forecast": [
    { "day": "Day 1", "tempMinC": 18, "tempMaxC": 26, "condition": "Sunny", "rainProbabilityPercent": 10 },
    { "day": "Day 2", "tempMinC": 19, "tempMaxC": 25, "condition": "Partly Cloudy", "rainProbabilityPercent": 20 },
    { "day": "Day 3", "tempMinC": 17, "tempMaxC": 24, "condition": "Showers", "rainProbabilityPercent": 70 },
    { "day": "Day 4", "tempMinC": 18, "tempMaxC": 26, "condition": "Sunny", "rainProbabilityPercent": 10 },
    { "day": "Day 5", "tempMinC": 19, "tempMaxC": 27, "condition": "Sunny", "rainProbabilityPercent": 0 },
    { "day": "Day 6", "tempMinC": 20, "tempMaxC": 28, "condition": "Partly Cloudy", "rainProbabilityPercent": 10 },
    { "day": "Day 7", "tempMinC": 19, "tempMaxC": 26, "condition": "Cloudy", "rainProbabilityPercent": 30 }
  ],
  "warnings": [
    "UV levels are high. Wear sunscreen and stay hydrated.",
    "Showers expected mid-week. Pack an umbrella."
  ]
}
`;

    console.log(`🤖 Generating weather report for ${trip.destination}...`);
    const cleanResult = await callGemini(weatherPrompt);

    trip.weatherReport = {
      ...cleanResult,
      generatedAt: new Date(),
    };
    await trip.save();

    return res.status(200).json(trip.weatherReport);
  } catch (error) {
    console.error('❌ Get weather error:', error);
    // Safe fallback forecast
    const fallback = {
      current: { tempC: 22, condition: 'Sunny', rainProbabilityPercent: 10, humidityPercent: 55, windSpeedKph: 10 },
      forecast: [
        { day: 'Day 1', tempMinC: 15, tempMaxC: 25, condition: 'Sunny', rainProbabilityPercent: 10 },
        { day: 'Day 2', tempMinC: 16, tempMaxC: 26, condition: 'Sunny', rainProbabilityPercent: 10 },
        { day: 'Day 3', tempMinC: 15, tempMaxC: 24, condition: 'Partly Cloudy', rainProbabilityPercent: 20 },
        { day: 'Day 4', tempMinC: 14, tempMaxC: 23, condition: 'Showers', rainProbabilityPercent: 50 },
        { day: 'Day 5', tempMinC: 13, tempMaxC: 22, condition: 'Cloudy', rainProbabilityPercent: 30 },
        { day: 'Day 6', tempMinC: 14, tempMaxC: 24, condition: 'Partly Cloudy', rainProbabilityPercent: 15 },
        { day: 'Day 7', tempMinC: 15, tempMaxC: 25, condition: 'Sunny', rainProbabilityPercent: 10 }
      ],
      warnings: ['Keep hydrated and wear sunscreen. No severe alerts.'],
      generatedAt: new Date()
    };
    return res.status(200).json(fallback);
  }
};

// @route   GET /api/trips/:id/recommendations
// @desc    Retrieve cached points of interest or generate them using Gemini
// @access  Private
exports.getTripRecommendations = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    if (trip.recommendations && trip.recommendations.length > 0) {
      return res.status(200).json(trip.recommendations);
    }

    const recsPrompt = `
You are a Parisian or local expert travel guide in ${trip.destination}.
Generate a list of 6 highly personalized recommendations for a traveler with these interests: ${trip.interests.join(', ')} and a ${trip.budgetTier} budget.
Include attractions, hidden gems, restaurants, cafes, and local experiences.

Respond ONLY with a valid JSON array of 6 objects. No markdown, no explanation. Exact format:
[
  {
    "name": "Secret Spot Name",
    "category": "Hidden Gem",
    "description": "Short description of the spot and what to do there.",
    "estimatedCostUSD": 15,
    "whyLoveIt": "Explains how this fits their interests or budget."
  }
]

Allowed categories: Attraction, Hidden Gem, Restaurant, Cafe, Experience.
`;

    console.log(`🤖 Generating recommended places for ${trip.destination}...`);
    const cleanResult = await callGemini(recsPrompt);

    trip.recommendations = cleanResult;
    await trip.save();

    return res.status(200).json(trip.recommendations);
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    const fallback = [
      { name: 'Local Historical Center', category: 'Attraction', description: 'Take a stroll through the historical heart of the city.', estimatedCostUSD: 0, whyLoveIt: 'A great cultural walk matching your interests.' },
      { name: 'Scenic Hill Overlook', category: 'Hidden Gem', description: 'A quiet hilltop offering panoramic views of the city. Perfect at sunset.', estimatedCostUSD: 0, whyLoveIt: 'A beautiful local secret with zero costs.' },
      { name: 'Traditional Family Bistro', category: 'Restaurant', description: 'A family-run establishment serving authentic local specialties.', estimatedCostUSD: 18, whyLoveIt: 'Matches your budget and local cuisine interests.' },
      { name: 'Cosy Book Cafe', category: 'Cafe', description: 'Artisanal coffee and fresh pastries in a book-filled, cozy setting.', estimatedCostUSD: 5, whyLoveIt: 'A wonderful local atmosphere.' },
      { name: 'Boutique Shopping Quarter', category: 'Experience', description: 'Explore local artisans, crafts, and vintage shops.', estimatedCostUSD: 0, whyLoveIt: 'Great to experience local design and life.' },
      { name: 'Riverside Walkway', category: 'Experience', description: 'A peaceful walk along the main river with street musicians and cafes.', estimatedCostUSD: 0, whyLoveIt: 'Beautiful scenery at no cost.' }
    ];
    return res.status(200).json(fallback);
  }
};

// @route   POST /api/trips/:id/regenerate-packing
// @desc    Regenerate trip packing checklist with user custom style, season and weather
// @access  Private
exports.regenerateTripPackingList = async (req, res) => {
  try {
    const { travelStyle, season, weather } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or access denied.' });
    }

    const style = travelStyle || trip.travelStyle || 'Leisure';
    const s = season || trip.season || 'Summer';
    const w = weather || 'Mild';

    const packingPrompt = `
Generate a comprehensive packing list for a ${trip.durationDays}-day trip to ${trip.destination}.
Season: ${s}. Weather condition: ${w}. Travel Style: ${style}.
Interests: ${trip.interests.join(', ')}.

Respond ONLY with a valid JSON object. No markdown, no explanation. Exact format:
{
  "climateNotes": "Expected weather is hot and humid with occasional afternoon rain.",
  "packingList": [
    { "item": "Passport & Visas", "category": "Documents", "isPacked": false },
    { "item": "Comfortable sneakers", "category": "Clothing", "isPacked": false },
    { "item": "Universal adapter", "category": "Gear", "isPacked": false },
    { "item": "Personal toiletries", "category": "Other", "isPacked": false }
  ]
}

Rules:
- Generate a minimum of 14 essential items.
- Item categories must be exactly one of: Documents, Clothing, Gear, Other.
`;

    console.log(`🤖 Regenerating packing list for ${trip.destination}...`);
    const cleanResult = await callGemini(packingPrompt);

    trip.packingList = cleanResult.packingList;
    trip.climateNotes = cleanResult.climateNotes || trip.climateNotes;
    trip.season = s;
    trip.travelStyle = style;
    await trip.save();

    return res.status(200).json(trip);
  } catch (error) {
    console.error('❌ Regenerate packing list error:', error);
    return res.status(500).json({ message: 'Failed to regenerate packing list.' });
  }
};
