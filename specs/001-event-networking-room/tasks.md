# Tasks: Tech Event Social & Networking Rooms

**Input**: Design documents from `/specs/001-event-networking-room/`  
**Prerequisites**: [`plan.md`](./plan.md) (required), [`spec.md`](./spec.md) (required for user stories), [`data-model.md`](./data-model.md), [`contracts/`](./contracts/), [`quickstart.md`](./quickstart.md)  
**Tests**: Core unit, contract, and component test tasks are included per Constitution Principle V (Test-First Quality).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  

## Format: `[ID] [P?] [Story] Description with exact file path`

- **[P]**: Can run in parallel (different files, no shared state dependencies)
- **[Story]**: User story identifier (`[US1]`, `[US2]`, `[US3]`, etc.)
- Descriptions include exact file paths and quoted validation constraints from `data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build dependencies, and testing harness

- [x] T001 Initialize Vite React TypeScript project with Tailwind CSS in `package.json`, `vite.config.ts`, `tailwind.config.js`, and `postcss.config.js`
- [x] T002 [P] Install core runtime dependencies (`@supabase/supabase-js`, `lucide-react`, `qrcode.react`, `html5-qrcode`, `canvas-confetti`, `clsx`, `tailwind-merge`) and testing tools (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`) in `package.json`
- [x] T003 [P] Configure Vitest test runner, mobile viewport mock helpers (320px–375px), and test setup in `vitest.config.ts` and `tests/setup.ts`
- [x] T004 [P] Configure environment variable template isolating publishable keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in `.env.example` per Constitution Principle III

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, RLS policies, domain types, and shared UI primitives

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create declarative Supabase SQL migration in `supabase/migrations/20261102000000_event_networking_schema.sql` defining `rooms` (`slug text NOT NULL UNIQUE`, `title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 100)`, `category text NOT NULL CHECK (category IN ('hackathon', 'summit', 'meetup'))`, `creator_token text NOT NULL`), `attendees` (`display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 50)`, `role text NOT NULL CHECK (role IN ('Frontend', 'Backend', 'Fullstack', 'AI/ML', 'Mobile', 'UI/UX', 'Product', 'Founder', 'Other'))`, `skills text[] NOT NULL DEFAULT '{}'`, `intent text[] NOT NULL DEFAULT '{}'`, `avatar_color text NOT NULL DEFAULT '#6366f1'`), `connections` (`status text NOT NULL CHECK (status IN ('pending', 'connected', 'ignored'))`, `connection_type text NOT NULL CHECK (connection_type IN ('wave', 'qr_scan'))`, `UNIQUE (room_id, requester_id, recipient_id)`), and `announcements` tables with default-deny Row Level Security (RLS) enabled
- [x] T006 [P] Implement TypeScript database and domain entity contracts in `src/types/database.ts` and `src/types/models.ts` reflecting constraints from `data-model.md`
- [x] T007 [P] Implement Supabase client singleton with publishable anon key and JWKS token verification in `src/lib/supabase.ts`
- [x] T008 [P] Implement shared UI components with accessible touch targets (>= 44x44px) in `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/modal.tsx`, `src/components/ui/input.tsx`, `src/components/ui/toast.tsx`, and `src/components/ui/tabs.tsx`
- [x] T009 [P] Implement deterministic Initials badge and GitHub procedural avatar component in `src/components/AvatarBadge.tsx`
- [x] T010 [P] Implement high-contrast SVG / Canvas QR code display component in `src/components/QRCodeDisplay.tsx`
- [x] T011 Implement Supabase Anonymous Auth Provider and session hook (`signInAnonymously()`) in `src/features/auth/AuthProvider.tsx` and `src/features/auth/useAuth.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instant Room Creation & Frictionless Participant Onboarding (Priority: P1) 🎯 MVP

**Goal**: Event organizers can create open rooms with high-contrast join QR codes/URLs; attendees scan the QR code and complete a rapid 3-step micro-onboarding wizard (< 45s) into the live room session without passwords or OAuth redirects.

**Independent Test**: Create a room, verify URL/QR code renders; open join link in a 375px mobile viewport, complete the 3-step wizard in under 45 seconds, and verify the attendee profile is created in Supabase linked to `auth.uid()`.

### Tests for User Story 1 ⚠️
- [x] T012 [P] [US1] Unit test for onboarding wizard input validation and initials generator in `tests/unit/onboarding.test.ts`
- [x] T013 [P] [US1] Component test for mobile 3-step onboarding flow (< 45s timing, 44x44px touch targets) in `tests/component/onboarding-wizard.test.tsx`

### Implementation for User Story 1
- [x] T014 [US1] Implement room creation service and local creator token persistence in `src/features/room/room-service.ts`
- [x] T015 [US1] Implement Room Creation page with event category selector and title input in `src/features/room/CreateRoomPage.tsx`
- [x] T016 [US1] Implement Room Lobby / QR Share screen displaying high-contrast scannable QR code and copyable join URL in `src/features/room/RoomLobbyPage.tsx`
- [x] T017 [US1] Implement 3-step mobile Onboarding Wizard (Step 1: Display Name + Role chip, Step 2: Top 2–4 Skills, Step 3: Intent + Contact handle) in `src/features/onboarding/OnboardingWizard.tsx`
- [x] T018 [US1] Implement room join handler with Supabase anonymous sign-in and attendee profile persistence in `src/features/onboarding/onboarding-service.ts`

**Checkpoint**: At this point, User Story 1 delivers an independently functional MVP - rooms can be created and participants can join via QR code in < 45 seconds.

---

## Phase 4: User Story 2 - Attendee Directory Discovery & Multi-Faceted Exploration (Priority: P1)

**Goal**: Attendees can browse the live room directory, search participants by keyword, filter by roles and intents, and tap skill badges in a live skill cloud with sub-50ms latency.

**Independent Test**: Load room with 20+ participant profiles across diverse roles; verify instant search filtering, role chip toggling, and skill tag cloud clicks filter the visible cards with zero page reloads.

### Tests for User Story 2 ⚠️
- [x] T019 [P] [US2] Unit test for client-side fuzzy search and multi-facet filtering logic in `tests/unit/directory-filter.test.ts`

### Implementation for User Story 2
- [x] T020 [P] [US2] Implement attendee card component showing avatar, role badge, skills, intent, and availability indicator in `src/features/directory/AttendeeCard.tsx`
- [x] T021 [P] [US2] Implement interactive Skill Cloud and Role filter bar with sub-50ms responsiveness in `src/features/directory/DirectoryFilters.tsx`
- [x] T022 [US2] Implement expanded Attendee Detail modal/sheet with full bio and social handle links in `src/features/directory/AttendeeDetailModal.tsx`
- [x] T023 [US2] Implement Directory View with local cache and real-time subscription for incoming room attendees in `src/features/directory/DirectoryPage.tsx`

**Checkpoint**: User Stories 1 AND 2 are functional - attendees join rooms and immediately discover everyone present.

---

## Phase 5: User Story 3 - Peer-to-Peer Connection & Mutual Handshake (Priority: P1)

**Goal**: Enable participants to initiate mutual digital "Waves" and scan in-person QR badges, unlocking direct external contact channels (Telegram, LinkedIn, GitHub) upon mutual connection without in-app chat bloat.

**Independent Test**: User A waves at User B; User B receives real-time toast notification; User B waves back; verify both devices celebrate a "Mutual Match" and reveal contact buttons; verify in-person QR badge scan achieves immediate connection.

### Tests for User Story 3 ⚠️
- [x] T024 [P] [US3] Unit test for connection state transitions (`pending` to `connected` / `ignored`) in `tests/unit/connection-state.test.ts`

### Implementation for User Story 3
- [x] T025 [P] [US3] Implement connection database service (send wave, accept wave, record QR badge scan) in `src/features/connections/connection-service.ts`
- [x] T026 [US3] Implement Supabase Realtime broadcast listener for incoming wave toasts and mutual match alerts in `src/features/connections/WaveToastListener.tsx`
- [x] T027 [US3] Implement Mutual Match celebration modal with confetti (`canvas-confetti`) and revealed contact buttons in `src/features/connections/MutualMatchModal.tsx`
- [x] T028 [US3] Implement personal "My Badge" QR code display modal in `src/features/connections/MyBadgeModal.tsx`
- [x] T029 [US3] Implement in-app mobile camera QR scanner using `html5-qrcode` in `src/features/connections/QRBadgeScanner.tsx`
- [x] T030 [US3] Implement "My Connections" tab listing all saved and mutual contacts in `src/features/connections/ConnectionsPage.tsx`

**Checkpoint**: Core social networking loop complete - participants can wave, scan badges, and unlock external contact links.

---

## Phase 6: User Story 4 - Intelligent Role & Skill Matchmaking (Priority: P2)

**Goal**: Deliver deterministic rule-based matchmaking categorizing recommendations into "Complementary Team Matches" (cross-functional skill diversity for hackathons) and "Affinity Matches" (shared domain interests).

**Independent Test**: Pass two complementary profiles (Frontend + Backend, both with "Looking for Team" intent); verify recommendation engine ranks them #1 with explanatory match badge.

### Tests for User Story 4 ⚠️
- [x] T031 [P] [US4] Unit test for deterministic matchmaking engine (`calculateRoomMatches`) covering hackathon complementarity and summit cross-discipline rules in `tests/unit/matching-rules.test.ts`

### Implementation for User Story 4
- [x] T032 [US4] Implement deterministic matching engine functions in `src/lib/matching-rules.ts` adhering to the contract in `specs/001-event-networking-room/contracts/ui-api.md`
- [x] T033 [US4] Implement Matchmaker View with "Team Matches" and "Affinity Matches" tabs in `src/features/matching/MatchmakerPage.tsx`

**Checkpoint**: Intelligent matchmaker operational without external API dependencies or vector database complexity.

---

## Phase 7: User Story 5 - Organizer Live Command Center & Event Insights (Priority: P2)

**Goal**: Provide event organizers with real-time demographic visual charts (roles, skills, intents), broadcast announcements, participant moderation (ban), and 1-click sanitized CSV export.

**Independent Test**: Navigate to `/room/{slug}/dashboard`; verify role breakdown donut chart and skill counts match attendee data; post an announcement and verify all clients receive it; click Export CSV and verify file downloads.

### Tests for User Story 5 ⚠️
- [x] T034 [P] [US5] Unit test for demographic aggregation and CSV serialization in `tests/unit/organizer-analytics.test.ts`

### Implementation for User Story 5
- [x] T035 [US5] Implement organizer analytics service (metrics aggregation, CSV serializer, announcement publisher, ban action) in `src/features/organizer/organizer-service.ts`
- [x] T036 [US5] Implement Demographic Visualizations (CSS/SVG Donut Chart for roles, Bar Chart for intents, Tag Matrix for skills) in `src/features/organizer/DemographicCharts.tsx`
- [x] T037 [US5] Implement Organizer Command Center page with attendee roster, moderation ban buttons, and CSV export trigger in `src/features/organizer/OrganizerDashboardPage.tsx`
- [x] T038 [US5] Implement Pinned Announcement banner broadcast bar in `src/features/organizer/AnnouncementBanner.tsx`

**Checkpoint**: Organizers have full visibility into event composition, moderation tools, and exportable metrics.

---

## Phase 8: User Story 6 - Real-Time Presence & In-Person Availability Indicator (Priority: P3)

**Goal**: Allow attendees to toggle "Available to Chat Right Now" with a micro-location zone tag (e.g., "Table 14") with auto-expiration after 60 minutes.

**Independent Test**: Toggle availability on Device A; verify green presence indicator and zone tag appear on Device B; verify status expires after timeout.

### Tests for User Story 6 ⚠️
- [x] T039 [P] [US6] Unit test for 60-minute availability expiration and zone formatting in `tests/unit/presence-timer.test.ts`

### Implementation for User Story 6
- [x] T040 [US6] Implement Supabase Realtime Presence channel integration in `src/features/room/useRoomPresence.ts`
- [x] T041 [US6] Implement Availability Toggle UI with zone selector and auto-expiration countdown in `src/features/directory/AvailabilityToggle.tsx`

**Checkpoint**: In-person spatial presence and availability indicator operational.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive navigation, edge tunnel ingress, and end-to-end quickstart validation

- [x] T042 [P] Implement main application router, top navigation, bottom mobile navigation tabs, and error boundary in `src/App.tsx`
- [x] T043 [P] Implement Cloudflare Tunnel origin routing script and dev runner in `scripts/start-tunnel.sh` per Constitution Principle IV
- [x] T044 Verify mobile responsiveness (320px fluid width, minimum 44x44px touch targets, zero horizontal scroll) across all routes per Constitution Principle I
- [x] T045 Run full end-to-end quickstart validation scenarios 1 through 5 from `specs/001-event-networking-room/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**.
- **User Stories (Phase 3+)**:
  - **User Story 1 (P1)**: Can start after Foundational (Phase 2). Delivers MVP.
  - **User Story 2 (P1)**: Depends on US1 (requires attendee profiles to display in directory).
  - **User Story 3 (P1)**: Depends on US2 (requires attendee cards to initiate waves and badge scans).
  - **User Story 4 (P2)**: Can proceed in parallel with US3 after US2 is complete.
  - **User Story 5 (P2)**: Can proceed in parallel after US1 (aggregates room attendees).
  - **User Story 6 (P3)**: Depends on US2 (enhances attendee cards with presence).
- **Polish (Phase 9)**: Runs after desired user stories are complete.

### Parallel Execution Opportunities

```bash
# Parallel Phase 1 (Setup):
T002 (Dependencies), T003 (Vitest), T004 (Env Config)

# Parallel Phase 2 (Foundational):
T006 (Types), T007 (Supabase Client), T008 (UI Primitives), T009 (Avatar), T010 (QRCode)

# Parallel User Story 1 (Tests & UI):
T012 (Unit test), T013 (Component test)

# Parallel User Story 2:
T019 (Search test), T020 (Attendee Card), T021 (Filter Bar)

# Parallel User Story 3:
T024 (State test), T025 (Connection Service), T028 (Badge Modal)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (User Story 1: Room Creation + Rapid Onboarding < 45s).
3. **STOP & VALIDATE**: Create a room, scan QR code from a mobile phone, onboard in < 45 seconds. Demo MVP.

### Incremental Delivery (1-Hour Build Event Flow)
1. **Minute 0–15**: Setup + Foundational DB migration & Supabase client (Phase 1 & 2).
2. **Minute 15–30**: Room creation & rapid 3-step onboarding wizard (Phase 3: US1 MVP).
3. **Minute 30–45**: Live Attendee Directory + Search & Filters (Phase 4: US2).
4. **Minute 45–55**: Peer-to-Peer Waves + QR Badge Scan Handshake (Phase 5: US3).
5. **Minute 55–60**: Matchmaking suggestions & Organizer Live Dashboard with CSV Export (Phases 6 & 7).
