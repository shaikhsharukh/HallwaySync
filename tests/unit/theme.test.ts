import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, resolveEffectiveTheme, applyThemeToDOM, Theme } from '../../src/features/theme/useTheme';

describe('useTheme hook & engine', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults to system theme when localStorage is empty', () => {
    const { result } = renderHook(() => useTheme());
    const initialTheme: Theme = result.current.theme;
    expect(initialTheme).toBe('system');
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

  it('applies theme directly to DOM with applyThemeToDOM', () => {
    applyThemeToDOM('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyThemeToDOM('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('safely handles localStorage setItem throwing exceptions', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useTheme());
    expect(() => {
      act(() => result.current.setTheme('dark'));
    }).not.toThrow();
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    setItemSpy.mockRestore();
  });

  it('responds to matchMedia changes when theme is system', () => {
    let listener: ((e: { matches: boolean }) => void) | null = null;
    const originalMatchMedia = window.matchMedia;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        if (event === 'change') listener = cb;
      }),
      removeEventListener: vi.fn((event: string, cb: (e: { matches: boolean }) => void) => {
        if (event === 'change' && listener === cb) listener = null;
      }),
      dispatchEvent: vi.fn(),
    }));

    const { result, unmount } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Simulate system preference changing to dark
    act(() => {
      if (listener) listener({ matches: true });
    });

    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    unmount();
    window.matchMedia = originalMatchMedia;
  });
});
