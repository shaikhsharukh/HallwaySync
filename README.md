# HallwaySync

> **Real-Time In-Person & Hybrid Tech Event Networking and Team Formation**  
> Powered by **Supabase Realtime**, **PostgreSQL**, **React 18**, **TypeScript**, and **Tailwind CSS**.

🌐 **Live Demo**: [https://vite.sharukhtech.com/](https://vite.sharukhtech.com/)

---

## ⚡ Overview

**HallwaySync** transforms chaotic hackathon hallway tracks, developer summits, and builder meetups into structured, high-energy networking hubs.

Organizers project a high-contrast dynamic QR code on stage screens. Attendees scan with their native smartphone camera to join in **under 45 seconds**—with zero app downloads and zero friction.

Attendees discover complementary teammates, send reciprocal connection waves, scan physical badges on the spot, and unlock direct contact handles only upon mutual match. Organizers monitor live demographic charts, moderate attendees, and broadcast critical stage announcements in real time.

---

## ✨ Key Features

- **🚀 Instant Room Creation & Stage Presentation Mode**
  - Launch rooms in 1 click with quickstart presets (*Supabase AI Hackathon*, *AWS Cloud Summit*, *Builders Meetup*).
  - High-contrast projector-ready QR code display with live attendee counters and full-screen toggle.

- **⏱️ Frictionless 45-Second Onboarding**
  - Anonymous session initialization with zero password or social login roadblocks.
  - Quick role selection (Frontend, Backend, AI/ML, Design, Product, Founder).
  - Multi-tag skills picker and availability toggle (Looking for Teammates, Offering Mentorship, Open to Chat).

- **📡 Live Attendee Directory & Realtime Presence**
  - Real-time online/offline presence tracking powered by Supabase Realtime Channels.
  - Multi-dimensional filters (Role, Looking For, Skills, Search query).
  - Proximity radar with automatic status expiration.

- **👋 Reciprocal Waves & Privacy-First Matching**
  - Asymmetric contact protection: Personal handles (GitHub, Twitter/X, Telegram, LinkedIn) remain hidden until both attendees wave at each other.
  - Confetti-celebrated mutual match modal with 1-click handle copy.

- **📷 QR Badge Camera Scanner & Personal Badges**
  - Integrated mobile camera QR scanner (`html5-qrcode`) to scan physical badges or neighbor screens instantly.
  - Personalized offline-capable QR badge modal.

- **📊 Organizer Command Center & Live Operations**
  - Real-time demographic breakdowns by role and team intent.
  - 1-click stage announcement broadcasting with priority toasts.
  - Attendee moderation with instant security-definer RPC banning.
  - Sanitized, spreadsheet-compatible CSV attendee export.

- **📱 Pixel-Perfect Mobile Responsiveness & SEO**
  - Fluid responsiveness down to 320px viewports with strict 44px minimum touch targets and 0 horizontal scroll.
  - Comprehensive Open Graph, Twitter Cards, Schema.org `WebApplication` structured data, `robots.txt`, `sitemap.xml`, and PWA manifest.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend & Database**: Supabase (PostgreSQL 15, Row-Level Security, Security Definer RPCs)
- **Realtime Layer**: Supabase Realtime Channels (Broadcast & Presence)
- **QR Utilities**: `qrcode.react`, `html5-qrcode`
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 🚀 Quickstart & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/shaikhsharukh/HallwaySync.git
cd HallwaySync
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and Anon Key:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
Execute the SQL migration located in [`supabase/migrations/20261102000000_event_networking_schema.sql`](supabase/migrations/20261102000000_event_networking_schema.sql) in your Supabase SQL Editor.

### 5. Run local development server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Verification & Testing

```bash
# Run unit & component tests
npm run test

# Type-check and production build
npm run build
```

---

## 📄 License

MIT © [Sharukh Shaikh](https://github.com/shaikhsharukh)
