import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../../src/features/onboarding/OnboardingWizard';
import { onboardingService } from '../../src/features/onboarding/onboarding-service';
import { Attendee } from '../../src/types/models';
import { getRoleColor } from '../../src/lib/utils';

describe('OnboardingWizard Extended Component & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  /* -------------------------------------------------------------------------
   * 1. Positive Scenarios
   * ----------------------------------------------------------------------- */
  describe('Positive Scenarios: Multi-Step Journey & Complete Onboarding', () => {
    it('completes the full 3-step onboarding journey with custom inputs and structured onComplete payload', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);

      render(
        <OnboardingWizard
          roomTitle="ETHGlobal Hackathon"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // STEP 1: Who are you?
      expect(screen.getByText('ETHGlobal Hackathon')).toBeInTheDocument();
      expect(screen.getByText('hackathon Join Wizard')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 1 of 3')).toBeInTheDocument();

      // Fill in display name and headline
      const nameInput = screen.getByPlaceholderText('e.g. Alex Chen');
      fireEvent.change(nameInput, { target: { value: 'Ada Lovelace' } });

      const roleBtn = screen.getByRole('button', { name: 'AI/ML' });
      fireEvent.click(roleBtn);

      const headlineInput = screen.getByPlaceholderText('e.g. Building AI agents with Supabase');
      fireEvent.change(headlineInput, { target: { value: 'Pioneering algorithmic reasoning' } });

      // Advance to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // STEP 2: Tech Stack & Skills
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 2 of 3')).toBeInTheDocument();

      // Defaults are ['TypeScript', 'React']. Let's toggle Python and PyTorch
      fireEvent.click(screen.getByRole('button', { name: 'Python' }));
      fireEvent.click(screen.getByRole('button', { name: 'PyTorch' }));

      // Advance to Step 3
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // STEP 3: Intent & Social Link
      expect(screen.getByText('Intent & Social Link')).toBeInTheDocument();
      expect(screen.getByLabelText('Step 3 of 3')).toBeInTheDocument();

      // Select an additional intent
      fireEvent.click(screen.getByRole('button', { name: /Looking for Co-founder/i }));

      // Enter social contact and GitHub
      const contactInput = screen.getByPlaceholderText(/@telegram, linkedin\.com\/in\/you/i);
      fireEvent.change(contactInput, { target: { value: '@adalovelace' } });

      const githubInput = screen.getByPlaceholderText('e.g. octocat');
      fireEvent.change(githubInput, { target: { value: 'adalovelace' } });

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Enter Live Room/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      expect(handleComplete).toHaveBeenCalledWith({
        displayName: 'Ada Lovelace',
        role: 'AI/ML',
        headline: 'Pioneering algorithmic reasoning',
        skills: expect.arrayContaining(['TypeScript', 'React', 'Python', 'PyTorch']),
        intent: expect.arrayContaining(['Looking for Team', 'Looking for Co-founder']),
        contactHandle: '@adalovelace',
        avatarGithub: 'adalovelace',
        avatarColor: getRoleColor('AI/ML'),
      });
    });

    it('adds custom skills dynamically and includes them in the profile payload', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);

      render(
        <OnboardingWizard
          roomTitle="AI Summit 2026"
          roomCategory="conference"
          onComplete={handleComplete}
        />
      );

      // Step 1
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Grace Hopper' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Step 2: Add custom skill via text input and "Add" button
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();
      const customSkillInput = screen.getByPlaceholderText(/Add other tag/i);
      const addBtn = screen.getByRole('button', { name: /^Add$/i });

      // Add "COBOL"
      fireEvent.change(customSkillInput, { target: { value: 'COBOL' } });
      fireEvent.click(addBtn);

      // Custom skill input should be cleared after adding
      expect((customSkillInput as HTMLInputElement).value).toBe('');

      // Add another custom skill "Compilers" via form submit (Enter key)
      fireEvent.change(customSkillInput, { target: { value: 'Compilers' } });
      fireEvent.submit(customSkillInput.closest('form')!);
      expect((customSkillInput as HTMLInputElement).value).toBe('');

      // Continue to Step 3 and submit
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      const payload = handleComplete.mock.calls[0][0];
      expect(payload.skills).toContain('COBOL');
      expect(payload.skills).toContain('Compilers');
    });

    it('allows deselecting and selecting multiple roles, skills, and goals', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);

      render(
        <OnboardingWizard
          roomTitle="Founder Hack 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1: Switch roles from default Fullstack -> Founder -> Backend
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Bob Vance' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Founder' }));
      fireEvent.click(screen.getByRole('button', { name: 'Backend' }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Step 2: Unselect default 'TypeScript', select 'Go', 'Rust', 'PostgreSQL'
      fireEvent.click(screen.getByRole('button', { name: 'TypeScript' })); // unselect
      fireEvent.click(screen.getByRole('button', { name: 'Go' }));
      fireEvent.click(screen.getByRole('button', { name: 'Rust' }));
      fireEvent.click(screen.getByRole('button', { name: 'PostgreSQL' }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // Step 3: Select multiple intents
      fireEvent.click(screen.getByRole('button', { name: /Need Devs \/ Hiring/i }));
      fireEvent.click(screen.getByRole('button', { name: /Open to Chat \/ Network/i }));
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      const payload = handleComplete.mock.calls[0][0];
      expect(payload.role).toBe('Backend');
      expect(payload.skills).not.toContain('TypeScript');
      expect(payload.skills).toEqual(expect.arrayContaining(['React', 'Go', 'Rust', 'PostgreSQL']));
      expect(payload.intent).toEqual(
        expect.arrayContaining([
          'Looking for Team',
          'Need Devs / Hiring',
          'Open to Chat / Network',
        ])
      );
    });

    it('pre-populates fields in edit mode and shows Profile Editor and Cancel button', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);
      const handleCancel = vi.fn();

      const existingAttendee: Attendee = {
        id: 'user-123',
        room_id: 'room-abc',
        display_name: 'Carol Danvers',
        role: 'Founder',
        headline: 'Avenging Earth',
        bio: null,
        skills: ['Rust', 'Docker', 'PostgreSQL'],
        intent: ['Looking for Co-founder', 'Need Devs / Hiring'],
        contact_handle: 'carol@marvel.com',
        avatar_color: getRoleColor('Founder'),
        avatar_github: 'carol-danvers',
        is_available_to_chat: true,
        available_until: null,
        current_zone: null,
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      render(
        <OnboardingWizard
          roomTitle="Metaverse Conference"
          roomCategory="conference"
          initialProfile={existingAttendee}
          onCancel={handleCancel}
          onComplete={handleComplete}
        />
      );

      // Verify edit mode header text
      expect(screen.getByText('Profile Editor')).toBeInTheDocument();
      expect(screen.getByText('Edit Your Badge')).toBeInTheDocument();

      // Verify prefilled name and headline
      const nameInput = screen.getByPlaceholderText('e.g. Alex Chen') as HTMLInputElement;
      expect(nameInput.value).toBe('Carol Danvers');
      const headlineInput = screen.getByPlaceholderText(/Building AI agents/i) as HTMLInputElement;
      expect(headlineInput.value).toBe('Avenging Earth');

      // Click Cancel button in Step 1
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);

      // Advance to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();

      // Advance to Step 3
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));
      expect(screen.getByText('Intent & Social Link')).toBeInTheDocument();

      // Submit button should have edit text 'Save Profile Changes'
      const saveBtn = screen.getByRole('button', { name: /Save Profile Changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });
      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Carol Danvers',
          role: 'Founder',
          headline: 'Avenging Earth',
          skills: ['Rust', 'Docker', 'PostgreSQL'],
        })
      );
    });

    it('integrates with onboardingService.joinRoom to persist attendee in local session', async () => {
      const roomId = 'room-test-789';
      const userId = 'user-test-456';

      const mockAttendee: Attendee = {
        id: userId,
        room_id: roomId,
        display_name: 'Dave Developer',
        role: 'Fullstack',
        headline: null,
        bio: null,
        skills: ['TypeScript', 'React'],
        intent: ['Looking for Team'],
        contact_handle: null,
        avatar_color: getRoleColor('Fullstack'),
        avatar_github: null,
        is_available_to_chat: false,
        available_until: null,
        current_zone: null,
        is_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const joinRoomSpy = vi
        .spyOn(onboardingService, 'joinRoom')
        .mockResolvedValue(mockAttendee);

      const handleComplete = async (profile: any) => {
        await onboardingService.joinRoom(roomId, userId, profile);
      };

      render(
        <OnboardingWizard
          roomTitle="Integration Hackathon"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Dave Developer' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Fullstack' }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // Step 3
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      await waitFor(() => {
        expect(joinRoomSpy).toHaveBeenCalledTimes(1);
      });

      expect(joinRoomSpy).toHaveBeenCalledWith(
        roomId,
        userId,
        expect.objectContaining({
          displayName: 'Dave Developer',
          role: 'Fullstack',
          skills: ['TypeScript', 'React'],
          intent: ['Looking for Team'],
        })
      );
    });
  });

  /* -------------------------------------------------------------------------
   * 2. Negative & Edge Scenarios
   * ----------------------------------------------------------------------- */
  describe('Negative & Edge Scenarios', () => {
    it('prevents advancing from Step 1 when display name is empty and shows validation error', () => {
      const handleComplete = vi.fn();
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      const continueBtn = screen.getByRole('button', { name: /Continue to Skills/i });
      fireEvent.click(continueBtn);

      expect(
        screen.getByText('Please enter your name or nickname (min 2 characters).')
      ).toBeInTheDocument();
      // Should remain on Step 1
      expect(screen.getByText('Who are you?')).toBeInTheDocument();
      expect(screen.queryByText('Tech Stack & Skills')).not.toBeInTheDocument();
    });

    it('rejects whitespace-only display name and single character names', () => {
      const handleComplete = vi.fn();
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      const nameInput = screen.getByPlaceholderText('e.g. Alex Chen');
      const continueBtn = screen.getByRole('button', { name: /Continue to Skills/i });

      // Test whitespace-only
      fireEvent.change(nameInput, { target: { value: '    ' } });
      fireEvent.click(continueBtn);
      expect(
        screen.getByText('Please enter your name or nickname (min 2 characters).')
      ).toBeInTheDocument();
      expect(screen.queryByText('Tech Stack & Skills')).not.toBeInTheDocument();

      // Test single character
      fireEvent.change(nameInput, { target: { value: 'A' } });
      fireEvent.click(continueBtn);
      expect(
        screen.getByText('Please enter your name or nickname (min 2 characters).')
      ).toBeInTheDocument();
      expect(screen.queryByText('Tech Stack & Skills')).not.toBeInTheDocument();
    });

    it('preserves entered state when navigating back and forth across all steps', () => {
      const handleComplete = vi.fn();
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1: Input name, select role, input headline
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Diana Prince' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Product' }));
      fireEvent.change(screen.getByPlaceholderText(/Building AI agents/i), {
        target: { value: 'Leading next-gen product architecture' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Step 2: In Step 2, select Next.js and unselect React
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Next.js' }));
      fireEvent.click(screen.getByRole('button', { name: 'React' }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // Step 3: In Step 3
      expect(screen.getByText('Intent & Social Link')).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('e.g. octocat'), {
        target: { value: 'dianaprince' },
      });

      // Navigate Back: Step 3 -> Step 2
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();

      // Navigate Back: Step 2 -> Step 1
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
      expect(screen.getByText('Who are you?')).toBeInTheDocument();

      // Verify Step 1 state is intact
      expect((screen.getByPlaceholderText('e.g. Alex Chen') as HTMLInputElement).value).toBe(
        'Diana Prince'
      );
      expect(
        (screen.getByPlaceholderText(/Building AI agents/i) as HTMLInputElement).value
      ).toBe('Leading next-gen product architecture');

      // Navigate forward again: Step 1 -> Step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();

      // Navigate forward again: Step 2 -> Step 3
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));
      expect(screen.getByText('Intent & Social Link')).toBeInTheDocument();
      expect((screen.getByPlaceholderText('e.g. octocat') as HTMLInputElement).value).toBe(
        'dianaprince'
      );
    });

    it('prevents advancing from Step 2 when all skills are deselected', () => {
      const handleComplete = vi.fn();
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1 -> Step 2
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Eve Hacker' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Deselect default skills ('TypeScript' and 'React')
      fireEvent.click(screen.getByRole('button', { name: 'TypeScript' }));
      fireEvent.click(screen.getByRole('button', { name: 'React' }));

      // Attempt to advance
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      expect(screen.getByText('Select at least 1 primary skill or tag.')).toBeInTheDocument();
      // Should remain on Step 2
      expect(screen.getByText('Tech Stack & Skills')).toBeInTheDocument();
      expect(screen.queryByText('Intent & Social Link')).not.toBeInTheDocument();
    });

    it('prevents adding blank or duplicate custom skills', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1 -> Step 2
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Frank Miller' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      const customSkillInput = screen.getByPlaceholderText(/Add other tag/i);
      const addBtn = screen.getByRole('button', { name: /^Add$/i });

      // Attempt to add blank/whitespace custom skill
      fireEvent.change(customSkillInput, { target: { value: '   ' } });
      fireEvent.click(addBtn);

      // Attempt to add duplicate of already selected skill 'React'
      fireEvent.change(customSkillInput, { target: { value: 'React' } });
      fireEvent.click(addBtn);

      // Add valid custom skill 'Solana'
      fireEvent.change(customSkillInput, { target: { value: 'Solana' } });
      fireEvent.click(addBtn);

      // Attempt to add duplicate 'Solana' again
      fireEvent.change(customSkillInput, { target: { value: 'Solana' } });
      fireEvent.click(addBtn);

      // Advance through Step 3 and submit to inspect payload
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      const submittedSkills: string[] = handleComplete.mock.calls[0][0].skills;

      // 'Solana' must only appear once
      expect(submittedSkills.filter((s) => s === 'Solana')).toHaveLength(1);
      // 'React' must only appear once
      expect(submittedSkills.filter((s) => s === 'React')).toHaveLength(1);
      // No empty or blank skill was added
      expect(submittedSkills.some((s) => !s.trim())).toBe(false);
    });

    it('enforces maximum limit of 6 skills and ignores additional skills', () => {
      const handleComplete = vi.fn();
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1 -> Step 2 (starts with 2 default skills: TypeScript, React)
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Ginny Weasley' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Add 4 more skills to reach 6: Python (3), Supabase (4), Next.js (5), Rust (6)
      fireEvent.click(screen.getByRole('button', { name: 'Python' }));
      fireEvent.click(screen.getByRole('button', { name: 'Supabase' }));
      fireEvent.click(screen.getByRole('button', { name: 'Next.js' }));
      fireEvent.click(screen.getByRole('button', { name: 'Rust' }));

      // Try adding 7th suggested skill: PyTorch
      fireEvent.click(screen.getByRole('button', { name: 'PyTorch' }));

      // Try adding 7th custom skill
      const customSkillInput = screen.getByPlaceholderText(/Add other tag/i);
      fireEvent.change(customSkillInput, { target: { value: 'Kubernetes' } });
      fireEvent.click(screen.getByRole('button', { name: /^Add$/i }));

      // Neither PyTorch nor Kubernetes should be selected/added
      expect(screen.queryByRole('button', { name: /Kubernetes/i })).not.toBeInTheDocument();

      // Proceed to Step 3 and complete
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: ['TypeScript', 'React', 'Python', 'Supabase', 'Next.js', 'Rust'],
        })
      );
      expect(handleComplete.mock.calls[0][0].skills.length).toBe(6);
    });

    it('enforces minimum 1 intent (cannot deselect the sole selected intent)', async () => {
      const handleComplete = vi.fn().mockResolvedValue(undefined);
      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1 -> Step 2 -> Step 3
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Hank Pym' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // Default intent is 'Looking for Team'. Try deselecting it
      const defaultIntentBtn = screen.getByRole('button', { name: /Looking for Team/i });
      fireEvent.click(defaultIntentBtn);

      // Submit and verify 'Looking for Team' is still present
      fireEvent.click(screen.getByRole('button', { name: /Enter Live Room/i }));

      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });
      expect(handleComplete.mock.calls[0][0].intent).toEqual(['Looking for Team']);
    });

    it('displays error message and re-enables submit button if onComplete rejects', async () => {
      const handleComplete = vi.fn().mockRejectedValue(new Error('Database connection timed out'));

      render(
        <OnboardingWizard
          roomTitle="Hackathon 2026"
          roomCategory="hackathon"
          onComplete={handleComplete}
        />
      );

      // Step 1 -> Step 2 -> Step 3
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Iris West' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      const submitBtn = screen.getByRole('button', { name: /Enter Live Room/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Database connection timed out')).toBeInTheDocument();
      });

      // Submit button should be enabled again (not in isSubmitting state)
      expect(submitBtn).not.toBeDisabled();
    });
  });

  /* -------------------------------------------------------------------------
   * 3. Mobile Responsiveness & Touch Target Accessibility
   * ----------------------------------------------------------------------- */
  describe('Mobile Responsiveness & Touch Target Standards', () => {
    it('verifies primary action buttons meet minimum touch target standards (min-h-[44px] / min-h-[48px])', () => {
      render(
        <OnboardingWizard
          roomTitle="Mobile Hackathon"
          roomCategory="hackathon"
          onComplete={vi.fn()}
        />
      );

      // Step 1 Continue button
      const continueBtnStep1 = screen.getByRole('button', { name: /Continue to Skills/i });
      expect(continueBtnStep1.className).toMatch(/min-h-\[(44|48)px\]/);

      // Step 1 Role buttons
      const roleBtns = screen.getAllByRole('button', {
        name: /Frontend|Backend|Fullstack|AI\/ML|Mobile|UI\/UX|Product|Founder|Other/,
      });
      roleBtns.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-\[(44|48)px\]/);
      });

      // Advance to Step 2
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Jack Sparrow' },
      });
      fireEvent.click(continueBtnStep1);

      // Step 2 Continue button and Back button
      const continueBtnStep2 = screen.getByRole('button', { name: /Continue to Goals/i });
      const backBtnStep2 = screen.getByRole('button', { name: /Back/i });
      const addCustomBtn = screen.getByRole('button', { name: /^Add$/i });

      expect(continueBtnStep2.className).toMatch(/min-h-\[(44|48)px\]/);
      expect(backBtnStep2.className).toMatch(/min-h-\[(44|48)px\]/);
      expect(addCustomBtn.className).toMatch(/min-h-\[(44|48)px\]/);

      // Step 2 Skill chips
      const skillChips = screen.getAllByRole('button', {
        name: /TypeScript|Python|React|Supabase|Next\.js|PostgreSQL|Rust|PyTorch|Tailwind CSS|Go|Docker|Node\.js/,
      });
      skillChips.forEach((chip) => {
        expect(chip.className).toMatch(/min-h-\[(44|48)px\]/);
      });

      // Advance to Step 3
      fireEvent.click(continueBtnStep2);

      // Step 3 Submit button and Back button
      const submitBtnStep3 = screen.getByRole('button', { name: /Enter Live Room/i });
      const backBtnStep3 = screen.getByRole('button', { name: /Back/i });

      expect(submitBtnStep3.className).toMatch(/min-h-\[(44|48)px\]/);
      expect(backBtnStep3.className).toMatch(/min-h-\[(44|48)px\]/);

      // Step 3 Intent items
      const intentBtns = screen.getAllByRole('button', {
        name: /Looking for Team|Need Devs \/ Hiring|Looking for Co-founder|Open to Chat \/ Network|Looking for Mentor \/ Advice/,
      });
      intentBtns.forEach((btn) => {
        expect(btn.className).toMatch(/min-h-\[(44|48)px\]/);
      });
    });

    it('renders mobile stepper header with responsive padding (p-4 sm:p-6) and dynamic step indicator', () => {
      render(
        <OnboardingWizard
          roomTitle="Mobile Hackathon"
          roomCategory="hackathon"
          onComplete={vi.fn()}
        />
      );

      // Find wizard container
      const container = screen.getByText('Who are you?').closest('.w-full.max-w-md');
      expect(container).toBeInTheDocument();
      expect(container?.className).toContain('p-4');
      expect(container?.className).toContain('sm:p-6');
      expect(container?.className).toContain('w-full');

      // Check Step 1 stepper indicator
      const step1Indicator = screen.getByLabelText('Step 1 of 3');
      expect(step1Indicator).toBeInTheDocument();
      expect(step1Indicator.children).toHaveLength(3);

      // Advance to Step 2
      fireEvent.change(screen.getByPlaceholderText('e.g. Alex Chen'), {
        target: { value: 'Kyle Rayner' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Continue to Skills/i }));

      // Check Step 2 stepper indicator
      expect(screen.getByLabelText('Step 2 of 3')).toBeInTheDocument();

      // Advance to Step 3
      fireEvent.click(screen.getByRole('button', { name: /Continue to Goals/i }));

      // Check Step 3 stepper indicator
      expect(screen.getByLabelText('Step 3 of 3')).toBeInTheDocument();
    });

    it('ensures form inputs, action buttons, and intent options span full width (w-full / flex-1) on mobile', () => {
      render(
        <OnboardingWizard
          roomTitle="Mobile Hackathon"
          roomCategory="hackathon"
          onComplete={vi.fn()}
        />
      );

      // Step 1: Input elements should have w-full
      const nameInput = screen.getByPlaceholderText('e.g. Alex Chen');
      expect(nameInput.className).toContain('w-full');

      const headlineInput = screen.getByPlaceholderText(/Building AI agents/i);
      expect(headlineInput.className).toContain('w-full');

      // Primary button is flex-1 to fill horizontal space
      const continueBtn = screen.getByRole('button', { name: /Continue to Skills/i });
      expect(continueBtn.className).toContain('flex-1');

      // Step 2
      fireEvent.change(nameInput, { target: { value: 'Lois Lane' } });
      fireEvent.click(continueBtn);

      const continueBtn2 = screen.getByRole('button', { name: /Continue to Goals/i });
      expect(continueBtn2.className).toContain('flex-1');

      // Step 3
      fireEvent.click(continueBtn2);

      // Intent buttons must have w-full for full-width tap area
      const intentButtons = screen.getAllByRole('button', {
        name: /Looking for Team|Need Devs \/ Hiring|Looking for Co-founder|Open to Chat \/ Network|Looking for Mentor \/ Advice/,
      });
      intentButtons.forEach((btn) => {
        expect(btn.className).toContain('w-full');
      });

      // Contact inputs have w-full
      const contactInput = screen.getByPlaceholderText(/@telegram, linkedin\.com\/in\/you/i);
      expect(contactInput.className).toContain('w-full');

      const githubInput = screen.getByPlaceholderText('e.g. octocat');
      expect(githubInput.className).toContain('w-full');

      // Submit button has flex-1
      const submitBtn = screen.getByRole('button', { name: /Enter Live Room/i });
      expect(submitBtn.className).toContain('flex-1');
    });
  });
});
