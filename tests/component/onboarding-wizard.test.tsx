import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OnboardingWizard } from '../../src/features/onboarding/OnboardingWizard';

describe('User Story 1 Component Test: OnboardingWizard', () => {
  it('renders step 1 with display name input and role buttons', () => {
    const handleComplete = vi.fn();
    render(
      <OnboardingWizard
        roomTitle="Hackathon 2026"
        roomCategory="hackathon"
        onComplete={handleComplete}
      />
    );

    expect(screen.getByText('Who are you?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Alex Chen')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('prevents advancing if display name is blank', () => {
    const handleComplete = vi.fn();
    render(
      <OnboardingWizard
        roomTitle="Hackathon 2026"
        roomCategory="hackathon"
        onComplete={handleComplete}
      />
    );

    const continueBtn = screen.getByText('Continue to Skills');
    fireEvent.click(continueBtn);

    expect(
      screen.getByText(/Please enter your name or nickname/i)
    ).toBeInTheDocument();
  });

  it('advances to step 2 when valid name is entered', () => {
    const handleComplete = vi.fn();
    render(
      <OnboardingWizard
        roomTitle="Hackathon 2026"
        roomCategory="hackathon"
        onComplete={handleComplete}
      />
    );

    const input = screen.getByPlaceholderText('e.g. Alex Chen');
    fireEvent.change(input, { target: { value: 'Alex Chen' } });

    const continueBtn = screen.getByText('Continue to Skills');
    fireEvent.click(continueBtn);

    expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();
  });
});
