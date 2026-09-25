# CYPHER-3.0 — Autonomous Sovereign Civic Emergency Intelligence & Dispatch Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Sub--50ms-black.svg)](https://socket.io/)
[![Offline PWA / IndexedDB](https://img.shields.io/badge/IndexedDB-Offline--First-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

**CYPHER-3.0** is an enterprise, sovereign civic incident reporting, multimodal AI triage, and real-time municipal emergency dispatch system engineered for BRICS+ urban centers (India, Brazil, South Africa, Russia, China, UAE, Saudi Arabia, Egypt, Ethiopia, Iran).

It bridges the critical gap between chaotic citizen distress signals (vernacular voice recordings, photographic evidence, and location coordinates) and structured tactical emergency crews through cross-modal intelligence, strict human-in-the-loop safety gating, geospatial deduplication, and an offline-first storage buffer.

---

## 🏛️ System Architecture & Folder Structure

**CYPHER-3.0** enforces complete separation of concerns between client-side interfaces and server-side intelligence engines:

```
CYPHER-3.0/
├── backend/                             # Sovereign Backend Services & API Routing
│   ├── config/                          # Municipal Models, Tool Declarations & Security
│   │   ├── models.ts                    # Gemini 2.5 Flash standard model identifiers
│   │   ├── municipalTools.ts            # Agency lookup declarations & equipment rosters
│   │   ├── persistence.ts               # Local disk sync & JSON data persistence
│   │   └── security.ts                  # HMAC-SHA256 JWT tokens & DPDP authorization
│   ├── routes/                          # Express REST API Route Controllers
│   │   ├── authRoutes.ts                # Mobile OTP simulation & sovereign ID card verification
│   │   ├── reportRoutes.ts              # Intake, deduplication, HITL overrides & dispatch
│   │   └── systemRoutes.ts              # Diagnostic health, map config & repair verification
│   ├── services/                        # Core Sovereign Intelligence Services
│   │   ├── dedupService.ts              # 100m spatial clustering & 64D cosine vector similarity
│   │   └── geminiService.ts             # Gemini 2.5 Flash multimodal triage, OCR & inspection
│   ├── cache.ts                         # Upstash Redis REST client with in-memory token bucket
│   ├── geo.ts                           # WGS-84 Haversine equations & coordinate resolver
│   ├── seedData.ts                      # Pre-seeded multi-jurisdiction emergency tickets
│   ├── types.ts                         # Backend data contracts & incident schemas
│   └── server.ts                        # Express, Socket.IO, security & Vite dev middleware
│
├── frontend/                            # Unified React 19 Single-Page Application (SPA)
│   ├── components/                      # High-Density Operational React Components
│   │   ├── CitizenReportPortal.tsx      # Zero-friction citizen intake with audio & camera
│   │   ├── ComplaintTracker.tsx         # 5-stage SLA progression tracker & audit logs
│   │   ├── CrossModalContradictionAlert.tsx # Visual indicator for acoustic/vision mismatches
│   │   ├── DeduplicationCorrelationBadge.tsx# Multi-citizen corroboration signal badge
│   │   ├── DevToolbar.tsx               # Quick-trigger scenario tester (Presets A, B, C)
│   │   ├── GisCommandCenter.tsx         # Tactical dark-mode GIS command center
│   │   ├── GisMapCanvas.tsx             # Interactive SVG vector GIS canvas
│   │   ├── GoogleDarkMapCanvas.tsx      # Satellite & roadmap hybrid canvas
│   │   ├── HitlSafetyGateBanner.tsx     # Operator dispatch lock banner for L4/L5 hazards
│   │   ├── IncidentDetailCard.tsx       # Incident telemetry, equipment & crew checklist
│   │   ├── IncidentInspectorPanel.tsx   # Deep operational inspector with field confidence
│   │   ├── LiveTelemetryHUD.tsx         # Real-time WebSocket latency & model telemetry
│   │   ├── MunicipalAdminDesk.tsx       # High-contrast tabular queue for municipal operators
│   │   ├── SyncStatusIndicator.tsx      # IndexedDB offline buffer & HUD sync indicator
│   │   ├── TopCommandHeader.tsx         # HUD status bar with WebSocket, AI & Sync badges
│   │   └── UnifiedNavbar.tsx            # Universal top navbar with WCAG AAA theme switcher
│   ├── data/
│   │   └── presets.ts                   # Standardized incident test cases (7-in-1 cluster)
│   ├── hooks/
│   │   └── useIndexedDbSync.ts          # Reactive IndexedDB listener & network monitor
│   ├── services/
│   │   └── indexedDbService.ts          # Client offline storage engine & auto-replay worker
│   ├── App.tsx                          # Universal client router & theme persistence
│   ├── index.css                        # Tailwind CSS v4 design system
│   ├── main.tsx                         # React 19 client bootstrap entry point
│   └── types.ts                         # Frontend data models & theme types
│
├── public/                              # Static public assets, sound effects & docs
├── console.html                         # Dedicated GIS Command Center entry point
├── index.html                           # 3D Three.js WebGL globe landing page
├── server.ts                            # Root execution entry point delegating to backend
├── package.json                         # Scripts & full-stack dependencies
├── tsconfig.json                        # Path mappings (@frontend/*, @backend/*)
└── vite.config.ts                       # Vite 6 bundler configuration
```

---

## ⚡ Core Innovations & Features

### 1. Multimodal AI Triage (Gemini 2.5 Flash)
- **Vernacular Audio Normalization**: Ingests citizen voice notes in regional dialects (Hindi, Telugu, Tamil, Marathi, Brazilian Portuguese, Zulu, Russian, Mandarin), transcribes verbatim, and translates to standardized emergency dispatch English.
- **Computer Vision Analysis**: Analyzes physical damage evidence, estimates repair cost in USD, and recommends specialized equipment (insulated bucket trucks, dewatering pumps, hydraulic trench shoring).
- **Per-Field Confidence Scores**: Assigns fractional confidence (0.00–1.00) across category, summary, criticality, location, and crew recommendation.

### 2. Cross-Modal Contradiction Detection
- Cross-references citizen audio/text claims with visual photographic proof.
- *Example*: If an acoustic memo claims *"minor water leak"* but computer vision detects a 4.5ft storm deluge submerging a high-voltage 11kV electrical transformer, the system automatically flags `contradiction_detected: true`, escalates priority to **Criticality Level 5**, and locks automated dispatch.

### 3. Human-in-the-Loop (HITL) Safety Gate
- All **Level 4 (Severe)** and **Level 5 (Life-Safety Crisis)** hazards are locked under `status: "AWAITING_VALIDATION"`.
- Dispatch buttons are physically disabled until an authorized municipal operator validates visual proof and submits a signed cryptographic override.

### 4. Geospatial & Semantic Vector Deduplication
- **100-Meter Geospatial Boundary**: Evaluates incoming reports using the Haversine equation ($R = 6,371\text{ km}$).
- **64-Dimensional Semantic Vectors**: Calculates cosine similarity ($\ge 0.72$) between complaint embeddings.
- **Corroboration Clustering**: Automatically merges duplicate calls into a single master ticket, increments corroboration counters, and upvotes priority rather than dispatching duplicate squads.

### 5. Offline-First IndexedDB Buffer & HUD Sync Engine
- **Client Offline Storage (`indexedDbService.ts`)**: Persists citizen submissions in `cypher_offline_storage` during telecommunication outages or cellular tower failures.
- **HUD Sync Status Indicator (`SyncStatusIndicator.tsx`)**:
  - 🟢 **Cloud Synced (0 Pending)**: System verified online and synchronized.
  - 🟡 **Pending Upload ({N} Queued)**: Prompts field crews with an amber pulsing badge when local reports await upload.
  - 🔄 **Syncing Active**: Real-time spinner during background transmission.
  - 🔴 **Offline Buffer**: Queues submissions locally until reconnect.
- **Auto-Reconnection Sync Worker**: Hooks `window.addEventListener('online')` to auto-flush queued reports sequentially with zero data loss.

### 6. Zero-Knowledge ID Verification & Redaction
- Validates national identity cards (Aadhaar, CPF, Smart ID, Resident ID) while masking sensitive national numbers on-device prior to network transmission.
- Full compliance with India's **DPDP Act (2023)** and **GDPR**.

---

## 🖥️ User Interfaces & Route Map

| URL Route | Interface Module | Purpose & User Persona |
| :--- | :--- | :--- |
| `/` | `index.html` (Three.js 3D Planet) | Sovereign BRICS+ federation globe and language selector. |
| `/console` | `GisCommandCenter.tsx` | Tactical GIS spatial triage console with real-time HUD telemetry. |
| `/admin` | `MunicipalAdminDesk.tsx` | High-contrast tabular queue for city hall dispatchers and HITL releases. |
| `/report` | `CitizenReportPortal.tsx` | Multimodal citizen intake with voice note recording, photo evidence, and auto-GPS. |
| `/track` | `ComplaintTracker.tsx` | Public audit trail with 5-stage SLA progression and dispatch logs. |
| `/docs` | `docs.html` | Interactive technical specification viewer (`CYPHER-ARCH-SPEC-2026-V5`). |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (or `bun` / `pnpm`)

### 1. Clone the Repository
```bash
git clone https://github.com/Jishnu-Bytes/CYPHER-3.0.git
cd CYPHER-3.0
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Populate the required credentials:
```env
# Gemini API Key (Required for live AI multimodal triage & verification)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps API Key (Optional: for Google Maps satellite view)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Upstash Redis REST Credentials (Optional: falls back to in-memory cache)
UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

# Port Configuration
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:3000`**.
- GIS Command Console: `http://localhost:3000/console`
- Municipal Operations Desk: `http://localhost:3000/admin`
- Citizen Intake Portal: `http://localhost:3000/report`
- Complaint Tracker: `http://localhost:3000/track`

### 5. Production Build & Deployment
```bash
# Compile client bundle and package Node.js server
npm run build

# Start production server
npm start
```

---

## 📡 REST API Data Contracts

### 1. Incident Submission (`POST /api/reports/submit`)
- **Headers**: `Content-Type: multipart/form-data`
- **Fields**:
  - `citizenName` (string)
  - `verifiedPhone` (string)
  - `country` (string)
  - `problemDomain` (`Roads` | `Water` | `Power` | `Infrastructure` | `Drainage` | `Sanitation` | `Disaster`)
  - `location` (string)
  - `typedComplaint` (string)
  - `lat` (float, optional)
  - `lng` (float, optional)
  - `photo` (binary file, optional)
  - `audio` (binary file, optional)

### 2. Deduplication Check (`POST /api/reports/check-duplicate`)
- **Body**: `{ "location": string, "typedComplaint": string, "lat": number, "lng": number }`
- **Response**: `{ "duplicateDetected": boolean, "distanceMeters": number, "similarityScore": number, "existingTicket": object }`

### 3. Operator HITL Safety Release (`POST /api/reports/:id/override`)
- **Body**: `{ "operator_id": string, "override_reason": string }`
- **Response**: `{ "success": true, "report": object }`

### 4. Tactical Crew Dispatch (`POST /api/reports/:id/dispatch`)
- **Body**: `{ "operator_id": string, "unit": string }`
- **Response**: `{ "success": true, "report": object }`

### 5. System Health & Diagnostics (`GET /api/health`)
- **Response**: `{ "status": "ok", "app": "CYPHER - BRICS+ Civic AI Platform", "aiModel": "gemini-2.5-flash", ... }`

---

## 🛡️ Data Sovereignty & DPDP Compliance

- **No Third-Party Telemetry**: Zero Google Analytics, trackers, or foreign telemetry scripts.
- **Client-Side Canvas Masking**: All sensitive government identification numbers (Aadhaar UID, CPF, RG, Chinese Resident ID) are masked on the HTML5 canvas before network upload.
- **Ephemeral Storage**: Audio voice slices are parsed in-memory via Multer buffers; raw acoustic citizen recordings are never stored unencrypted on disk.

---

## 📄 License
This project is open-source software licensed under the [MIT License](LICENSE).
© 2026 CYPHER Sovereign Civic Systems Engineering Group.
