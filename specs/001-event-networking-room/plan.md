# Implementation Plan: Tech Event Social & Networking Rooms

**Branch**: `001-event-networking-room` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-event-networking-room/spec.md`

## Summary

Build a mobile-first, high-velocity event networking web app for tech conferences, summits, and hackathons using Supabase Cloud BaaS. Organizers create open event rooms that generate high-contrast join QR codes. Attendees scan the QR code to enter instantly via Supabase Anonymous Auth (`signInAnonymously()`), completing a rapid 3-step micro-onboarding wizard (< 45s) to select their role, skills, and networking intent. Attendees explore the live directory with sub-100ms multi-tag filtering, connect via mutual digital "Waves" or in-person QR badge scans (unlocking Telegram/LinkedIn/GitHub handles), view deterministic complementary team matches, and signal real-time in-person chat availability. Organizers monitor live demographic charts and export sanitized attendee rosters via an administrative command center.

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node.js 18+ / React 18+ (Vite 5)

**Primary Dependencies**: 
- Frontend: `@supabase/supabase-js` (BaaS client), `tailwindcss` (responsive styling), `lucide-react` (icons), `qrcode.react` (badge & room QR generation), `html5-qrcode` (camera badge scanning)
- Utilities: `canvas-confetti` (mutual match celebration), `clsx`, `tailwind-merge`

**Storage**: Supabase Cloud PostgreSQL 15+ with declarative SQL schema migrations and Row Level Security (RLS) default-deny policies.

**Testing**: Vitest + React Testing Library (for unit and component tests); Playwright / mobile viewport regression testing.

**Target Platform**: Mobile-first Web Application (iOS Safari, Android Chrome, and in-app WebViews like Telegram, Slack, WeChat, LinkedIn) responsive down to 320px viewport width up to 4K desktop showcase displays.

**Project Type**: Single-Page Responsive Web Application (React + Vite + Supabase Cloud BaaS).

**Performance Goals**:
- Onboarding completion: < 45 seconds on mobile device.
- Directory search and multi-tag filtering: < 50ms latency for 500 loaded profiles.
- Real-time wave and announcement push: < 500ms via Supabase Realtime channels.
- Zero horizontal viewport scrolling across all standard viewports.

**Constraints**:
- Strict credential isolation: only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` bundled into client; `SUPABASE_SECRET_KEY` strictly prohibited.
- Mobile accessibility: minimum 44x44px touch targets.
- 1-hour build event scope: deterministic matching rules instead of vector embeddings; open room creation with client creator token instead of mandatory multi-tenant auth walls.

**Scale/Scope**: Up to 1,000 concurrent room attendees; optimized for a 1-hour hackathon build event.

## Constitution Check

*GATE: Evaluated against `/home/sharukh/ai-workspace/hackbuild/.specify/memory/constitution.md`*

- **Gate I: Mobile-Responsive & Adaptive UI (NON-NEGOTIABLE)**
  - *Evaluation*: Mobile-first layout with Tailwind CSS. Minimum width 320px fluid layout, minimum 44x44px touch targets, zero unintended horizontal scrolling.
  - *Status*: **PASS**

- **Gate II: Cloud-Native BaaS & Data Layer Security (Supabase Cloud)**
  - *Evaluation*: Uses managed Supabase Cloud PostgreSQL, Supabase Auth (`signInAnonymously()`), and Supabase Realtime. Default-deny PostgreSQL Row Level Security (RLS) policies declared and enforced on `rooms`, `attendees`, `connections`, and `announcements`.
  - *Status*: **PASS**

- **Gate III: Strict Credential & Secret Boundary Isolation (NON-NEGOTIABLE)**
  - *Evaluation*: Client bundle only references `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Zero secret service keys in source code or client distributions.
  - *Status*: **PASS**

- **Gate IV: Edge Tunnel Ingress & Showcase Alignment (Cloudflare Tunnel)**
  - *Evaluation*: App configured for origin routing via Cloudflare Tunnel (`*.sharukhtech.com`) over TLS for local development and public showcase demos.
  - *Status*: **PASS**

- **Gate V: Test-First Quality & Contract Verification**
  - *Evaluation*: Test-first test harness planned for matching algorithms, RLS policies, and mobile viewport responsive rendering.
  - *Status*: **PASS**

## Project Structure

### Documentation (this feature)

```text
specs/001-event-networking-room/
├── plan.md              # Implementation plan (this file)
├── research.md          # Architecture decisions & UX benchmarks
├── data-model.md        # PostgreSQL schema, RLS policies & state machines
├── quickstart.md        # Step-by-step end-to-end validation guide
├── contracts/
│   ├── supabase-realtime.md  # Realtime Presence & Broadcast channel payloads
│   └── ui-api.md             # TypeScript services and matching engine interfaces
└── checklists/
    └── requirements.md  # Spec quality validation checklist
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 20261102000000_event_networking_schema.sql  # Declarative tables, RLS policies, indexes

src/
├── components/          # Shared UI primitives
│   ├── ui/              # Button, Card, Badge, Modal, Tabs, Input, Toast
│   ├── AvatarBadge.tsx  # Initials + GitHub procedural avatar component
│   └── QRCodeDisplay.tsx# High-contrast scannable QR code generator
├── features/
│   ├── auth/            # Supabase anonymous auth provider & session state
│   ├── room/            # Room creation, share sheet, header, status
│   ├── onboarding/      # 3-step mobile micro-wizard (< 45s)
│   ├── directory/       # Live attendee roster, fuzzy search, tag filter cloud
│   ├── matching/        # Deterministic complementary & affinity match tabs
│   ├── connections/     # Wave toast, mutual match modal, QR camera scanner
│   └── organizer/       # Live command center, donut charts, announcements, CSV export
├── lib/
│   ├── supabase.ts      # Supabase client singleton
│   ├── matching-rules.ts# Pure deterministic matching algorithms
│   └── utils.ts         # Formatting, CSV export, initials generator
├── types/
│   ├── database.ts      # Generated Supabase DB types
│   └── models.ts        # App domain models & interfaces
├── App.tsx              # Router & global real-time notification listeners
└── main.tsx             # Application entry point

tests/
├── unit/
│   └── matching-rules.test.ts  # Deterministic matchmaking algorithm verification
├── integration/
│   └── supabase-rls.test.ts    # RLS boundary access tests
└── component/
    └── onboarding-wizard.test.tsx # Mobile onboarding flow & touch targets
```

**Structure Decision**: A single modern React + Vite application leveraging managed Supabase Cloud BaaS. Eliminates custom backend boilerplate while keeping full declarative schema migrations and RLS policies version-controlled under `supabase/migrations/`.

## Complexity Tracking

*No constitution violations. Architecture is strictly aligned with the 1-hour build event scope and all 5 constitutional principles.*
