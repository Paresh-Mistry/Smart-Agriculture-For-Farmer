# 🌾 Agrilink – Smart Agriculture Platform

---

## 📖 Overview

Agrilink is a full-stack smart agriculture platform built as a monorepo. It bridges the gap between traditional farming practices and modern data-driven decision-making by combining machine learning models, large language model (LLM) APIs, and a responsive web interface accessible to users with minimal digital literacy.

The platform supports farmers with intelligent crop selection, crop marketplace listings, real-time weather insights, mandi (market) pricing, and actionable crop-care guidance.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python FastAPI (REST API) |
| **Frontend** | Next.js 15 + React 19 |
| **ML Model** | Random Forest (scikit-learn) |
| **AI / LLM** | Google Gemini API (`google.generativeai`) |
| **Database** | PostgreSQL via SQLAlchemy |
| **Auth** | Email OTP + JWT (python-jose) |
| **Deployment** | Uvicorn (backend) + Node.js (frontend) |

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🌱 **Crop Recommendation** | ML-powered prediction using Random Forest based on soil, water, and environmental inputs |
| 🤖 **AI Farmer Assistant** | Conversational assistant powered by Google Gemini API; answers farmer queries in natural language |
| 🌿 **Weed Detection** | Detects field plant mismatches and provides remediation advice |
| 🛒 **Crop Marketplace** | Farmers list produce; buyers browse, request, and order crops with status tracking |
| 🌤️ **Weather Integration** | Real-time weather data from external API to inform planting decisions |
| 📊 **Mandi Price Feed** | Live crop market prices to help farmers choose high-value crops |
| 📈 **Analytics Dashboard** | Crop listing views, orders, and performance metrics for farmers and admins |
| 🔐 **OTP Authentication** | Secure email-based OTP login flow with JWT-protected subsequent requests |
| 📋 **LLM Crop Guidance** | Gemini-generated crop care reports: fertilizer schedule, growth phases, pest advice, NPK/pH, yield |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGRILINK ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────┐         ┌──────────────────────────────┐ │
│   │    FRONTEND       │         │           BACKEND            │ │
│   │ (Next.js 15 +    │   HTTP  │       (Python FastAPI)       │ │
│   │   React 19)      │◄───────►│  /auth /recommendation       │ │
│   │                  │         │  /crop /weather /mandi       │ │
│   └──────────────────┘         │  /weed /orders /chat         │ │
│                                 │                              │ │
│                                 │  ┌───────────┐ ┌──────────┐ │ │
│                                 │  │PostgreSQL │ │Gemini API│ │ │
│                                 │  └───────────┘ └──────────┘ │ │
│                                 └──────────────────────────────┘ │
│                                                                 │
│         External APIs: Weather API | Mandi Price API | SMTP    │
└─────────────────────────────────────────────────────────────────┘
```

### Backend Structure (`backend/app/`)

```
backend/app/
├── main.py              # FastAPI entry point; CORS, routers, Uvicorn
├── api/                 # REST API routers (cropLists, users, chat, weather, etc.)
├── config/
│   └── database.py      # SQLAlchemy engine & session factory
├── core/
│   ├── settings.py      # Pydantic-settings environment config
│   └── security.py      # OTP generation, JWT creation, SMTP dispatch
├── models/              # SQLAlchemy ORM models (crop, user, order, enums)
├── schemas/             # Pydantic request/response validation schemas
└── services/            # ML model artifacts, mandi pricing, fertilizer utilities
```

### Frontend Structure (`frontend/src/`)

```
frontend/src/
├── app/                 # Next.js App Router pages (auth, farmer, buyer roles)
├── components/          # Reusable UI: cards, forms, dashboard widgets, nav
├── hooks/               # Custom React hooks (geolocation, i18n, react-query)
├── services/            # Axios-based API client wrappers
├── types/               # TypeScript definitions (auth, crop, mandi, weather)
└── utils/               # Helper functions and React-Query key factories
```

---

## 🤖 AI & ML Components

### Crop Recommendation (Random Forest)

The recommendation engine uses a **Random Forest classifier** – an ensemble method that builds multiple decision trees and aggregates their outputs, reducing overfitting and providing probability estimates per crop type.

**Input Features:**
- Soil type (categorical)
- Nitrogen (N), Phosphorus (P), Potassium (K) content
- pH level
- Temperature (°C), Humidity (%), Rainfall (mm)
- Water availability
- Location / region

**Output:**
- Ranked list of recommended crops
- Confidence / probability score per crop
- Suitability rating: `high` / `medium` / `low`

### LLM Crop Guidance (Google Gemini)

A structured JSON prompt is sent to Gemini and the response is parsed and sanitized before being returned to the frontend. The guidance report covers:

| Field | Content |
|---|---|
| `fertilizer_schedule` | Week-by-week NPK application plan |
| `growth_phases` | Germination → Vegetative → Flowering → Harvest |
| `pest_advice` | Common pests, identification, and control measures |
| `water_schedule` | Irrigation frequency and volume |
| `planting_guide` | Seed depth, spacing, and sowing season |
| `harvest_info` | Maturity indicators and optimal harvest window |
| `yield_estimate` | Expected output per acre/hectare |
| `npk_requirements` | Detailed macro-nutrient needs |
| `ph_range` | Optimal soil pH for the crop |
| `market_price` | Current/expected price range |
| `storage_advice` | Post-harvest storage conditions and shelf life |

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/send-otp` | Send OTP to user's email |
| `POST` | `/auth/verify-otp` | Verify OTP; create user if new; return JWT |
| `GET` | `/auth/me` | Return authenticated user profile |
| `POST` | `/auth/complete-profile` | Update user profile after first login |
| `POST` | `/auth/upload-profile-image` | Upload and associate profile picture |
| `POST` | `/auth/logout` | Invalidate current session token |

### Crop Recommendation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recommendation/predict` | Single crop prediction using ML model |
| `POST` | `/recommendation/predict/batch` | Batch prediction – up to 50 records |
| `GET` | `/recommendation/crops` | List all crops supported by the model |
| `GET` | `/recommendation/model/info` | Model metadata (version, accuracy, training date) |
| `GET` | `/recommendation/model/features` | Input feature list and expected data types |
| `POST` | `/recommendation/generate` | LLM-powered crop guidance report via Gemini |

### Other Modules

| Module | Router | Description |
|---|---|---|
| Weather | `api/weather.py` | Fetch real-time weather data by location |
| Mandi | `api/mandi.py` | Market/mandi crop price feed |
| Analytics | `api/analytic.py` | Listing views, order stats, and performance metrics |
| Orders | `api/orders.py` | Create, track, and update crop purchase orders |
| Requests | `api/request.py` | Buyer crop-request management |
| Weed | `api/weed.py` | Weed detection and advisory endpoint |
| Chat | `api/chat.py` | In-app messaging between farmers and buyers |
| Crop Lists | `api/cropLists.py` | CRUD operations for farmer crop listings |

---

## 🗄️ Database Models

### CropListing

| Field | Type / Notes |
|---|---|
| `id` | Integer primary key |
| `crop_name` | String |
| `quantity` | Float (kg) |
| `price_per_unit` | Float |
| `final_price` | Computed (with discounts) |
| `location` | String |
| `category` | Enum: Vegetables / Fruits / Cereals / Cash Crops |
| `status` | Enum: active / sold / pending |
| `farmer_id` | ForeignKey → User |
| `created_at` | DateTime |
| `views` | Integer (analytics counter) |

### User
Stores user identity, role (`farmer` / `buyer` / `admin`), profile image, and linked listings/orders.

### Order
Links buyer and farmer, references a `CropListing`, records quantity, price, and fulfillment status.

---

## ⚙️ Environment Configuration

### Backend (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost/agrilink
SECRET_KEY=your_secret_key
ALGORITHM=HS256
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_smtp_password
WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_API_URL=http://localhost:11434   # Optional local LLM fallback
DEFAULT_MODEL=gemini-pro
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Getting Started

### Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the server (tables auto-created on first run)
uvicorn backend.app.main:app --reload
```

API available at: `http://localhost:8000`  
OpenAPI docs at: `http://localhost:8000/docs`

### Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Application available at: `http://localhost:3000`

---

## 🔮 Future Roadmap

| Enhancement | Description |
|---|---|
| **Redis OTP Cache** | Move in-memory OTP storage to Redis for multi-instance deployments |
| **Frontend Route Protection** | Auth guards, token refresh, and role-based access control |
| **IoT Sensor Integration** | Real-time soil moisture, temperature, and humidity from field sensors |
| **Mobile Application** | React Native or PWA for smartphone access in rural areas |
| **AI Disease Detection** | Computer vision model to detect crop diseases from field photographs |
| **Automated Irrigation** | Smart irrigation controllers based on weather and soil moisture |
| **Enhanced Weed Detection** | Fine-tuned YOLO or EfficientNet model replacing current rule-based approach |
| **Government API Integration** | Live MSP and policy data from government portals |
| **Multilingual Support** | Hindi, Marathi, Tamil, and other regional languages |
| **Test Coverage** | Unit and integration tests for ML pipeline and Gemini response parsing |

---

## 📦 Key Dependencies

### Backend
`fastapi` · `uvicorn` · `sqlalchemy` · `psycopg2-binary` · `python-jose` · `pydantic-settings` · `scikit-learn` · `pandas` · `google-generativeai` · `opencv-python`

### Frontend
`next@15` · `react@19` · `axios` · `@tanstack/react-query` · `react-hook-form` · `zod` · `tailwindcss` · `recharts` · `framer-motion`

---

## 📄 License

© 2026 Agrilink – Empowering Farmers with Smart Technology. All rights reserved.
#### Created By - Paresh Mistry
