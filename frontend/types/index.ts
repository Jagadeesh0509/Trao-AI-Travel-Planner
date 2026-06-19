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
  durationDays: number;
  budgetTier: BudgetTier;
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  estimatedBudget: Budget;
  packingList: PackingItem[];
  season: string;
  climateNotes: string;
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
