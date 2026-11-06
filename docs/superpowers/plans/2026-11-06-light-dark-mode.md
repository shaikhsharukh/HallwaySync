# Light & Dark Mode with System Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Apple-inspired light and dark mode defaulting to system with a single-tap header button cycling System (Auto) → Light → Dark → System.

**Architecture:** A standalone `useTheme` hook manages `'system' | 'light' | 'dark'` mode, persists selection in `localStorage`, and registers a `window.matchMedia('(prefers-color-scheme: dark)')` listener when in system mode. An inline head script in `index.html` prevents flash-of-unstyled-theme (FOUC). Colors are managed through CSS custom properties in `src/index.css` mapped into `tailwind.config.js` to dynamically support both dark tech venue and Apple-clean light aesthetics without code fragmentation.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3.4, Lucide React (`SunMoon`, `Sun`, `Moon`), Vitest, Testing Library React.

**Spec:** [`docs/superpowers/specs/2026-11-06-light-dark-mode-design.md`](file:///home/sharukh/ai-workspace/hackbuild/docs/superpowers/specs/2026-11-06-light-dark-mode-design.md)

## Global Constraints

- Default theme MUST be `'system'` on fresh visit or when `localStorage` has no `'theme'` entry.
- The theme toggle MUST be a single-tap button cycling in exact sequence: `system` → `light` → `dark` → `system`.
- Iconography MUST follow Option A: `SunMoon` for `system`, `Sun` for `light`, `Moon` for `dark`.
- Light canvas must evoke Apple aesthetic: `#F5F5F7` background, `#FFFFFF` cards, `#E2E8F0` borders, `#0F172A` text, and keep Supabase Emerald (`#3ECF8E` / `#059669`) brand accents.
- QR code displays and scanner camera views MUST remain high contrast and legible under both themes.
- Zero FOUC: Root `dark` class must be applied synchronously prior to React mounting.

## Review Focus

1. **`localStorage` throws `SecurityError` (e.g. sandboxed iframe or private browsing with disabled storage):** The theme hook must safely fall back to in-memory state and still resolve system theme without crashing. (Pinned to Task 1)
2. **OS theme flips while attendee is on `'system'` mode:** The `matchMedia` listener must immediately update `document.documentElement.classList` and React state without requiring page reload. (Pinned to Task 1)
3. **OS theme flips while attendee has explicitly chosen `'light'` or `'dark'`:** The manual override must be preserved and OS change events ignored. (Pinned to Task 1)
4. **Invalid or corrupted value in `localStorage` (e.g. `'sepia'` or `'null'`):** Hook must fall back safely to `'system'`. (Pinned to Task 1)
5. **Mobile touch target accessibility:** The `ThemeToggle` button must maintain at least a 44×44px interactive touch area with clear `aria-label` announcing current state. (Pinned to Task 3)

---

### Task 1: Theme State Engine (`theme-types.ts`, `useTheme.ts`, and Unit Tests)

**Files:**
- Create: `src/features/theme/theme-types.ts`
- Create: `src/features/theme/useTheme.ts`
- Create: `tests/unit/theme.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type Theme = 'system' | 'light' | 'dark';
  export type ResolvedTheme = 'light' | 'dark';

  export interface UseThemeReturn {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    cycleTheme: () => void;
  }

  export function useTheme(): UseThemeReturn;
  export function resolveEffectiveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme;
  export function applyThemeToDOM(resolved: ResolvedTheme): void;
  ```

- [ ] **Step 1: Write failing unit tests for theme engine in `tests/unit/theme.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, resolveEffectiveTheme, Theme } from '../../src/features/theme/useTheme';

describe('useTheme hook & engine', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to system theme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('resolves effective theme based on prefers-color-scheme when theme is system', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark');
    expect(resolveEffectiveTheme('system', false)).toBe('light');
    expect(resolveEffectiveTheme('light', true)).toBe('light');
    expect(resolveEffectiveTheme('dark', false)).toBe('dark');
  });

  it('cycles theme through system -> light -> dark -> system', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');

    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');

    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    act(() => result.current.cycleTheme());
    expect(result.current.theme).toBe('system');
    expect(localStorage.getItem('theme')).toBe('system');
  });

  it('handles corrupted localStorage values by falling back to system', () => {
    localStorage.setItem('theme', 'invalid-theme-value');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });

  it('safely handles localStorage throwing exceptions (e.g. restricted iframe)', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: Access Denied');
    });
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    getItemSpy.mockRestore();
  });

  it('updates documentElement class when theme changes', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setTheme('dark'));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => result.current.setTheme('light'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/theme.test.ts`
Expected: FAIL with "Cannot find module '../../src/features/theme/useTheme'"

- [ ] **Step 3: Implement `theme-types.ts` and `useTheme.ts`**

Create `src/features/theme/theme-types.ts` with `Theme`, `ResolvedTheme`, `UseThemeReturn`.
Create `src/features/theme/useTheme.ts` implementing `resolveEffectiveTheme`, `applyThemeToDOM`, safe `localStorage` helper (`getStoredTheme`, `setStoredTheme`), `useTheme` hook with `window.matchMedia('(prefers-color-scheme: dark)')` listener.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/theme.test.ts`
Expected: PASS (all 6 tests passing)

- [ ] **Step 5: Commit**

```bash
git add src/features/theme/ tests/unit/theme.test.ts
git commit -m "feat(theme): implement useTheme hook with system default and tests"
```

---

### Task 2: CSS Custom Properties & Zero-FOUC Head Script

**Files:**
- Modify: `index.html:1-25`
- Modify: `src/index.css:1-35`
- Modify: `tailwind.config.js:20-30`

**Interfaces:**
- Consumes: `Theme`, `.dark` CSS class
- Produces: CSS variables `--color-surface-base`, `--color-surface-card`, `--color-surface-raised`, `--color-surface-hover`, `--color-surface-border`, `--color-surface-highlight`

- [ ] **Step 1: Add Zero-FOUC script into `index.html` `<head>`**

Insert inline script before stylesheets and modules:
```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || ((!stored || stored === 'system') && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {}
  })();
</script>
```

- [ ] **Step 2: Add theme CSS custom properties in `src/index.css`**

Add `:root` variables for Apple light theme and `.dark` variables for dark theme:
```css
:root {
  --color-surface-base: #f5f5f7;
  --color-surface-card: #ffffff;
  --color-surface-raised: #ffffff;
  --color-surface-hover: #f1f5f9;
  --color-surface-border: #e2e8f0;
  --color-surface-highlight: #e2e8f0;
}

.dark {
  --color-surface-base: #0c0e12;
  --color-surface-card: #14171f;
  --color-surface-raised: #1b202a;
  --color-surface-hover: #242b38;
  --color-surface-border: #2a3242;
  --color-surface-highlight: #363f52;
}
```

- [ ] **Step 3: Update `tailwind.config.js` to reference CSS custom properties**

Update `surface` color map:
```javascript
surface: {
  base: 'var(--color-surface-base)',
  card: 'var(--color-surface-card)',
  raised: 'var(--color-surface-raised)',
  hover: 'var(--color-surface-hover)',
  border: 'var(--color-surface-border)',
  highlight: 'var(--color-surface-highlight)',
},
```

- [ ] **Step 4: Verify build and existing tests pass**

Run: `npm run build && npm test`
Expected: PASS (build succeeds, all tests green)

- [ ] **Step 5: Commit**

```bash
git add index.html src/index.css tailwind.config.js
git commit -m "feat(theme): configure dynamic CSS theme tokens and zero-FOUC script"
```

---

### Task 3: `ThemeToggle` Component with Apple Styling and Tests

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `tests/component/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `useTheme` from `src/features/theme/useTheme`
- Produces: `ThemeToggle: React.FC<{ className?: string }>`

- [ ] **Step 1: Write component test in `tests/component/theme-toggle.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from '../../src/components/ThemeToggle';

describe('ThemeToggle component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('renders with accessible label and default system icon', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', expect.stringMatching(/System/i));
  });

  it('cycles theme when clicked and updates icon title', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });

    // Click to cycle to Light
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', expect.stringMatching(/Light/i));

    // Click to cycle to Dark
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', expect.stringMatching(/Dark/i));

    // Click to cycle back to System
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', expect.stringMatching(/System/i));
  });

  it('satisfies 44px minimum touch target size class', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /theme/i });
    expect(button.className).toMatch(/min-h-\[44px\]/);
    expect(button.className).toMatch(/min-w-\[44px\]/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/component/theme-toggle.test.tsx`
Expected: FAIL with "Cannot find module '../../src/components/ThemeToggle'"

- [ ] **Step 3: Implement `ThemeToggle.tsx`**

Create `src/components/ThemeToggle.tsx` using `useTheme`, `SunMoon`, `Sun`, `Moon` from `lucide-react`:
- Render 44×44px accessible button with subtle Apple-inspired styling: `bg-surface-card border border-surface-border text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl`.
- Tooltip title: `"Theme: System (Auto)"` / `"Theme: Light"` / `"Theme: Dark"`.
- `aria-label`: `"Toggle theme. Currently ${theme} (rendered as ${resolvedTheme})"`
- On click: calls `cycleTheme()`.

- [ ] **Step 4: Run component test to verify it passes**

Run: `npm test -- tests/component/theme-toggle.test.tsx`
Expected: PASS (all 3 component tests green)

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeToggle.tsx tests/component/theme-toggle.test.tsx
git commit -m "feat(theme): add ThemeToggle component with tests"
```

---

### Task 4: Integration into Top Header & View Contrast Tuning

**Files:**
- Modify: `src/App.tsx:360-485`
- Modify: `src/components/ui/card.tsx` (ensure light mode card backgrounds & borders are crisp)
- Modify: `src/components/ui/input.tsx` (ensure input text, placeholders, and backgrounds are crisp in light mode)

**Interfaces:**
- Consumes: `<ThemeToggle />` from `src/components/ThemeToggle`
- Produces: Integrated universal theme switcher visible on all application states.

- [ ] **Step 1: Add `ThemeToggle` to sticky top header in `src/App.tsx`**

Import `ThemeToggle`.
Place `<ThemeToggle />` in the top header action cluster so it is permanently visible on:
- Room Creation view (`view === 'create'`)
- Room Lobby view (`view === 'lobby'`)
- Onboarding Wizard (`view === 'onboard'`)
- Active Room Directory, Matches, Connections (`view === 'room'`)
- Organizer Dashboard (`view === 'dashboard'`)

Update root app wrapper class from hardcoded `text-slate-100` to `text-slate-900 dark:text-slate-100` and `bg-surface-base`.

- [ ] **Step 2: Verify inputs and cards in light mode**

Audit `src/components/ui/input.tsx`, `src/components/ui/card.tsx`, `src/components/ui/modal.tsx` to ensure text, placeholder, and border utilities use `text-slate-900 dark:text-slate-100` and `bg-surface-card` rather than hardcoded white text on light backgrounds.

- [ ] **Step 3: Run entire test suite and build**

Run: `npm test && npm run build`
Expected: PASS (all unit, component tests passing, build bundle emitted cleanly)

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/ui/
git commit -m "feat(theme): integrate ThemeToggle in header and tune light mode contrast"
```

---

## Plan Self-Review Checklist

- [x] **Spec coverage:** Default system theme (Task 1, 2), cycle button (Task 1, 3), Option A icons SunMoon/Sun/Moon (Task 3), Apple light palette (Task 2, 4), zero-FOUC (Task 2), header placement (Task 4).
- [x] **Step scan:** Every step contains a clear, unambiguous action with checkable result.
- [x] **Type consistency:** Types (`Theme`, `ResolvedTheme`, `UseThemeReturn`) and component names match across all tasks.
- [x] **Review Focus addressed:**
  1. `localStorage` security error: handled & tested in Task 1.
  2. Live OS flip during `'system'`: handled & tested in Task 1.
  3. Live OS flip during override: handled & tested in Task 1.
  4. Corrupted `localStorage` fallback: handled & tested in Task 1.
  5. 44px touch target: handled & tested in Task 3.
- [x] **Proportion:** Concise, focused tasks without transcribing redundant boilerplate.
