# Feature Specification: Tech Event Social & Networking Rooms

**Feature Branch**: `001-event-networking-room`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "i want to build a web app using supabase, the idea of the app is to help people socialize in tech events like hackathon, aws summit etc. basically the oragnizer can create a room/hall for the event on this portal. once the room/hall is created the oragnizer is able to share qr code to scane / link with other people to join this room, when the user scans the qr code or open the shared link on thier phone, they join the orhanizers room. when participants join the room they go throuh simple onboarding steps to get few key details ( the onbarding is open for discussion as to how the wizard should look or what key details to take, delegate a subagent to do research on this) once they are oboarded, the organizer has the view of poeple they have joined the room and their details, also the people who joined the room will have some visibilty of there people and thier profile. later we need to provide certain level of insight to the organizer as to what kind of people has joinned the event (insight is open for discussion), and the platform should enable participant to connect with like minded people or to connect with different profile people like mae be a backend enginneer would be intrested to connect with an ai enginner, or a teach lead is looking to connect with a marketing executive of the product. (again how do we enable users to connect is open for discussion ) as the requirement has some abstraction i would like you to delegate necessary sub research agent that will help to refine the requirment"

## Clarifications

### Session 2026-11-02

- Q: How should event rooms control participant entry to prevent unauthorized or remote users from joining the room? (FR-001) → A: Open access via unique room URL / QR code with zero entry barriers (passcode/PIN protection explicitly deferred to future releases).
- Q: What should happen to an event room and its participant connections after the event's scheduled end date arrives? (FR-001) → A: Rooms remain permanently active and accessible without automated expiration or archival jobs, tightly focused on a 1-hour build event scope.
- Q: How should participant matchmaking recommendations be calculated within this 1-hour build event scope? (FR-008) → A: Deterministic role and skill pairing rules (cross-role matching for team seekers, same-skill for domain affinity); semantic vector matching (pgvector) preserved as future scope.
- Q: How should participant profile avatars be handled during the rapid mobile onboarding flow? (FR-004) → A: Deterministic initials badge with vibrant background styling plus automatic GitHub avatar lookup if handle is provided (zero file upload requirement).
- Q: How should event organizers authenticate to create and manage their event rooms on the platform? (FR-001) → A: Open room creation with zero mandatory organizer login or password walls (using local browser creator session / creator key for instant demoability); formal organizer accounts deferred to future scope.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instant Room Creation & Frictionless Participant Onboarding (Priority: P1)

An event organizer creates an event hall/room on the portal with an event title, description, and event type (e.g., Hackathon, Summit, Meetup). The system instantly generates a unique room link and a printable/displayable QR code. When an attendee arrives at the event venue and scans the QR code or clicks the shared link on their mobile device, they enter the room without being blocked by app-store installations or lengthy registration walls. They complete a rapid micro-onboarding flow in under 45 seconds to set their identity, role, and key interests, and immediately enter the live room.

**Why this priority**: Without room creation and rapid attendee onboarding, no participants can join or interact. In physical event environments (crowded registration booths, walk-ins), high friction or forced password creation causes over 60% user drop-off.

**Independent Test**: Can be independently verified by having an organizer create a room, generate a QR code, scan it from a mobile browser, complete onboarding in under 45 seconds, and confirm the participant appears in the room roster.

**Acceptance Scenarios**:

1. **Given** an organizer accesses the portal, **When** they submit a room creation form with title and event category, **Then** a distinct room URL, access code, and high-contrast QR code are generated and displayed on screen with download/projector display options.
2. **Given** an attendee scans the room QR code with a mobile camera, **When** the page opens in their mobile browser, **Then** they are greeted with a frictionless onboarding wizard that collects their display name, primary role chip, top 2–4 skills, and intent before placing them into the room.
3. **Given** an attendee leaves or refreshes their browser page during the event, **When** they re-open the room link, **Then** their participant profile and session remain intact without requiring them to re-enter their details.

---

### User Story 2 - Attendee Directory Discovery & Multi-Faceted Exploration (Priority: P1)

Once onboarded, an attendee can browse the live room directory to see who else is in the room. Attendees can search participants by name or keyword, filter by roles (e.g., Backend, Frontend, AI/ML, UI/UX, Product, Founder), filter by intents (e.g., "Looking for Team", "Hiring", "Open to Chat"), and tap skill badges in a live room skill cloud to filter attendees matching that specific skill.

**Why this priority**: Visibility into who is in the room is the foundational requirement for socialization. Attendees must be able to explore attendee cards quickly on mobile devices with zero lag.

**Independent Test**: Can be tested with a room containing multiple participant profiles across different roles; verify that filtering by role or intent instantly reduces the visible list to matching attendees, and clearing filters restores the full list.

**Acceptance Scenarios**:

1. **Given** an attendee is in the active room, **When** they view the directory tab, **Then** they see a card-based list of fellow attendees showing display name, role badge, top skills, and intent chips.
2. **Given** an attendee types a search query (e.g., "Python" or "Designer") or selects a role filter chip, **When** the filter is applied, **Then** the attendee list updates instantly (sub-100ms) to display only matching participants.
3. **Given** an attendee views another participant's card, **When** they tap the card, **Then** an expanded profile modal/sheet opens showing their full headline, bio, skills, intent, and authorized social/contact links.

---

### User Story 3 - Peer-to-Peer Connection & Mutual Handshake (Priority: P1)

Attendees need an intuitive, non-intrusive way to connect with others at the event. Attendees can bookmark profiles to their private "Saved Contacts" and initiate connection requests via a lightweight "Wave" gesture. When two attendees mutually wave at each other or scan each other's in-app personal QR badge in person, a verified "Mutual Connection" is unlocked, revealing direct external contact channels (e.g., Telegram handle, LinkedIn URL, GitHub profile, or email).

**Why this priority**: Enables the core business goal of connecting attendees while preventing unsolicited inbox spam and avoiding the heavy overhead of building and moderating an in-app messaging platform for an MVP.

**Independent Test**: Can be tested with two test participants; User A waves at User B, User B waves back, and both users immediately see the mutual connection state with unlocked contact shortcuts.

**Acceptance Scenarios**:

1. **Given** Participant A views Participant B's profile, **When** Participant A taps "Wave 👋", **Then** a wave interaction is recorded, and Participant B receives an unobtrusive real-time notification.
2. **Given** Participant B receives a wave from Participant A, **When** Participant B taps "Wave Back", **Then** a "Mutual Match" state is established, moving both into each other's "Connections" tab and displaying their designated contact handles.
3. **Given** two participants are standing together in person, **When** Participant A presents their in-app "My Badge" QR code and Participant B scans it using the in-app scanner, **Then** a verified bidirectional mutual connection is instantly established without waiting for an asynchronous wave back.

---

### User Story 4 - Intelligent Role & Skill Matchmaking (Priority: P2)

The platform provides intelligent recommendation tabs to help attendees connect with relevant people. For hackathons, a "Team Builder" algorithm recommends complementary profiles (e.g., pairing a Backend Developer with an AI Engineer and a UI/UX Designer who share an event track). For conferences and summits, a "Smart Match" algorithm pairs cross-discipline profiles (e.g., Tech Lead with Product Marketing, or Founder with Investor) as well as domain-affinity peers.

**Why this priority**: In large events with 100+ participants, manual directory browsing can be overwhelming. Automated recommendations guide attendees directly to high-value connections.

**Independent Test**: Can be tested by feeding participant profiles with complementary roles and intents (e.g., Backend looking for team + Frontend looking for team), and verifying they appear under the "Suggested Matches" section with an explanation of why they matched.

**Acceptance Scenarios**:

1. **Given** an attendee is in a hackathon event with the intent "Looking for Team", **When** they view the "Recommended Matches" tab, **Then** they see a curated list of participants with complementary skill sets and matching project tracks, along with a match explanation (e.g., "Complementary Skills: You have Python/Backend; they have React/UI").
2. **Given** an attendee with a leadership/founder role browses matches in a summit, **When** the system generates suggestions, **Then** it surfaces cross-functional profiles based on mutual intent alignment (e.g., Founder seeking Tech Lead).

---

### User Story 5 - Organizer Live Command Center & Event Insights (Priority: P2)

The organizer has access to a dedicated real-time dashboard for their room. The dashboard provides clear demographic breakdowns and attendance insights: total participants joined, distribution of roles (e.g., Donut chart of Backend, Frontend, AI/ML, Product, etc.), top skill clouds, distribution of participant intents (e.g., looking for teams vs hiring vs networking), and total connection interactions made. The organizer can also broadcast pinned announcements to all active participants and moderate inappropriate profiles.

**Why this priority**: Event organizers require visibility into attendee demographics to measure event success, report metrics to sponsors, facilitate team formation, and ensure venue safety.

**Independent Test**: Can be tested by generating 10+ participant joins with varying roles and skills, and verifying that the organizer dashboard aggregates the statistics correctly and updates live without full page reloads.

**Acceptance Scenarios**:

1. **Given** an organizer is viewing their room dashboard, **When** new participants join and complete onboarding, **Then** the demographic charts (role breakdown, skill distribution, intent mix) update in real-time.
2. **Given** an organizer needs to notify all attendees of an agenda shift (e.g., "Hacking starts in 10 mins at Hall B"), **When** the organizer posts a pinned announcement, **Then** a banner notification appears at the top of all attendee screens in that room within 1 second.
3. **Given** an attendee submits offensive or spam content, **When** the organizer selects "Remove Participant" from the attendee roster, **Then** the offending profile is immediately hidden from the directory and their active session access is revoked.
4. **Given** the event concludes, **When** the organizer clicks "Export Attendee Insights", **Then** a sanitized CSV/JSON report containing aggregate statistics and opted-in participant networking directories is downloaded.

---

### User Story 6 - Real-Time Presence & In-Person Availability Indicator (Priority: P3)

Attendees can toggle an "Available to Chat Right Now" indicator and set their current micro-location zone (e.g., "Table 12", "Main Hall", "Coffee Lounge"). To ensure information remains fresh, the availability status automatically expires after a configurable duration (default: 60 minutes) unless renewed.

**Why this priority**: Reduces the awkwardness of approaching people at in-person events by signaling who is open to impromptu conversations at that exact moment.

**Independent Test**: Can be tested by toggling "Available to Chat" on Participant A's device, checking that an active green indicator and location tag appear on Participant A's card on Participant B's screen, and verifying expiration behavior.

**Acceptance Scenarios**:

1. **Given** an attendee is open for conversation, **When** they toggle "Available to Chat" and select "Coffee Area", **Then** their card displays a prominent availability badge and location badge in the directory.
2. **Given** an attendee's availability timer reaches 60 minutes without renewal, **When** the timer expires, **Then** their status automatically transitions back to standard without manual intervention.

---

### Edge Cases

- **In-App Browser (WebView) Traps**: When attendees open QR code links inside apps like Telegram, WeChat, Slack, or LinkedIn, standard OAuth redirects can fail due to user-agent blocking. The system must allow immediate entry and session storage without external OAuth redirection barriers.
- **Intermittent Connectivity**: In crowded convention halls with congested Wi-Fi/cellular networks, client state must gracefully cache loaded directories and retry background requests with optimistic local UI updates.
- **Duplicate Connection Scanning**: If an attendee scans the same peer's QR code twice, the system must recognize the existing connection gracefully and open the peer's profile rather than creating duplicate records or throwing an error.
- **Stale Presence & Abandoned Rooms**: If an attendee closes their browser tab or leaves the venue without logging out, their active presence status must automatically expire within 60 minutes to prevent ghost availability indicators.
- **Profile Moderation & Bad Actors**: If a participant inputs offensive text, organizers have 1-click ban capability that immediately removes the profile from public queries.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow organizers to create an event room instantly by specifying an event name, optional description, event category (e.g., Hackathon, Summit, Meetup), and scheduled dates, without mandatory account registration or login walls for v1 demo (retaining administrative access via client-held creator session / key); entry into rooms is open via unique room URL / QR code with zero entry barriers or PIN gates.
- **FR-002**: System MUST generate a distinct, shareable URL and a scannable high-resolution QR code for every created room.
- **FR-003**: System MUST provide a rapid 3-step mobile onboarding wizard (< 45 seconds total) using an anonymous-first session to allow instant room entry without password or OAuth redirect blocks inside mobile WebViews, collecting display name, primary role, top 2–4 skills, and intent, with optional progressive account linking (via email or GitHub) later to preserve connections across devices.
- **FR-004**: System MUST capture core participant profile attributes including display name, primary professional role, top skill/interest tags (2–4 items), primary intent (e.g., looking for team, hiring, open to chat), and optional direct contact handle (e.g., Telegram, LinkedIn, GitHub); profile avatars MUST be generated automatically via deterministic styled initials badge or GitHub avatar URL if handle is provided, with zero photo file upload requirement.
- **FR-005**: System MUST facilitate peer-to-peer connections using a dual-mode mechanism: (1) an asynchronous mutual "Wave 👋" handshake with real-time notification toasts, and (2) an in-person physical badge QR scan using the mobile camera. Upon mutual connection or physical scan, the system unlocks direct external communication channels (e.g., Telegram handle, LinkedIn URL, GitHub profile).
- **FR-006**: System MUST provide instant keyword search and multi-tag filtering across the participant directory by role, skills, intent, and availability status.
- **FR-007**: System MUST provide an organizer analytics dashboard featuring real-time demographic visual charts (role breakdown donut chart, top skill matrix / word cloud, and intent distribution), a live attendee roster with search and moderation controls, and 1-click sanitized attendee CSV export.
- **FR-008**: System MUST provide deterministic matchmaking recommendations using rule-based pairing logic that categorizes potential connections into "Complementary Team Matches" (cross-functional skill diversity for hackathons) and "Affinity Matches" (similar technical or domain interests); advanced semantic vector embeddings (using Supabase pgvector) are preserved as future scope.
- **FR-009**: System MUST allow organizers to pin broadcast announcements that display as high-priority real-time alerts across all active attendee screens in the room.
- **FR-010**: System MUST allow organizers to view the full attendee roster, inspect individual profiles, and remove/ban disruptive participants with immediate effect.
- **FR-011**: System MUST support an optional "Available to Chat Right Now" toggle with self-expiring timeout (default 60 minutes) and optional micro-location zone tags (e.g., "Table 14", "Workshop Room A").
- **FR-012**: System MUST allow participants to progressively link or save their session (via email or GitHub) to access their saved event connections after the event or across multiple devices.
- **FR-013**: System MUST enforce strict mobile responsiveness across viewports from 320px up to desktop resolutions, with minimum 44x44px touch targets and zero horizontal viewport scrolling.

---

### Key Entities *(include if feature involves data)*

- **Event Room**: Represents a specific event hall or session. Key attributes: unique slug/code, title, description, category (hackathon/summit/meetup), organizer identity, access settings, active status, timestamps.
- **Participant Profile**: Represents an attendee's presence in a specific room. Key attributes: room reference, user identifier, display name, avatar/avatar preset, primary role, skills list (text tags), intent tags, contact links (Telegram/LinkedIn/GitHub), availability status, micro-location zone, moderation status.
- **Connection Interaction**: Represents an interaction between two room participants. Key attributes: requester participant reference, recipient participant reference, interaction type (bookmark, wave, mutual handshake, in-person badge QR scan), connection status (pending, connected, dismissed), created timestamp.
- **Room Announcement**: Broadcast message created by an organizer. Key attributes: room reference, author reference, title, message content, is_pinned flag, expiration/created timestamps.
- **Event Demographic Insight**: Aggregated summary calculated for the room. Key attributes: total attendees, role distribution histogram, skill frequency matrix, intent distribution, connection velocity count.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% of first-time attendees scanning the room QR code complete onboarding and land in the live room directory in under 45 seconds on mobile.
- **SC-002**: Onboarding completion rate from QR scan/link opening to room entry exceeds 85%.
- **SC-003**: Attendee directory search queries and multi-filter selections render filtered results within 100 milliseconds for rooms containing up to 1,000 active participants.
- **SC-004**: Real-time events (waves, mutual connection toasts, organizer broadcast announcements) propagate to all connected clients in the room within 1 second.
- **SC-005**: 100% of participant-facing screens and controls comply with mobile-first standards (fluid down to 320px width, minimum 44x44px touch targets, zero unintended horizontal scrolling).
- **SC-006**: At least 70% of active room participants successfully initiate or accept at least one peer connection or profile bookmark during an event session.
- **SC-007**: Organizers can generate and export a complete sanitized event insight summary and attendee directory in under 3 clicks.

---

## Assumptions

- **Device & Environment**: Attendees access the web app using standard mobile browsers (iOS Safari, Android Chrome, and common in-app WebViews like Telegram, Slack, or LinkedIn) on smartphones with camera access for QR scanning.
- **Frictionless Entry**: Fast event onboarding takes priority over strict identity verification; anonymous or passwordless lightweight entry is preferred for attendees at the door, with progressive account linking for post-event retention.
- **External Communication Handoff**: For the MVP phase, deep ongoing messaging is handed off to dedicated communication channels (Telegram, LinkedIn, GitHub, Email) upon mutual connection rather than requiring a complex in-app real-time chat infrastructure.
- **Organizer Access**: For the v1 1-hour build demo, room creation and management require no mandatory login/signup wall (retaining administrative access via client-held creator session or secret creator key); formal multi-tenant organizer accounts with passwords/OAuth are deferred to future scope.
- **1-Hour Build Scope**: The implementation is scoped strictly for a 1-hour hackathon build: room lifecycle cleanup, cron jobs, complex archiving, and payment/ticketing features are explicitly out of scope.
- **Real-Time Infrastructure**: Real-time status updates (presence, waves, announcements) utilize WebSocket channels, maintaining responsive mobile synchronization with minimal data overhead.
