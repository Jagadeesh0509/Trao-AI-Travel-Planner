# Trao — AI-Powered Travel Planner 🌍✈️

## Project Overview

Trao is a production-ready AI Travel Planner that helps users create personalized travel itineraries in seconds. Users can generate complete trip plans, discover recommended hotels, estimate budgets, view weather forecasts, manage packing checklists, and share itineraries publicly.

The platform combines AI-generated travel planning with practical travel tools in a single workspace, reducing the time and effort required to organize a trip.

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


# Technology Stack

## Frontend

* Next.js 16 (App Router)
* TypeScript
* Tailwind CSS v4

### Why?

* Next.js provides excellent performance, routing, and server-side capabilities.
* TypeScript improves maintainability and type safety.
* Tailwind CSS enables rapid UI development with consistent styling.

## Backend

* Node.js
* Express.js

### Why?

* Lightweight and scalable REST API architecture.
* Easy integration with AI services and MongoDB.

## Database

* MongoDB Atlas

### Why?

* Flexible document-based schema suitable for AI-generated travel data.
* Easy cloud deployment and scaling.

## Authentication

* JWT Authentication
* Google OAuth Sign-In
* bcryptjs Password Hashing

## AI Engine

* Google Gemini API

### Why?

* Generates personalized itineraries, travel recommendations, and travel assistance conversations.

---

# Setup Instructions

## Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

Application URLs:

* Frontend: http://localhost:3000
* Backend: http://localhost:5000

---

## Deployed Application

Frontend:
[Add Vercel URL]

Backend:
[Add Render/Railway URL]

---

# High-Level Architecture

```
User
 │
 ▼
Next.js Frontend
 │
 ▼
Express.js REST API
 │
 ├── Authentication Service
 ├── Trip Management Service
 ├── AI Planning Service
 ├── Weather Service
 ├── Sharing Service
 │
 ▼
MongoDB Atlas
```

### Flow

1. User creates or logs into an account.
2. User submits trip requirements.
3. Backend sends prompts to Gemini AI.
4. AI generates itinerary, recommendations, and travel insights.
5. Trip data is stored in MongoDB.
6. Frontend displays itinerary, weather, budget, and packing information.
7. Users can update, share, duplicate, or export trips.

---

# Authentication & Authorization

## Authentication

Trao supports:

### Email & Password Login

* Passwords are hashed using bcryptjs.
* JWT tokens are generated after successful login.

### Google OAuth

* One-click sign-in using Google Identity Services.
* New users are automatically registered.

## Authorization

Protected routes require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Each trip is linked to its owner.

Server-side validation ensures users can only:

* View their own trips
* Edit their own trips
* Delete their own trips

Public shared itineraries are accessible without authentication.

---

# AI Agent Design & Purpose

The AI Travel Agent is powered by Google Gemini.

### Responsibilities

* Generate personalized travel itineraries
* Recommend activities based on interests
* Suggest accommodations
* Create packing recommendations
* Provide travel assistance through chat
* Regenerate specific itinerary days

### Input

* Destination
* Duration
* Budget
* Interests
* Travel style

### Output

* Day-by-day itinerary
* Hotel recommendations
* Budget estimation
* Packing checklist
* Travel advice

The AI acts as a virtual travel consultant that continuously assists users throughout trip planning.

---

# Creative / Custom Feature

## Exploration Status Tracking Dashboard

One unique feature of Trao is the distinction between:

### Planned Trips

Trips created but not yet completed.

### Explored Countries

Countries that users have actually visited.

Users can mark trips as completed using an exploration status checkbox.

The analytics dashboard automatically updates:

* Total Trips
* Countries Explored
* Total Capital Investment
* Upcoming Trips

This prevents planned destinations from being incorrectly counted as visited countries and provides more meaningful travel statistics.

---

# Key Design Decisions & Trade-offs

## MongoDB vs SQL

Chosen:

* MongoDB Atlas

Reason:

* Flexible storage for AI-generated itinerary structures.

Trade-off:

* Less relational consistency compared to SQL databases.

---

## JWT Authentication

Chosen:

* Stateless JWT Authentication

Reason:

* Simpler scaling and deployment.

Trade-off:

* Tokens must be managed carefully and expire appropriately.

---

## AI-Generated Content

Chosen:

* Dynamic itinerary generation

Reason:

* Highly personalized travel plans.

Trade-off:

* Responses may occasionally vary in quality or detail depending on AI output.

---

## Session Isolation

Chosen:

* sessionStorage-based token management

Reason:

* Supports multiple logged-in accounts in separate browser tabs.

Trade-off:

* Sessions are tab-specific and do not automatically synchronize across tabs.

---

# Known Limitations

* Weather forecasts depend on third-party API availability.
* AI-generated itineraries may occasionally contain outdated or approximate recommendations.
* Maps currently provide route visualization but not live navigation.
* Public sharing is read-only and does not support collaborative editing.
* Travel costs are estimates and may differ from actual market prices.
* AI responses depend on external model availability and quota limits.

---

# Future Enhancements

* Multi-user collaborative trip planning
* Real-time flight integration
* Currency conversion support
* Offline itinerary access
* AI-powered budget optimization
* Mobile application release

---

# Author

Jagadeesh Peddireddy

Trao — AI-Powered Travel Planner
