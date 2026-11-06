# Design Document: Apple-Inspired Light & Dark Mode with System Default

**Date:** 2026-11-06  
**Status:** In Review / Ready for Builder Check  
**Author:** Pair Programming Session  

---

## 1. Intent & The Why

HallwaySync is a high-tempo, in-person tech event networking and team formation application used at hackathons, conferences, and builder summits. Currently, the application is locked to a dark-only theme (`bg-surface-base`, dark cards, slate-100 text).

While dark mode fits nighttime coding and dark venues, users attending daylight conferences, outdoor campus halls, or bright convention centers experience glare and reduced readability. Introducing an Apple-inspired light and dark mode system—defaulting automatically to the user's operating system preferences—provides an accessible, polished, and effortless experience for every attendee.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **System Default Out of the Box:** New visitors automatically see the theme matching their OS / browser preferences without touching any controls.
- **Single-Tap Minimal Button:** A clean, tactile Apple-style header button cycling through `System (Auto)` → `Light` → `Dark` → `System`.
- **Intuitive Icon Metaphor:** Option A iconography:
  - `SunMoon` hybrid glyph for `System` (Auto)
  - `Sun` for `Light`
  - `Moon` for `Dark`
- **Zero Flash of Unstyled Theme (FOUC):** Page refreshes must never flicker white on dark or dark on white before hydration.
- **Apple Design Language:**
  - Light mode uses an Apple System gray canvas (`#F5F5F7`), clean white cards (`#FFFFFF`), subtle hairline borders (`#E2E8F0` / `#E5E7EB`), high-contrast slate typography (`#0F172A`), and soft diffusion shadows.
  - Dark mode preserves the existing deep slate canvas (`#0C0E12`), card surfaces (`#14171F`), and slate borders (`#2A3242`).
  - Supabase Emerald brand accent (`#3ECF8E` / `#059669`) is maintained across both themes.
- **Universal Availability:** The theme toggle is accessible on all screens: Room Creation, Event Lobby, Directory, Team Matches, My Connections, Onboarding Wizard, and Organizer Dashboard.
- **Live OS Listener:** When the preference is set to `System`, changes to the OS theme immediately reflect without requiring a reload.

### Non-Goals
- Custom theme tinting (e.g., custom accent colors or user-chosen hue themes).
- High-contrast accessibility theme separate from standard Apple Light / Dark modes (standard Apple contrast ratios satisfy WCAG AA).
- Server-side user profile sync of theme (theme preference is client/device-specific and stored in `localStorage`).

### Anti-Goals
- Complex multi-level dropdowns or settings dialogs for switching appearance (must remain a single-tap minimal interaction).
- Inconsistent color overrides or component-by-component hardcoding that breaks maintainability.
- Changing room QR code badges to inverted colors that fail physical scanner legibility (QR codes remain high contrast black-on-white).

---

## 3. Constraints

- **Stack:** React 18, Vite, TypeScript, Tailwind CSS 3.4 (`darkMode: 'class'`), Lucide React icons.
- **Mobile Touch Target:** Minimum 44×44px touch target on mobile viewports for Apple HIG compliance.
- **Offline / Local Fallback:** Must work completely without Supabase connection or backend auth.

---

## 4. How It Was Decided (User Decisions)

1. **Simplicity & Apple Aesthetic:** Clean, elegant, practical, and uncluttered UI following Apple HIG principles.
2. **Control Type:** Single-tap minimal button in the sticky top header, directly cycling modes on tap.
3. **Iconography:** **Option A** (`SunMoon` for System/Auto, `Sun` for Light, `Moon` for Dark) selected as the most intuitive visual metaphor.
4. **Default Mode:** Default to `'system'`.

---

## 5. Builder's Implementation Architecture (Calls Made by Builder)

### 5.1 Storage & Theme Resolution Hook (`useTheme`)
- **Key:** `localStorage.getItem('theme')` with type `Theme = 'system' | 'light' | 'dark'`.
- **Default:** `'system'`.
- **Resolved Theme:** `ResolvedTheme = 'light' | 'dark'`.
- **System Listener:** `window.matchMedia('(prefers-color-scheme: dark)')` with event listener for `change` events.
- **DOM Mutation:** Adds or removes the `dark` class from `document.documentElement` (`<html>`). Sets `color-scheme: light dark` or `light` / `dark` accordingly.

### 5.2 Flash Prevention (FOUC)
In `index.html` within `<head>`:
```html
<script>
  (function() {
    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored || stored === 'system') && prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  })();
</script>
```

### 5.3 Color Tokens in Tailwind & CSS
In `src/index.css`:
```css
:root {
  --color-surface-base: #f5f5f7;
  --color-surface-card: #ffffff;
  --color-surface-raised: #ffffff;
  --color-surface-hover: #f1f5f9;
  --color-surface-border: #e2e8f0;
  --color-surface-highlight: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
}

.dark {
  --color-surface-base: #0c0e12;
  --color-surface-card: #14171f;
  --color-surface-raised: #1b202a;
  --color-surface-hover: #242b38;
  --color-surface-border: #2a3242;
  --color-surface-highlight: #363f52;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
}
```
In `tailwind.config.js`:
Map `surface.*` colors to `var(--color-surface-*)` and establish smooth color transitions. Update `text-slate-100` root styling to `text-slate-900 dark:text-slate-100`.

### 5.4 Theme Toggle Component (`ThemeToggle.tsx`)
- Rendered in the top sticky header of `App.tsx`.
- Button shows:
  - If `theme === 'system'`: `<SunMoon className="w-4 h-4 text-brand-600 dark:text-brand-400" />` + optional accessible text / tooltip.
  - If `theme === 'light'`: `<Sun className="w-4 h-4 text-amber-500" />`.
  - If `theme === 'dark'`: `<Moon className="w-4 h-4 text-sky-400" />`.
- `aria-label`: "Switch theme (currently [theme], rendered as [resolvedTheme])".
- Clicking cycles: `system` → `light` → `dark` → `system`.

---

## 6. Verification and Testing Plan

1. **Unit Tests (`tests/unit/theme.test.ts`):**
   - Verify initial state defaults to `system`.
   - Verify cycling sequence: `system` → `light` → `dark` → `system`.
   - Verify `localStorage` persistence and retrieval.
   - Verify DOM `<html>` class updates (`classList.contains('dark')`).
   - Verify `matchMedia` listener updates resolved theme when in `system` mode and ignores OS changes when explicit `light` or `dark` is selected.
2. **Component Tests:**
   - Verify `ThemeToggle` renders correct icon and accessibility label for each state.
   - Verify click triggers state transition.
3. **End-to-End Visual / Regression Verification:**
   - Verify all 7 existing unit & component test suites continue to pass (`npm test`).
   - Verify build passes (`npm run build`).
   - Check contrast on all major pages (Lobby, Directory, Cards, Modals, Scanner, Organizer Dashboard).
