# Software Requirements Specification (SRS)
## AI-Enabled Scholarship and Fellowship Management System
### Ministry of Tribal Affairs (MoTA)

**Document Version:** 1.0
**Prepared For:** Smart India Hackathon (SIH) — Problem Statement, Ministry of Tribal Affairs
**Category:** Software | **Theme:** Smart Education

---

## Table of Contents

1. Introduction
2. Overall Description
3. Scheme Data Model (Reference Schemes)
4. Functional Requirements
5. AI / Intelligence Layer Requirements
6. Creative / Differentiating Features
7. External Interface Requirements (UI/UX Design Specification)
8. System Architecture & Technology Stack
9. Non-Functional Requirements
10. Data Requirements
11. Security & Compliance Requirements
12. Assumptions and Dependencies
13. Appendix

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for an **AI-Enabled Scholarship and Fellowship Management System** to be developed for the Ministry of Tribal Affairs (MoTA), Government of India. The system will provide a single, unified, configurable digital platform for the end-to-end administration of all MoTA scholarship and fellowship schemes for Scheduled Tribe (ST) students, replacing the current fragmented, multi-portal, largely manual process.

### 1.2 Scope
The system covers the complete lifecycle of scholarship/fellowship administration:

- Applicant registration and profile management
- Scheme discovery and application submission
- Document upload and AI-assisted verification
- Eligibility computation and scrutiny
- Merit-based / quota-based selection
- Communication and deficiency-resubmission workflows
- Post-selection and fellowship/scholarship management (disbursement tracking, renewals, progress reports)
- Administrative dashboards, analytics, and reporting

The system is designed as a **configurable platform**, capable of onboarding new schemes without code changes, and is initially validated against five existing MoTA schemes (see Section 3).

### 1.3 Intended Audience
- MoTA officials and scheme administrators
- State/District Nodal Officers and Institute Nodal Officers
- Selection Committee members
- ST student applicants (India and abroad)
- Development team / SIH evaluators

### 1.4 Definitions, Acronyms, Abbreviations

| Term | Meaning |
|---|---|
| MoTA | Ministry of Tribal Affairs |
| ST | Scheduled Tribe |
| PVTG | Particularly Vulnerable Tribal Group |
| NFST | National Fellowship for Scheduled Tribe Students |
| NOS | National Overseas Scholarship |
| DBT | Direct Benefit Transfer |
| PFMS | Public Financial Management System |
| OCR | Optical Character Recognition |
| NSP | National Scholarship Portal |
| INO | Institute Nodal Officer |
| RBAC | Role-Based Access Control |
| SIH | Smart India Hackathon |
| QS Ranking | Quacquarelli Symonds World University Ranking |

### 1.5 References
- `https://tribal.nic.in/ScholarshiP.aspx`
- `https://dbttribal.gov.in/AllScheme.aspx`
- Scheme documents: NFST (ARG45), NOS (AZKMI), Post-Matric (BVOBC), Pre-Matric (BPVGK), Top Class (A023B)

---

## 2. Overall Description

### 2.1 Problem Context
MoTA currently administers scholarship/fellowship schemes through **multiple disconnected portals**:

| Portal | Used By |
|---|---|
| `dbttribal.gov.in` | Pre-Matric, Post-Matric |
| `scholarships.gov.in` (NSP) | Top Class Education |
| `fellowship.tribal.gov.in` | National Fellowship (NFST) |
| `overseas.tribal.gov.in` | National Overseas Scholarship (NOS) |
| `repository.tribal.gov.in` | Thesis repository (NFST) |

This fragmentation causes manual scrutiny, repeated correspondence, multi-level verification delays, poor real-time visibility, and higher error/fraud risk. The proposed system unifies these into a **single platform with a configurable rules engine**, enhanced by AI-based document intelligence and analytics.

### 2.2 Product Perspective
A standalone, cloud-hosted (govt cloud / NIC / MeghRaj-ready) web platform with:
- Applicant-facing portal (self-service)
- Administrator/verifier/committee-facing portal
- AI/OCR microservice layer
- Reporting/analytics layer
- Notification layer (SMS/Email/WhatsApp)

### 2.3 Product Functions (Summary)
1. End-to-end digital application lifecycle management
2. Configurable, scheme-agnostic eligibility and document rules engine
3. AI-assisted document extraction, cross-document consistency checking, and deficiency detection
4. Transparent, rule-driven and merit-based selection with human-in-the-loop oversight
5. Applicant tracking, deficiency resubmission workflow, multi-channel notifications
6. Administrative dashboards and analytics across schemes, states, and processing stages
7. Predictive/interactive creative tools (eligibility simulator, visual selection waterfall, chatbot)

### 2.4 User Classes and Characteristics

| User Class | Description | Technical Proficiency |
|---|---|---|
| Applicant (ST Student) | Registers, applies, uploads docs, tracks status | Low–Medium; may be rural/first-generation digital user |
| Institute Nodal Officer (INO) | First-level document/physical verification | Medium |
| District/State Nodal Officer | Second/third-level scrutiny, pendency monitoring | Medium |
| MoTA Admin | Scheme configuration, secondary scrutiny, PFMS mapping | Medium–High |
| Selection Committee | Merit review, final selection decisions (NFST/NOS) | Medium |
| Indian Mission Official (Abroad) | Disbursement, monitoring for NOS scholars | Medium |
| System Administrator | Platform configuration, user/role management | High |

### 2.5 Operating Environment
- Web application, responsive (desktop + mobile browser)
- Optional WhatsApp/SMS bot interface for low-bandwidth/rural users
- Hosted on government-compliant cloud infrastructure (target: MeghRaj/NIC data center for production; any standard cloud for hackathon/demo)

### 2.6 Design and Implementation Constraints
- Must support Aadhaar-based authentication (Aadhaar Act 2016, Section 7, as referenced in NFST guidelines)
- Must integrate with PFMS for DBT disbursement
- Must support DigiLocker document fetch as an alternative to manual upload
- Data residency/compliance considerations for sensitive PII (Aadhaar, caste, income) — flagged as a production-readiness item (see Section 11)

---

## 3. Scheme Data Model (Reference Schemes)

The platform is validated against five live MoTA schemes, each with materially different rules — this variability is the core justification for a **configurable rules engine** rather than hardcoded per-scheme logic.

| Scheme | Code | Level | Income Cap | Age Limit | Portal (legacy) | Selection Method | Disbursement |
|---|---|---|---|---|---|---|---|
| Pre-Matric Scholarship | BPVGK | Class IX–X | ≤ ₹2.5L | None | dbttribal.gov.in / NSP | Rule-based auto-gate (uncapped slots) | Annual DBT, by 31 Oct |
| Post-Matric Scholarship | BVOBC | Class XI–PG | ≤ ₹2.5L | None | dbttribal.gov.in / NSP | Rule-based auto-gate (uncapped slots) | Annual DBT, by 31 Dec |
| Top Class Education | A023B | UG/PG @ 252 notified institutes | ≤ ₹6L | None | scholarships.gov.in (NSP) | Rule-based auto-gate (uncapped slots) | Annual, split: student + institute via PFMS |
| National Fellowship (NFST) | ARG45 | M.Phil / Ph.D | None | 36 yrs | fellowship.tribal.gov.in | Merit-ranked with 4-tier reservation waterfall (750 slots/yr) | Quarterly via PFMS-DBT |
| National Overseas Scholarship (NOS) | AZKMI | Master's / Ph.D / Post-Doc abroad | ≤ ₹6L | 32 / 35 / 38 yrs (tiered) | overseas.tribal.gov.in | Multi-priority tiered (QS rank → offer letter → interview), 20 slots/yr | Semester-based, foreign currency, via Indian Missions abroad |

### 3.1 Configurable Rule Dimensions (Rules Engine Schema)

| Dimension | Variants Observed | Config Field Type |
|---|---|---|
| Income ceiling | None / ₹2.5L / ₹6L | Nullable numeric field |
| Age ceiling | None / fixed / tiered by course level | Nullable numeric or tiered map |
| Academic threshold | None / 55% (with conditional waiver) | Nullable numeric + override rule |
| Quota type | Uncapped (demand-driven) / Fixed slots (competitive) | Enum |
| Reservation waterfall | None / ordered priority list with spillover | Ordered list config with spillover targets |
| Document checklist | Common + scheme-specific extras | Per-scheme document list |
| Verification hierarchy | 2-tier / 3-tier / committee-based / cross-border | Configurable workflow stages |
| Disbursement frequency | Annual / Quarterly / Semester (forex) | Enum |
| Selection method | Auto-gate / Merit-rank / Multi-priority tiered | Enum + associated logic module |

---

## 4. Functional Requirements

### 4.1 Applicant Registration & Profile Management
- FR-1.1: System shall support Aadhaar + mobile OTP-based registration.
- FR-1.2: System shall support DigiLocker-linked document fetch during profile creation.
- FR-1.3: System shall maintain a single applicant profile reusable across multiple scheme applications (supports cross-scheme deduplication, see 6.5).

### 4.2 Scheme Discovery & Application
- FR-2.1: System shall display eligible/likely-eligible schemes to an applicant based on entered profile data.
- FR-2.2: System shall render scheme-specific dynamic application forms based on the configured rules engine (Section 3.1).
- FR-2.3: System shall validate mandatory document checklist completeness before submission.

### 4.3 Document Upload & Verification
- FR-3.1: System shall accept document uploads (PDF/JPEG/PNG) per scheme-specific checklist.
- FR-3.2: System shall extract structured fields from uploaded documents using AI/OCR (Section 5.1).
- FR-3.3: System shall perform cross-document consistency checks (name, DOB, caste category, income figures) across all uploaded documents and the application form (Section 5.2).
- FR-3.4: System shall flag incomplete or inconsistent documents with a specific, human-readable deficiency reason (Section 5.5 — Explainable Status).

### 4.4 Eligibility & Scrutiny
- FR-4.1: System shall auto-compute eligibility against the scheme's configured rules (income, age, academic threshold, category).
- FR-4.2: System shall apply conditional rule overrides (e.g., NOS 55% mark waiver for QS Top-1000 admits).
- FR-4.3: System shall route flagged/borderline applications to the appropriate verification tier (INO → District/State Nodal Officer → MoTA), per scheme-configured workflow.
- FR-4.4: System shall support a deficiency-resubmission loop: applicant notified → resubmits corrected document → re-verification triggered.

### 4.5 Selection
- FR-5.1: System shall support **rule-based auto-gate selection** (Pre-Matric, Post-Matric, Top Class) — every eligible, verified applicant is selected; no ranking required.
- FR-5.2: System shall support **merit-ranked selection with reservation waterfall** (NFST) — priority order: Divyangjan (PwD ≥40%) → PVTG → Female ST → ST Others, with automatic spillover of unfilled slots to the next tier.
- FR-5.3: System shall support **multi-priority tiered selection** (NOS) — Priority 1 (enrolled in QS Top-1000) → Priority 2 (offer letter from QS Top-1000) → Priority 3 (committee interview, GRE/GMAT/TOEFL preference), with subject-discipline slot allocation (STEM/Management/Agri-Medicine/Humanities).
- FR-5.4: All AI-assisted ranking/shortlisting shall require final human committee sign-off before selection is confirmed (human-in-the-loop, no fully automated final decision).

### 4.6 Communication & Notification
- FR-6.1: System shall send status notifications via Email, SMS, and in-portal alerts at every stage transition.
- FR-6.2: System shall optionally support WhatsApp/SMS-bot status queries for low-bandwidth users.

### 4.7 Post-Selection & Fellowship/Scholarship Management
- FR-7.1: System shall track joining formalities (e.g., 30-day joining window for NFST) and generate alerts on deadline approach.
- FR-7.2: System shall manage recurring disbursement cycles per scheme (annual / quarterly / semester-forex) and require submission of continuation/progress certificates before each release.
- FR-7.3: System shall support final-release gating (e.g., NFST final quarter released only after thesis upload to `repository.tribal.gov.in`-equivalent module).
- FR-7.4: System shall track leave/break provisions (maternity/paternity, intermittent break, academic leave) for fellowship tenure extension calculations (NFST).
- FR-7.5: System shall support overpayment/recovery tracking and fraud-cancellation workflows (per NOS rules: fraudulent documents, course abandonment, unlawful conduct abroad).

### 4.8 Administration & Configuration
- FR-8.1: System shall provide a no-code/low-code **scheme configuration module** allowing admins to define: eligibility rules, document checklist, quota type, reservation waterfall, verification workflow, disbursement frequency, and selection method for any scheme (new or existing) without a code deployment.
- FR-8.2: System shall provide role-based access control (RBAC) across all user classes defined in Section 2.4.
- FR-8.3: System shall maintain a full audit trail of every verification/selection/disbursement action (who, what, when).

### 4.9 Dashboards & Reporting
- FR-9.1: System shall provide MoTA-level dashboards showing applications by scheme/state/status, verifier turnaround time, selection statistics, and disbursement status.
- FR-9.2: System shall support drill-down analytics by state, category, institute, and processing stage.

---

## 5. AI / Intelligence Layer Requirements

### 5.1 AI Document Analysis (OCR / Document Intelligence)
- Extracts structured fields (name, DOB, caste category, income figure, marks, institution name, etc.) from uploaded scanned/photographed documents.
- Implementation approach: **Gemini API (multimodal, e.g., Gemini 2.5 Flash/Pro)** used specifically for the extraction layer — image/PDF in, structured JSON out.
- Gemini handles OCR + layout understanding only; all eligibility computation, cross-document matching, and waterfall/priority logic is implemented as **deterministic business logic** in the platform's own rules engine (not delegated to the LLM) — this separation is a deliberate design decision to keep selection logic auditable and explainable.
- Accuracy on handwritten/vernacular-language documents (common for income/caste certificates) must be validated specifically; do not assume typed-English-document benchmarks transfer.

### 5.2 Cross-Document Matching
- Validates consistency of name, date of birth, caste category, and income figures across all documents submitted for a single application and against the application form itself.
- Flags mismatches (e.g., income certificate shows ₹2.8L but application form states ₹2.4L, crossing the ₹2.5L threshold) as high-priority deficiencies, since such errors directly affect eligibility outcomes.
- Detects duplicate bank account numbers or duplicate Aadhaar usage across multiple applications (fraud signal, see 6.5).

### 5.3 Eligibility Assistance
- Auto-scores/ranks applicants against configured scheme criteria (merit order, QS ranking tier, reservation category).
- For NOS: auto-fetches/checks applicant's admitted/offer-holding university against the live QS World Ranking Top-1000 list to auto-tag Priority 1/2/3.
- Output is a **recommendation with rationale**, not a final decision — selection committee retains sign-off authority (FR-5.4).

### 5.4 QR-Based / Digital Certificate Verification
- Where applicable, validates digitally-issued certificates (e.g., e-caste certificates, DigiLocker-issued documents) via QR code or issuing-authority API lookup, reducing manual authenticity verification.

### 5.5 Bottleneck Detection
- Analyzes processing-time data across states, institutes, and verification tiers to identify systemic delays (e.g., "District X's average scrutiny time is 3x the national median").
- Surfaces this as an admin-facing analytics view, not applicant-facing.

### 5.6 Explainable Status
- Every "pending" or "rejected" status shown to an applicant is accompanied by a specific, human-readable reason (e.g., "Income certificate illegible — please re-upload" or "Name mismatch: certificate shows 'Ramesh K.', application shows 'Ramesh Kumar' — please clarify").
- Applies to both document-level deficiencies and selection-stage outcomes (e.g., why an NFST candidate was moved from PVTG-priority to Female-priority due to spillover).

---

## 6. Creative / Differentiating Features

These features extend beyond baseline compliance with the problem statement and are intended to differentiate the solution during evaluation.

### 6.1 Scholarship Twin — Predictive Eligibility Simulator
Before starting a full application, the applicant enters basic details (class/course, income, category, marks) and receives instant, non-binding match estimates across all schemes, e.g.:
> "You likely qualify for: NFST (87% match), Top Class (62% match). NOS: blocked — income ₹6.2L exceeds ₹6L cap."
Reduces wasted/ineligible applications and administrative junk-filtering load.

### 6.2 Deficiency Heatmap
AI analyzes historical rejection patterns by document type, scheme, and state/region (e.g., "Income certificates from a given state are rejected at a higher-than-average rate due to a common format issue"). At upload time, the applicant is proactively warned if their document type has a high historical rejection rate for their region, before submission rather than after.

### 6.3 Spillover Visualizer
An animated flow/Sankey-style visualization rendering the live reservation waterfall in real time — e.g., NFST's Divyangjan → PVTG → Female → ST Others cascade, or NOS's Priority 1 → 2 → 3 progression — showing seats moving between categories as selection is processed. Converts an otherwise invisible policy rule (a reservation matrix in a PDF) into a visible, demonstrable proof of fair, rule-driven allocation.

### 6.4 Digital Twin of the Applicant Journey
A visual, timestamped timeline per applicant: Registration → Document Upload → Flagged → Resubmitted → Verified → Selected → Disbursed, with an AI confidence/status indicator at each gate. Makes the "Explainable Status" requirement (5.6) tangible and demoable rather than abstract.

### 6.5 One Nation One Scholarship ID — Cross-Scheme Deduplication Engine
A single Aadhaar-linked applicant identity spans all schemes on the platform. The system automatically blocks or flags cross-scheme double-dipping (explicitly prohibited in the source scheme rules — e.g., Top Class vs. Post-Matric mutual exclusion) and detects fraud patterns such as the same bank account appearing across multiple distinct applications.

### 6.6 AI Committee Assistant (NOS)
For the National Overseas Scholarship — the most procedurally complex scheme — the system automatically fetches the live QS World University Ranking, tags each applicant into Priority Tier 1/2/3 accordingly, and computes forex-adjusted maintenance allowance (USD/GBP-equivalent) using live exchange rates. The Selection Committee reviews a pre-sorted, rationale-annotated shortlist and makes the final decision (human-in-the-loop preserved per FR-5.4).

### 6.7 Scheme Recommendation Chatbot (Regional Language, Voice-Enabled)
A conversational assistant, available in Hindi/Odia/Gondi and other regional languages, that asks basic questions (class, income, marks) and recommends the appropriate scheme along with the exact document checklist — addressing the target demographic's often lower digital literacy and rural/first-generation-applicant profile.

### 6.8 SMS/WhatsApp-First Status Nudges
Given likely low-bandwidth conditions in target regions, status updates and "next step" nudges (e.g., "3/5 steps done — upload income certificate to proceed") are pushed via SMS/WhatsApp in addition to the web portal, rather than requiring repeated portal logins.

> **Recommended demo priority (not all 8 need full implementation):** Spillover Visualizer (visual impact), Scholarship Twin (interactivity), Scheme Recommendation Chatbot (inclusion narrative).

---

## 7. External Interface Requirements (UI/UX Design Specification)

### 7.1 Design Philosophy
Government-trust interfaces succeed through **restraint, not decoration** (reference: UIDAI, DigiLocker, income-tax e-filing portal). The UI shall avoid typical "AI-tool" visual tropes (gradients, glassmorphism, neon accents, mascot/sparkle iconography) in favor of a clean, high-trust, functional aesthetic.

### 7.2 Color Palette
- **Background:** Pure white / off-white (`#FFFFFF` or `#FAFAFA`)
- **Primary text:** Near-black (`#1A1A1A`), not pure black
- **Accent color:** Exactly one accent color (e.g., deep blue `#1A4D8F` or maroon `#8B2635`), used only for primary buttons, active/selected states, and links — nowhere else
- **Status indicators only:** Green (approved), Amber (pending/deficiency), Red (rejected) — shown as small badges/text, never as full-block colored backgrounds
- No gradients, no dark-mode toggle required for MVP

### 7.3 Typography
- One typeface family, two weights maximum (Regular, Semibold)
- Recommended: Inter or Noto Sans (Noto Sans additionally provides native Devanagari/regional-script support, relevant given the ST/rural user base)
- Visual hierarchy achieved through size and weight only — not color

### 7.4 Layout Principles
- Generous whitespace throughout (deliberate contrast to typically cramped government forms)
- Flat cards with a thin 1px border (`#E5E5E5`) or subtle shadow — never colored background blocks
- Left-aligned body text and form labels; no centered paragraphs
- Maximum content width ~900–1000px on desktop for readability

### 7.5 Component Guidelines
- **Buttons:** Solid accent-color fill for primary actions; outline/ghost style for secondary actions. No drop shadows or bevels.
- **Forms:** Labels placed above inputs (not floating labels, for clarity with rural/first-generation digital users); clear visible input borders; large tap targets (mobile-first design, since many applicants may be phone-only users)
- **Progress indicators:** Simple horizontal stepper (line + dots) rather than circular/gamified badges
- **Admin tables/dashboards:** Thin borders; zebra-striping optional; colored backgrounds reserved strictly for status flags

### 7.6 Explicit Exclusions
- No neon/purple-blue "AI tool" gradient aesthetics or blob shapes
- No emoji in UI copy
- No decorative icons — icons used only where they add functional meaning (upload, status)
- No animated confetti/celebration screens (inappropriate tone for a government scholarship-disbursement context)

### 7.7 Primary Screens
1. **Applicant Dashboard** — scheme match summary (Scholarship Twin), application status timeline (Digital Twin), document upload center, notifications
2. **Application Form (Dynamic)** — rendered per scheme configuration (Section 3.1)
3. **Document Upload & Status Screen** — per-document status with Explainable Status messaging
4. **Admin Verification Queue** — INO/Nodal Officer worklist with AI-flagged deficiency summaries
5. **Selection Committee View** — ranked/tiered shortlist with AI rationale, Spillover Visualizer, final sign-off action
6. **MoTA Analytics Dashboard** — cross-scheme, cross-state reporting, Deficiency Heatmap, Bottleneck Detection view
7. **Scheme Configuration Console** — no-code rules engine editor (admin-only)
8. **Chatbot Widget** — regional-language scheme recommendation assistant, accessible from all applicant-facing screens

---

## 8. System Architecture & Technology Stack

| Layer | Recommended Technology |
|---|---|
| Frontend (Applicant + Admin portals) | React (separate role-based builds/routes) |
| Backend / API | Node.js or Java Spring Boot, REST APIs |
| Primary Database | PostgreSQL (schemes, applications, users — relational, supports the configurable rules schema) |
| Document Storage | S3-compatible object storage |
| AI/OCR & Document Intelligence | Gemini API (multimodal, e.g., Gemini 2.5 Flash/Pro) for extraction; custom rules engine for eligibility/cross-document logic |
| Authentication | Aadhaar-based OTP + DigiLocker integration + Role-Based Access Control (RBAC) |
| Notifications | SMS gateway (e.g., MSG91/Twilio), Email (e.g., AWS SES), WhatsApp Business API, in-portal alerts |
| Analytics / Dashboards | Custom charts (Recharts/D3) or embedded BI (Metabase/Power BI) |
| Hosting (Production Target) | Government cloud (MeghRaj) / NIC data center for compliance; any standard cloud acceptable for hackathon/demo |

### 8.1 Architectural Layers
1. **Presentation Layer** — Applicant portal, Admin portal, Chatbot widget
2. **Application/Business Logic Layer** — Configurable rules engine (eligibility, quota, waterfall, selection-method modules), workflow engine (verification stages, deficiency loop)
3. **AI Services Layer** — Document extraction (Gemini), cross-document matching, eligibility-assist scoring, bottleneck/heatmap analytics
4. **Data Layer** — PostgreSQL (structured data), Object storage (documents), Audit log store
5. **Integration Layer** — PFMS (disbursement), DigiLocker (document fetch), Aadhaar authentication, QS Ranking data source, SMS/Email/WhatsApp gateways

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Application status and dashboard queries shall return within 2–3 seconds under normal load |
| Scalability | System shall support onboarding of additional schemes beyond the initial five without architectural redesign |
| Availability | Target 99.5% uptime for production deployment |
| Usability | Mobile-first responsive design; support for regional languages in applicant-facing screens |
| Accessibility | UI shall meet basic accessibility standards (readable contrast, large tap targets, screen-reader-compatible form labels) |
| Auditability | Every state-changing action (verification, selection, disbursement, configuration change) must be logged with actor, timestamp, and before/after values |
| Maintainability | New scheme onboarding shall be achievable via configuration (Section 4.8) without a code deployment |

---

## 10. Data Requirements

### 10.1 Core Entities
- **Applicant** — profile, Aadhaar reference, contact details, category, income, academic records
- **Scheme** — configuration record per Section 3.1 (eligibility rules, quota type, waterfall config, document checklist, workflow stages, disbursement frequency, selection method)
- **Application** — links Applicant to Scheme, tracks current stage/status
- **Document** — uploaded file metadata, extracted fields (AI output), verification status, deficiency reason
- **Verification Stage** — per-tier verification record (INO / District-State / MoTA / Committee), actor, decision, timestamp
- **Selection Record** — rank/tier assignment, waterfall/spillover trace, committee decision, rationale
- **Disbursement Record** — cycle (annual/quarterly/semester), amount, PFMS transaction reference, continuation-certificate status
- **Audit Log** — immutable action history across all entities

### 10.2 Data Retention & Integrity
- Income/caste/identity certificates: validity period tracked per scheme rule (e.g., valid for entire course duration where applicable)
- Duplicate-application detection keyed on Aadhaar ID and bank account number across all schemes (supports Section 6.5)

---

## 11. Security & Compliance Requirements

- **Authentication:** Aadhaar-based OTP authentication under Section 7 of the Aadhaar Act, 2016 (per NFST guideline reference); DigiLocker integration for verified document fetch
- **Authorization:** Strict Role-Based Access Control (RBAC) across Applicant, INO, Nodal Officer, MoTA Admin, Selection Committee, and Indian Mission (abroad) roles
- **Audit Trail:** Full logging of verification, selection, and disbursement actions (who approved what, when)
- **Data Residency (Open Item):** Government scholarship data (Aadhaar, income, caste category) is sensitive. Use of a third-party multimodal AI API (Gemini) for document extraction is acceptable for hackathon/demonstration purposes; for production deployment, data residency and hosting location must be evaluated against government cloud compliance mandates (MeghRaj/NIC). This is flagged as a future compliance consideration, not a solved item.
- **Fraud Controls:** Cross-scheme deduplication (Section 6.5), forged-document detection support, recovery/blacklisting workflow for confirmed fraud (per NOS rule: fraudulent documents, unauthorized course abandonment, unlawful conduct abroad)
- **Legal Jurisdiction:** Per NOS scheme terms, disputes fall under courts situated in the Union Territory of Delhi; this should be reflected in platform terms of use.

---

## 12. Assumptions and Dependencies

- PFMS integration is available/permissible for DBT disbursement tracking.
- DigiLocker API access is available for document verification.
- Live QS World Ranking data can be sourced (via API or periodically updated dataset) for NOS priority-tiering.
- Gemini API (or equivalent multimodal LLM) access is available for the hackathon/demo phase; production deployment may require a compliance-approved alternative or a data-residency agreement.
- SMS/WhatsApp Business API access is available for notification delivery.
- Regional-language chatbot content (Hindi/Odia/Gondi, etc.) will require dedicated content/translation resourcing beyond core engineering effort.

---

## 13. Appendix

### 13.1 Legacy Portals Being Consolidated
- `tribal.nic.in/ScholarshiP.aspx`
- `dbttribal.gov.in/AllScheme.aspx`
- `scholarships.gov.in` (NSP)
- `fellowship.tribal.gov.in`
- `overseas.tribal.gov.in`
- `repository.tribal.gov.in`

### 13.2 Scheme Codes Reference
| Code | Scheme |
|---|---|
| BPVGK | Pre-Matric Scholarship |
| BVOBC | Post-Matric Scholarship |
| A023B | Top Class Education |
| ARG45 | National Fellowship (NFST) |
| AZKMI | National Overseas Scholarship (NOS) |

### 13.3 Demo Priority Recommendation
For SIH presentation/demo purposes, prioritize building working prototypes of:
1. Configurable rules engine (Section 3.1/4.8) — proves the core "single platform" thesis
2. AI Document Analysis + Cross-Document Matching (Section 5.1–5.2) — proves AI value-add
3. Spillover Visualizer (Section 6.3) — visual differentiation
4. Scholarship Twin (Section 6.1) — interactive differentiation
5. Scheme Recommendation Chatbot (Section 6.7) — inclusion narrative

---

*End of Document*
