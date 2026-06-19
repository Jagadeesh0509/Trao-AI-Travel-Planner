const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Morning',
  },
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tier: { type: String, default: 'Standard' },
  estimatedCostNightUSD: { type: Number, default: 0 },
  rating: { type: String, default: 'N/A' },
  amenities: [{ type: String }],
});

const PackingItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  category: {
    type: String,
    default: 'Other',
  },
  isPacked: { type: Boolean, default: false },
});

const ItineraryDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  theme: { type: String, default: '' },
  activities: [ActivitySchema],
});

const TripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    isPublic: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    durationDays: { type: Number, required: true, min: 1, max: 30 },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: [{ type: String }],
    itinerary: [ItineraryDaySchema],
    hotels: [HotelSchema],
    estimatedBudget: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    packingList: [PackingItemSchema],
    // Metadata for weather packing assistant
    season: { type: String, default: '' },
    climateNotes: { type: String, default: '' },
    travelStyle: { type: String, default: 'Leisure' },
    chatHistory: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    weatherReport: {
      current: { type: Object },
      forecast: [{ type: Object }],
      warnings: [{ type: String }],
      generatedAt: { type: Date },
    },
    recommendations: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Attraction' },
        description: { type: String, default: '' },
        estimatedCostUSD: { type: Number, default: 0 },
        whyLoveIt: { type: String, default: '' },
      }
    ],
    mapMarkers: [
      {
        name: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        dayNumber: { type: Number },
        type: { type: String, enum: ['activity', 'hotel'] },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', TripSchema);
