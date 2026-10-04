# CYPHER-3.0 — Autonomous Sovereign Civic Emergency Intelligence & Dispatch Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)[![Socket.io](https://img.shields.io/badge/Socket.io-Sub--50ms-black.svg)](https://socket.io/)[![Offline PWA / IndexedDB](https://img.shields.io/badge/IndexedDB-Offline--First-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)**CYPHER-3.0** is an enterprise, sovereign civic incident reporting, multimodal AI triage, and real-time municipal emergency dispatch system engineered for BRICS+ .It bridges the critical gap between chaotic citizen distress signals (vernacular voice recordings, photographic evidence, and location coordinates) and structured tactical emergency crews through cross-modal intelligence, strict human-in-the-loop safety gating, geospatial deduplication, and an offline-first storage buffer.

## 🏛️ System Architecture & Folder Structure

├── backend/                             # Sovereign Backend Services & API Routing
│   ├── config/                          # Municipal Models, Tool Declarations & Security
│   │   ├── models.ts                    # Gemini 2.0 Flash standard model identifiers
│   │   ├── municipalTools.ts            # Agency lookup declarations & equipment rosters
│   │   ├── persistence.ts               # Local disk sync & JSON data persistence
│   │   └── security.ts                  # HMAC-SHA256 JWT tokens & DPDP authorization
│   ├── routes/                          # Express REST API Route Controllers
│   │   ├── authRoutes.ts                # Mobile OTP simulation & sovereign ID card verification
│   │   ├── reportRoutes.ts              # Intake, deduplication, HITL overrides & dispatch
│   │   └── systemRoutes.ts              # Diagnostic health, map config & repair verification
│   ├── services/                        # Core Sovereign Intelligence Services
│   │   ├── dedupService.ts              # 100m spatial clustering & 64D cosine vector similarity
│   │   └── geminiService.ts             # Gemini 2.0 Flash multimodal triage, OCR & inspection
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
└── package.json                         # Scripts & full-stack dependencies
## ⚡ Core Innovations & Production Safeguards

### 1. Token-Cost Mitigation Pipeline (Gemini 2.0 Flash)
To prevent API token exhaustion from high-volume public audio streams, CYPHER abstracts large files prior to LLM processing. Raw input streams are transcribed into lightweight text strings using localized, edge-optimized compression. Gemini 2.0 Flash is strictly called on the resulting structured metadata templates, reducing operational overhead by up to 80% while retaining full dialect normalization (12+ regional languages).

### 2. Multi-Stage Ingestion Layer Security
CYPHER mitigates API spoofing and Sybil attacks via strict separation of concerns:
- **Frontend Layer:** Enforces client-side masking for national IDs to maximize citizen privacy.
- **Backend Ingestion Layer (`backend/config/security.ts`):** Validates all client-submitted packages via cryptographic HMAC signatures, cross-references hardware-level GPS locations, and enforces individual IP/OTP-bound Redis token-bucket rate limits.

### 3. Cross-Modal Contradiction Detection
The engine cross-references citizen audio/text claims with visual photographic proof. If an acoustic memo claims *"minor water leak"* but computer vision detects a 4.5ft storm deluge submerging a high-voltage 11kV electrical transformer, the system flags `contradiction_detected: true`, escalates priority to **Criticality Level 5**, and halts automated routing.

### 4. Hybrid Geospatial & Semantic Vector Deduplication
To handle dirty, unstructured public data without map clustering errors:
- **Spatial Fencing:** Group incoming incidents using an immediate 100-meter WGS-84 Haversine equation boundary (`geo.ts`).
- **Semantic Clustering:** Inside that geographical boundary, a 64-dimensional dense vector comparison evaluates text embeddings (`dedupService.ts`). Incoming reports scoring a Cosine Similarity ≥ 0.72 are consolidated under a single parent tracking ticket, eliminating dispatch duplicates.

### 5. Offline-First IndexedDB Buffer & HUD Sync Engine
Citizen submissions are cached locally via `indexedDbService.ts` during telecommunication outages or infrastructure crashes. When network connectivity is restored, the application background worker automatically handles safe, sequenced replay processing without user intervention.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Gemini API Key (Set as `GEMINI_API_KEY` in your environment variables)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com
   cd CYPHER-3.0
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development environment (starts both Express backend and Vite frontend):
   ```bash
   npm run dev
   ```
