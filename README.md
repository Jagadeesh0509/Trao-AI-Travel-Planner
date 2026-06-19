# Trao — AI Travel Planner 🌍✈️

A production-ready, multi-user AI travel planner powered by **Google Gemini 2.5 Flash**. Generate complete day-by-day itineraries, realistic budgets, hotel recommendations, and AI-powered packing checklists — all in seconds.

## Stack
- **Backend**: Node.js + Express.js + Mongoose
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: MongoDB Atlas
- **AI**: Google Gemini 2.5 Flash
- **Auth**: JWT + bcryptjs

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI, JWT_SECRET, and GEMINI_API_KEY in .env
npm install
npm run dev
```
Backend runs at: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret for JWT signing |
| `GEMINI_API_KEY` | Google AI Studio API key |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:5000) |

## Getting Your API Keys

1. **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster → Get connection string
2. **Gemini API Key**: [aistudio.google.com](https://aistudio.google.com/app/apikey) → Create API key

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login & get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/trips` | List user's trips | Yes |
| POST | `/api/trips` | Generate AI trip | Yes |
| GET | `/api/trips/:id` | Get trip by ID | Yes |
| PUT | `/api/trips/:id` | Update trip | Yes |
| DELETE | `/api/trips/:id` | Delete trip | Yes |
| POST | `/api/trips/:id/regenerate-day` | Regenerate a specific day | Yes |

## Features
- 🤖 **AI Itinerary Generation** — Full day-by-day plans via Gemini 2.5 Flash
- 🏨 **Hotel Recommendations** — Budget-matched hotel suggestions
- 💰 **Budget Breakdown** — Transport, accommodation, food, activities
- ⛈️ **Weather-Aware Packing** — Dynamic packing checklist based on climate
- ✏️ **Live Editing** — Add/remove activities, regenerate days with AI
- 🔒 **User Isolation** — JWT auth with strict per-user data access
- 🔄 **Exponential Backoff** — Resilient Gemini API retry logic

## Project Structure
```
ai-travel-planner/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/{User,Trip}.js
│   ├── controllers/{auth,trip}Controller.js
│   ├── routes/{auth,trip}Routes.js
│   └── server.js
└── frontend/
    ├── app/{layout,page,login,register,dashboard}/
    ├── components/{CreateTripForm,ItineraryCard,PackingList,HotelCard}.tsx
    ├── context/AuthContext.tsx
    ├── utils/api.ts
    └── types/index.ts
```
