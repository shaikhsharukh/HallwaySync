# Quickstart Validation Guide: Tech Event Social & Networking Rooms

**Feature**: Tech Event Social & Networking Rooms  
**Target Architecture**: React (Vite) + Tailwind CSS + Supabase Cloud BaaS  
**Reference Docs**:
- Data Model: [data-model.md](./data-model.md)
- Realtime Contracts: [contracts/supabase-realtime.md](./contracts/supabase-realtime.md)
- UI/Client Contracts: [contracts/ui-api.md](./contracts/ui-api.md)

---

## 1. Prerequisites & Environment Setup

### 1.1 Local Runtime
- Node.js >= 18.x
- npm or pnpm

### 1.2 Supabase Project Configuration
1. Create or access a Supabase project at [database.new](https://database.new).
2. Under **Project Settings > Authentication > Providers**:
   - Enable **Anonymous Sign-ins**.
   - Under **Email**, set **Confirm email** to `false` (for instant testing).
3. Under **Database > Replication**:
   - Ensure the `connections` table is enabled for Supabase Realtime broadcast.
4. Set up environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
   ```

---

## 2. Declarative Schema Migration

Apply the declarative schema migrations defined in [data-model.md](./data-model.md):
```bash
# Apply SQL migration via Supabase CLI or SQL Editor in Dashboard
# Creates tables: rooms, attendees, connections, announcements
# Enables Row Level Security (RLS) policies
```

---

## 3. End-to-End Validation Scenarios

### Scenario 1: Frictionless Room Creation & QR Generation (Organizer Flow)

1. **Step**: Open the portal root `/` and click **Create Room**.
2. **Action**: Enter Event Name `"Supabase Hackathon Demo"`, Category `"Hackathon"`, click **Create**.
3. **Expected Outcome**:
   - App navigates to `/room/supabase-hackathon-demo`.
   - High-contrast scannable QR code is rendered on screen with a copyable join URL.
   - Secret `creator_token` is saved in `localStorage`.

### Scenario 2: Rapid Mobile Onboarding in < 45 Seconds (Attendee Flow)

1. **Step**: Scan the QR code or open `/room/supabase-hackathon-demo` on a mobile browser or mobile devtools viewport (375px).
2. **Action**:
   - Step 1 (Identity): Enter name `"Alex Chen"`, tap role chip `Frontend`.
   - Step 2 (Skills): Tap `TypeScript`, `React`, `Tailwind CSS`.
   - Step 3 (Intent): Tap `Looking for Team`, enter Telegram handle `@alexchen`. Click **Join Room**.
3. **Expected Outcome**:
   - Client executes `supabase.auth.signInAnonymously()`.
   - Profile inserts into `public.attendees` matching `auth.uid()`.
   - User lands in the live attendee directory in under 45 seconds with zero passwords or verification screens.

### Scenario 3: Real-Time Wave & In-Person Badge Scan (Networking Flow)

1. **Step**: Open a second browser tab (incognito / second device) and onboard as `"Sam Miller"`, role `Backend`, skills `Python`, `Supabase`, intent `Looking for Team`.
2. **Action A (Digital Wave)**:
   - On Alex's screen, locate Sam Miller's card and tap **Wave 👋**.
   - On Sam's screen, verify that an incoming wave notification toast appears within 500ms via Supabase Realtime.
   - Sam taps **Wave Back**.
   - **Verification**: Both devices transition to "Mutual Match" state, revealing Sam's and Alex's contact handle buttons.
3. **Action B (QR Badge Scan)**:
   - Sam taps **My Badge** to show their personal QR badge.
   - Alex taps **Scan Badge** and scans Sam's QR code.
   - **Verification**: Instant bidirectional connection logged; contact buttons unlocked immediately.

### Scenario 4: Deterministic Matchmaking Verification (Algorithm)

1. **Step**: On Alex's mobile device (role: `Frontend`, intent: `Looking for Team`), navigate to the **Matches** tab.
2. **Expected Outcome**:
   - Sam Miller is ranked as the #1 top recommendation.
   - Explanatory match badge displays: `"Complementary: Frontend + Backend for Hackathon Team"`.

### Scenario 5: Live Organizer Command Center & CSV Export

1. **Step**: In the organizer browser session, open `/room/supabase-hackathon-demo/dashboard`.
2. **Expected Outcome**:
   - Total Attendees displays `2`.
   - Role breakdown donut chart visualizes `50% Frontend, 50% Backend`.
   - Skill cloud displays `TypeScript, React, Python, Supabase`.
   - Organizer clicks **Export CSV**; browser immediately downloads `attendees-supabase-hackathon-demo.csv` containing the sanitized attendee directory.
