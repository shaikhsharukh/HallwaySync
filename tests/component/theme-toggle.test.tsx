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
