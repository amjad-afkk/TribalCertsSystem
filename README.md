# AI-Enabled Unified Scholarship & Fellowship Management System
### Ministry of Tribal Affairs (MoTA), Government of India
**Developed for Smart India Hackathon (SIH) — Smart Education Theme**

---

## 🏛️ Project Overview
This platform unifies **5 previously fragmented, disconnected government scholarship portals** into a single, high-trust, AI-enabled digital infrastructure:

| Scheme Name | Code | Level | Quota & Selection Logic | Legacy Portal |
|---|---|---|---|---|
| **Pre-Matric Scholarship** | `BPVGK` | Class IX–X | Uncapped; Rule-based auto-gate | `dbttribal.gov.in` / NSP |
| **Post-Matric Scholarship** | `BVOBC` | Class XI–PG | Uncapped; Rule-based auto-gate | `dbttribal.gov.in` / NSP |
| **Top Class Education** | `A023B` | UG/PG @ 252 Notified Institutes | Uncapped; Rule-based auto-gate | `scholarships.gov.in` (NSP) |
| **National Fellowship (NFST)** | `ARG45` | M.Phil / Ph.D in India | 750 slots/yr; 4-tier reservation waterfall with spillover | `fellowship.tribal.gov.in` |
| **National Overseas Scholarship (NOS)** | `AZKMI` | Master's / Ph.D Abroad | 20 slots/yr; Multi-priority tiered (QS World Rank Top 1000) | `overseas.tribal.gov.in` |

---

## 🚀 Key Architectural & Creative Differentiators

1. **Configurable Declarative Rules Engine:**
   - Evaluates scheme eligibility dynamically (income caps, age limits, academic thresholds, course levels) without requiring code deployments.
   - MoTA administrators can onboard new schemes through the **No-Code Scheme Configurator**.

2. **AI Intelligence & OCR Separation:**
   - Multimodal OCR (Google Gemini API / offline heuristic fallback) handles document digitization and key-value extraction from certificates.
   - Cross-document consistency checking, deduplication, and eligibility math remain strictly in deterministic, auditable code.

3. **Spillover Visualizer (NFST Reservation Waterfall):**
   - Live visual simulation displaying how unfilled slots in higher-priority quotas dynamically cascade:
     $$\text{Divyangjan (PwD)} \longrightarrow \text{PVTG} \longrightarrow \text{Female ST (30\%)} \longrightarrow \text{Open ST Merit}$$
   - Ensures zero unutilized slots across tribal quotas with full mathematical auditability.

4. **Scholarship Twin (Predictive Eligibility Simulator):**
   - Instant pre-application screening tool that matches candidates across all 5 schemes in real time, preventing ineligible applications.

5. **One Nation One Scholarship ID (Fraud Prevention):**
   - Blocks cross-scheme double-dipping (e.g., concurrent benefits between Post-Matric and Top Class) and flags duplicate bank account usage across different Aadhaar IDs.

6. **AI Committee Assistant (NOS):**
   - Automatically cross-references university applications against the **QS World University Rankings Top 1000** and calculates foreign currency maintenance allowances (GBP/USD).

7. **Multilingual Regional Chatbot:**
   - Inclusivity assistant providing conversational guidance in **English, Hindi (हिन्दी), Odia (ଓଡ଼ିଆ), and Gondi (गोंडी)**.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Lucide Icons, Government-Trust Design System (Deep Navy `#1A4D8F`, Clean White/Off-White `#FAFAFA`).
- **Backend:** Node.js, Express, TypeScript, REST API.
- **Database:** SQLite via Node.js built-in `node:sqlite` (`DatabaseSync`) with referential integrity.
- **AI / OCR Layer:** `@google/generative-ai` multimodal SDK with automatic hybrid fallback.
- **Testing:** Node.js native test runner (`tsx --test`) with 100% pass rate.

---

## ⚡ Quick Start & Running Locally

### 1. Install Dependencies
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Seed Database
Populates the 5 MoTA reference schemes, QS Top-1000 universities, and realistic demo applicants:
```bash
npm --prefix server run seed
```

### 3. Run Backend API Server (Port 4000)
```bash
npm --prefix server run dev
```
Healthcheck: `http://localhost:4000/health`

### 4. Run Frontend Client (Port 5173)
```bash
npm --prefix client run dev
```
Open: `http://localhost:5173/`

### 5. Run Automated Test Suite
```bash
npm --prefix server test
```

---

## 🎭 SIH Demo Persona Walkthrough Guide

Use the **Demo Persona / RBAC Role** selector in the top-right header:

1. **Persona 1: Pooja Maravi (PVTG - Ph.D / NFST)**
   - View the active NFST fellowship application with the **Digital Twin Timeline**.
   - Notice the "Aadhaar e-KYC Verified" badge and clean One Nation One Scholarship ID check.

2. **Persona 2: Amitabh Gond (Deficiency Resubmission Demo)**
   - View how the AI Document Intelligence flagged an **Income Discrepancy** (Certificate ₹2.8L vs statutory cap ₹2.5L).
   - Enter clarification in the **Deficiency Resubmission Box** and submit to watch the status update to `RESUBMITTED`.

3. **Persona 3: Sunita Soren (NOS - Oxford University)**
   - Open **Selection Committee Portal** to see her tagged under **Priority Tier 1 (QS Rank #3)** with live GBP £15,400 forex calculation.

4. **Persona 4: State / Institute Nodal Officer**
   - Open **Nodal Scrutiny Queue** to review side-by-side dossiers and take verification actions.

5. **Spillover Visualizer Tab**
   - Click **Play Live Waterfall** to observe the animated reservation cascade.
