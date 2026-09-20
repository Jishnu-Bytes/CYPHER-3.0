# CYPHER — Sovereign Civic Hazard Response Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

**CYPHER** is a sovereign civic incident reporting, AI triage, and rapid municipal dispatch platform designed for BRICS+ jurisdictions (India, Brazil, South Africa, Russia, China, UAE, Egypt, Saudi Arabia, Ethiopia, Iran).

It provides real-time emergency dispatch coordination, cross-dialect voice intake, sovereign ID document validation, and live citizen complaint tracking.

---

## 🌟 Key Features

1. **Multimodal Incident Intake (`/report`)**
   - Spoken dialect voice recording with Web Audio API.
   - Live camera capture with client-side canvas compression.
   - Comprehensive municipal category domains:
     - 🛣️ Roads & Highway Maintenance
     - 💧 Water Supply & Pipeline Breaches
     - 🚽 Sanitation & Sewage Overflow
     - 🌊 Drainage, Stormwater & Waterlogging
     - ⚡ Electricity, High-Voltage Grids & Transformers
     - 💡 Streetlights & Dark Corridors
     - 🚆 Public Transport & Transit Safety
     - 🏥 Healthcare Hazards & Medical Waste
     - 🚨 Disaster / Emergency, Floods & Civil Defense
     - 🗑️ Solid Waste Management & Illegal Dumps
     - 🏗️ Structural Safety & Flyovers

2. **Multilingual Sovereign AI Triage Engine**
   - Real-time multimodal analysis powered by the Gemini API (`@google/genai`).
   - Cross-lingual translation into standardized emergency dispatch protocol.
   - 5-tier hazard severity scoring (1 = Low to 5 = Critical Emergency).
   - Automated routing to designated municipal task forces and rapid repair squads.

3. **Citizen Verification & Document Verification**
   - Carrier-grade SMS simulation with OTP generation and verification (`/verify-phone`).
   - Sovereign identification card validation (Aadhaar, CPF, Smart ID, etc.) (`/verify-id`).
   - Digital cryptographic incident vouchers with SHA-256 integrity signatures.

4. **Real-Time Dispatch Tracking Portal (`/track`)**
   - Citizen incident status lookup by Reference ID or mobile number.
   - Live status synchronization via Socket.io.
   - 4-step lifecycle stepper (*Intake Logged* $\rightarrow$ *AI Triaged* $\rightarrow$ *Squad Dispatched* $\rightarrow$ *Resolved*).
   - Real-time municipal officer dispatch activity logs and SLA countdowns.

5. **Operational Command & Control Desk (`/admin`)**
   - High-throughput triage dashboard for emergency dispatchers.
   - Live socket status updates and instant dispatch squad reassignment.
   - Audio playback of citizen field voice recordings.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Jishnu-Bytes/CYPHER.git
cd CYPHER

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env (if using Gemini AI features)
```

### Development
```bash
npm run dev
```
The server will run on `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Backend / Server**: Node.js, Express.js, TypeScript, Socket.io
- **AI / Multimodal Triage**: Google Gen AI SDK (`@google/genai`), Gemini Models
- **Frontend**: Tailwind CSS, HTML5, Vanilla JS / React, FontAwesome, JetBrains Mono & Space Grotesk typography
- **Bundler & Build Tool**: Vite, esbuild

---

## 📄 License
This project is licensed under the MIT License.
