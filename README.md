# Trao — AI-Powered Travel Planner 🌍✈️

Trao is a premium, production-ready AI travel planner powered by **Advanced Generative AI**. Instantly generate comprehensive day-by-day travel itineraries, discover matching hotels, compute itemized budget estimates, view local weather forecasts, pack using smart checklist recommendations, and easily share your plans with the world.

---

## 🌟 Premium Features

- 🤖 **AI-Powered Itinerary Generation** — Detailed daily routes and activities tailored to custom cities, trip durations, budget tiers, and traveler interests.
- 📊 **Interactive Analytics Dashboard** — Real-time metrics for **Total Trips**, **Countries Explored** (only unique regions actually completed/visited), **Total Capital Investment**, and **Upcoming/Scheduled Trips**.
- ✅ **Exploration Status Tracking** — Inline checkboxes and badges to separate *planned* trips from *explored/visited* countries.
- 🏨 **Smart Hotel Recommendations** — Budget-matched accommodation suggestions ranging from cozy hostels to premium luxury resorts.
- 💰 **Budget & Capital Estimations** — Interactive cost guides with visual percent breakdowns across transportation, lodging, dining, and activities.
- 🧳 **Dynamic Weather Packing Assistant** — Packing checklists generated based on the destination's season, travel styles, and climate notes. Pack items can be checked off in real time or regenerated dynamically.
- 📍 **Interactive Route Maps** — Visual markers and routes highlighting hotel lodging and daily activity spots.
- 💬 **Context-Aware Travel Assistant** — An AI chat companion right inside your workspace, ready to answer questions, suggest local dining, suggest packing lists, and help refine your trip details.
- ⛈️ **Weather Forecasts & Safety Advisories** — Live 7-day weather predictions showing temperature spreads, rain probabilities, conditions, and travel warnings (e.g. UV level warnings, sudden rainfall advisories).
- 📅 **Calendar Forecast Dates** — Real dates (e.g., Jun 19, Jun 20) computed dynamically relative to your trip starting date and mapped directly onto forecast days.
- 🔗 **Public Collaboration Links** — Share trip itineraries instantly with a clean public-view page format (no authentication required for viewers).
- 🖨️ **Clean PDF & Print Export** — Print your itinerary or save it as a PDF via a custom-styled printable sheet layout.
- 🔑 **Next-Gen Authentication & Session Isolation**:
  - JWT token auth with strict database isolation.
  - One-click Google OAuth Sign-in/Sign-up.
  - **Multi-Tab Session Isolation** (`sessionStorage` integrated) — Run multiple accounts on different tabs concurrently without state overlaps or sudden logouts.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS (v4)
- **Backend**: Node.js + Express.js + Mongoose (Object Modeling)
- **Database**: MongoDB Atlas (Cloud Cluster)
- **AI Engine**: Advanced Generative AI Model
- **Auth**: JWT (JSON Web Tokens) + Google Identity OAuth + bcryptjs

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ installed on your system
- A MongoDB Atlas database cluster ([cloud.mongodb.com](https://cloud.mongodb.com))
- A Google AI Studio API Key ([aistudio.google.com](https://aistudio.google.com))

---

### 1. Backend Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Duplicate the environment template and name it `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in the `.env` values (refer to [Environment Variables](#environment-variables) below).
4. Install dependencies:
   ```bash
   npm install
   ```
5. Launch the backend development server:
   ```bash
   npm run dev
   ```
   *The backend runs at `http://localhost:5000`*

---

### 2. Frontend App Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Create or verify the local environment file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend Next.js server:
   ```bash
   npm run dev
   ```
   *The client web application runs at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied)*

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
| Variable | Description | Default |
|---|---|---|
| `PORT` | Local port for Express API server | `5000` |
| `MONGO_URI` | MongoDB Atlas cluster connection string | *Required* |
| `JWT_SECRET` | Secret token string used for JWT session signing | *Required* |
| `GEMINI_API_KEY` | Google Studio API Key for AI Model generations | *Required* |
| `GOOGLE_CLIENT_ID` | Client ID for Google Identity Login authentication | *Required* |

### Frontend Configuration (`frontend/.env.local`)
| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Destination address of your API backend server | `http://localhost:5000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID for Google Identity login buttons | *Required* |

---

## 📡 REST API Documentation

All stateful endpoints (except Auth register/login and Public share views) require authorization header payloads (`Authorization: Bearer <JWT_Token>`).

### Authentication
- `POST /api/auth/register` — Register a new account with Name, Email, and Password.
- `POST /api/auth/login` — Login with traditional email/password credentials and receive a JWT.
- `POST /api/auth/google` — Log in / register automatically with a Google Sign-In credential credential.
- `GET /api/auth/me` — Fetch current user profiles.

### Trips & Workspace
- `GET /api/trips` — List all generated itineraries for the authenticated user.
- `POST /api/trips` — Build a new travel plan itinerary via AI.
- `GET /api/trips/:id` — Load full trip workspace details by database ID.
- `PUT /api/trips/:id` — Update trip details (itineraries, checklist packs, completed/visited exploration states).
- `DELETE /api/trips/:id` — Permanently delete an itinerary.
- `POST /api/trips/:id/duplicate` — Clone an itinerary (restarts with uncompleted state).
- `POST /api/trips/:id/regenerate-day` — Rewrite a specific day plan based on feedback instructions via AI.
- `POST /api/trips/:id/chat` — Context-aware messaging with the AI travel companion.
- `GET /api/trips/:id/weather` — Access or generate cached weather and warning reports.
- `GET /api/trips/:id/recommendations` — Fetch local custom recommendations.
- `POST /api/trips/:id/regenerate-packing` — Re-generate clothing lists according to custom travel styles/seasons.
- `GET /api/trips/public/:id` — Fetch shared public itineraries (*Authentication NOT required*).

---

## 📁 Architecture Directory Structure

```
ai-travel-planner/
├── backend/
│   ├── config/              # DB Connect configurations
│   ├── middleware/          # auth check middlewares
│   ├── models/              # Mongoose database schemas (User, Trip)
│   ├── controllers/         # API Business handlers (auth, trip)
│   ├── routes/              # Route path endpoints mapping
│   └── server.js            # Node Entry Point
└── frontend/
    ├── app/                 # Next.js App Router (register, login, dashboard, share)
    ├── components/          # Reusable React components (Analytics, Map, Cards, Chat)
    ├── context/             # React Context Providers (Auth, Toast notification systems)
    ├── utils/               # Fetch API wrappers
    └── types/               # Type Interfaces definitions (Activity, Hotel, Trip)
```
