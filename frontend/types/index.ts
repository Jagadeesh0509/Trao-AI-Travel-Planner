// ─── Activity & Itinerary ─────────────────────────────────────────────────────
export interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface ItineraryDay {
  _id?: string;
  dayNumber: number;
  theme: string;
  activities: Activity[];
}

// ─── Hotel ────────────────────────────────────────────────────────────────────
export interface Hotel {
  _id?: string;
  name: string;
  tier: string;
  estimatedCostNightUSD: number;
  rating: string;
  amenities: string[];
}

// ─── Packing ──────────────────────────────────────────────────────────────────
export type PackingCategory = 'Documents' | 'Clothing' | 'Gear' | 'Other';

export interface PackingItem {
  _id?: string;
  item: string;
  category: PackingCategory;
  isPacked: boolean;
}

// ─── Budget ───────────────────────────────────────────────────────────────────
export interface Budget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export type BudgetTier = 'Low' | 'Medium' | 'High';

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  title?: string;
  startDate?: string;
  isPublic?: boolean;
  isCompleted?: boolean;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  estimatedBudget: Budget;
  packingList: PackingItem[];
  season: string;
  climateNotes: string;
  travelStyle?: string;
  chatHistory?: { role: 'user' | 'model'; message: string; timestamp?: string }[];
  weatherReport?: {
    current: {
      tempC: number;
      condition: string;
      rainProbabilityPercent: number;
      humidityPercent: number;
      windSpeedKph: number;
    };
    forecast: {
      day: string;
      tempMinC: number;
      tempMaxC: number;
      condition: string;
      rainProbabilityPercent: number;
    }[];
    warnings: string[];
    generatedAt?: string;
  };
  recommendations?: {
    name: string;
    category: 'Attraction' | 'Hidden Gem' | 'Restaurant' | 'Cafe' | 'Experience';
    description: string;
    estimatedCostUSD: number;
    whyLoveIt: string;
  }[];
  mapMarkers?: {
    name: string;
    lat: number;
    lng: number;
    dayNumber?: number;
    type: 'activity' | 'hotel';
  }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ─── Forms ────────────────────────────────────────────────────────────────────
export interface CreateTripFormData {
  destination: string;
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
}

// ─── API Errors ───────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
}
