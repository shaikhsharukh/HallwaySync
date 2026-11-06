import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizerDashboardPage } from '../../src/features/organizer/OrganizerDashboardPage';
import { AnnouncementBanner } from '../../src/features/organizer/AnnouncementBanner';
import { DemographicCharts } from '../../src/features/organizer/DemographicCharts';
import { organizerService } from '../../src/features/organizer/organizer-service';
import { Room, Attendee, Announcement } from '../../src/types/models';

describe('Organizer Dashboard & Live Broadcast Feature Tests', () => {
  const mockRoom: Room = {
    id: 'room-test-1',
    slug: 'hack-sf-2026',
    title: 'HackSF 2026 - Main Stage Hall',
    description: 'Premier AI hackathon in San Francisco',
    category: 'hackathon',
    creator_token: 'token-creator-999',
    is_active: true,
    created_at: '2026-11-06T08:00:00Z',
  };

  const mockAttendees: Attendee[] = [
    {
      id: 'att-1',
      room_id: 'room-test-1',
      display_name: 'Elena Rostova',
      role: 'Frontend',
      headline: 'Staff UI Architect',
      bio: 'React and WebGL enthusiast',
      skills: ['React', 'TypeScript', 'TailwindCSS'],
      intent: ['Looking for Team', 'Hiring'],
      contact_handle: '@elena_ui',
      avatar_color: '#38bdf8',
      avatar_github: 'elenarostova',
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Station 4',
      is_banned: false,
      created_at: '2026-11-06T09:00:00Z',
      updated_at: '2026-11-06T09:00:00Z',
    },
    {
      id: 'att-2',
      room_id: 'room-test-1',
      display_name: 'David Kim',
      role: 'Backend',
      headline: 'Distributed Systems Engineer',
      bio: 'Postgres & Go scale',
      skills: ['Go', 'PostgreSQL', 'Docker'],
      intent: ['Looking for Team'],
      contact_handle: '@dkim',
      avatar_color: '#10b981',
      avatar_github: 'dkim-dev',
      is_available_to_chat: false,
      available_until: null,
      current_zone: 'Hacking Bay B',
      is_banned: false,
      created_at: '2026-11-06T09:15:00Z',
      updated_at: '2026-11-06T09:15:00Z',
    },
    {
      id: 'att-3',
      room_id: 'room-test-1',
      display_name: 'Maya Patel',
      role: 'AI/ML',
      headline: 'Applied ML Researcher',
      bio: 'LLM agents and RAG pipelines',
      skills: ['Python', 'PyTorch', 'LangChain'],
      intent: ['Offering Mentorship'],
      contact_handle: '@mayaml',
      avatar_color: '#a855f7',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '2026-11-06T09:30:00Z',
      updated_at: '2026-11-06T09:30:00Z',
    },
    {
      id: 'att-4',
      room_id: 'room-test-1',
      display_name: 'Banned Troublemaker',
      role: 'Other',
      headline: 'Bad actor',
      bio: null,
      skills: ['Spam'],
      intent: ['Just Browsing'],
      contact_handle: '@spammer',
      avatar_color: '#ef4444',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: null,
      is_banned: true,
      created_at: '2026-11-06T08:30:00Z',
      updated_at: '2026-11-06T08:35:00Z',
    },
  ];

  let onBackToRoom: ReturnType<typeof vi.fn>;
  let onPostAnnouncement: ReturnType<typeof vi.fn>;
  let onBanAttendee: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onBackToRoom = vi.fn();
    onPostAnnouncement = vi.fn().mockResolvedValue(undefined);
    onBanAttendee = vi.fn().mockResolvedValue(undefined);
    vi.restoreAllMocks();
  });

  describe('1. Positive Scenarios: OrganizerDashboardPage & Metrics', () => {
    it('renders room header, command center badge, and back navigation button', () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      expect(screen.getByText(mockRoom.title)).toBeInTheDocument();
      expect(screen.getByText('Command Center')).toBeInTheDocument();

      const backButton = screen.getByRole('button', { name: /back to projector qr lobby/i });
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton);
      expect(onBackToRoom).toHaveBeenCalledTimes(1);
    });

    it('renders attendee metrics: total attendees, active count, and unique skills (excluding banned)', () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Total registered card (3 non-banned out of 4)
      const totalCard = screen.getByText('Total Registered').closest('.shadow-card');
      expect(totalCard).toHaveTextContent('3');

      // Active & Available card (Elena and Maya are active; David is not)
      const activeCard = screen.getByText('Active & Available').closest('.shadow-card');
      expect(activeCard).toHaveTextContent('2');

      // Distinct skills count across non-banned (9 skills: React, TypeScript, TailwindCSS, Go, PostgreSQL, Docker, Python, PyTorch, LangChain)
      const skillsCard = screen.getByText('Distinct Skills').closest('.shadow-card');
      expect(skillsCard).toHaveTextContent('9');
    });

    it('renders live attendee roster table with details, roles, skills, intent, and moderation state', () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      expect(screen.getByText('Live Attendee Roster & Moderation')).toBeInTheDocument();
      expect(screen.getByText('4 in roster')).toBeInTheDocument();

      const table = screen.getByRole('table');

      // Check attendees in table
      expect(within(table).getByText('Elena Rostova')).toBeInTheDocument();
      expect(within(table).getByText('@elena_ui')).toBeInTheDocument();
      expect(within(table).getByText('Frontend')).toBeInTheDocument();

      expect(within(table).getByText('David Kim')).toBeInTheDocument();
      expect(within(table).getByText('@dkim')).toBeInTheDocument();
      expect(within(table).getByText('Backend')).toBeInTheDocument();

      expect(within(table).getByText('Maya Patel')).toBeInTheDocument();
      expect(within(table).getByText('@mayaml')).toBeInTheDocument();
      expect(within(table).getByText('AI/ML')).toBeInTheDocument();

      // Banned attendee shows 'Banned' badge instead of ban button
      expect(within(table).getByText('Banned Troublemaker')).toBeInTheDocument();
      expect(within(table).getByText('Banned')).toBeInTheDocument();
    });

    it('triggers sanitized CSV export when clicking Export button', () => {
      const downloadSpy = vi.spyOn(organizerService, 'downloadCSV').mockImplementation(() => {});

      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      const exportButton = screen.getByRole('button', { name: /export sanitized csv/i });
      fireEvent.click(exportButton);

      expect(downloadSpy).toHaveBeenCalledWith(mockRoom.slug, mockAttendees);
    });
  });

  describe('2. Positive Scenarios: DemographicCharts Component', () => {
    it('renders role composition donut chart with total attendees count and role breakdown', () => {
      const analytics = organizerService.calculateAnalytics(mockAttendees);

      render(<DemographicCharts analytics={analytics} />);

      expect(screen.getByText('Role Composition')).toBeInTheDocument();

      // Donut center label shows total attendees (3)
      const attendeeCountLabels = screen.getAllByText('3');
      expect(attendeeCountLabels.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Attendees')).toBeInTheDocument();

      // Role legend items (Frontend: 1, Backend: 1, AI/ML: 1 -> each 33%)
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('AI/ML')).toBeInTheDocument();
      const thirtyThreePcts = screen.getAllByText('33%');
      expect(thirtyThreePcts.length).toBe(3);
    });

    it('renders participant intent breakdown and top technical skills matrix', () => {
      const analytics = organizerService.calculateAnalytics(mockAttendees);

      render(<DemographicCharts analytics={analytics} />);

      expect(screen.getByText('Participant Intent Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Looking for Team')).toBeInTheDocument();
      expect(screen.getByText('Hiring')).toBeInTheDocument();
      expect(screen.getByText('Offering Mentorship')).toBeInTheDocument();

      expect(screen.getByText('Top Technical Skills Matrix')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Go')).toBeInTheDocument();
      expect(screen.getByText('PyTorch')).toBeInTheDocument();
    });
  });

  describe('3. Positive Scenarios: Announcement Broadcast & Quick Templates', () => {
    it('broadcasts announcement by submitting custom title and message', async () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      const titleInput = screen.getByPlaceholderText(/e\.g\. Lunch is served in Hall B/i);
      const messageInput = screen.getByPlaceholderText(/e\.g\. Vegetarian and gluten-free options available/i);
      const submitButton = screen.getByRole('button', { name: /publish broadcast to attendees/i });

      fireEvent.change(titleInput, { target: { value: '⚡ API Workshop Relocation' } });
      fireEvent.change(messageInput, { target: { value: 'API workshop moved to Workshop Room 3 on 2nd Floor.' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onPostAnnouncement).toHaveBeenCalledWith(
          '⚡ API Workshop Relocation',
          'API workshop moved to Workshop Room 3 on 2nd Floor.'
        );
      });

      // Inputs should be cleared after posting
      expect((titleInput as HTMLInputElement).value).toBe('');
      expect((messageInput as HTMLInputElement).value).toBe('');

      // Confirmation notification displayed
      expect(
        await screen.findByText(/✓ announcement broadcasted live to all attendee screens!/i)
      ).toBeInTheDocument();
    });

    it('autofills title and message inputs when clicking quick preset templates', () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      const titleInput = screen.getByPlaceholderText(/e\.g\. Lunch is served in Hall B/i) as HTMLInputElement;
      const messageInput = screen.getByPlaceholderText(
        /e\.g\. Vegetarian and gluten-free options available/i
      ) as HTMLInputElement;

      // 1. Food preset
      const foodPreset = screen.getByRole('button', { name: /🍕 Food & Refreshments Ready/i });
      fireEvent.click(foodPreset);
      expect(titleInput.value).toBe('🍕 Food & Refreshments Ready');
      expect(messageInput.value).toContain('Lunch is now served in Hall B');

      // 2. Deadline preset
      const deadlinePreset = screen.getByRole('button', { name: /⏰ 1 Hour Until Hacking Deadline/i });
      fireEvent.click(deadlinePreset);
      expect(titleInput.value).toBe('⏰ 1 Hour Until Hacking Deadline');
      expect(messageInput.value).toContain('Please push your project repositories');

      // 3. Presentations preset
      const demoPreset = screen.getByRole('button', { name: /🏆 Presentation Demos on Main Stage/i });
      fireEvent.click(demoPreset);
      expect(titleInput.value).toBe('🏆 Presentation Demos on Main Stage');
      expect(messageInput.value).toContain('Top 10 teams please assemble');

      // 4. Mentors preset
      const mentorPreset = screen.getByRole('button', { name: /🤝 Mentor Hours Available/i });
      fireEvent.click(mentorPreset);
      expect(titleInput.value).toBe('🤝 Mentor Hours Available');
      expect(messageInput.value).toContain('Cloud and AI mentors are stationed');
    });
  });

  describe('4. Positive Scenarios: Attendee Ban Modal Flow', () => {
    it('opens ban confirmation dialog with attendee name and cancels safely', async () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Find ban button for David Kim
      const banButtons = screen.getAllByRole('button', { name: /ban/i });
      // Elena (0), David (1), Maya (2)
      fireEvent.click(banButtons[1]);

      // Modal appears
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText('Confirm Attendee Ban')).toBeInTheDocument();
      expect(within(modal).getByText(/Are you sure you want to ban/i)).toBeInTheDocument();
      expect(within(modal).getByText('David Kim')).toBeInTheDocument();

      // Click Cancel
      const cancelButton = within(modal).getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      // Modal closed and onBanAttendee not called
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(onBanAttendee).not.toHaveBeenCalled();
    });

    it('confirms attendee ban and calls onBanAttendee with target attendee ID', async () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      const banButtons = screen.getAllByRole('button', { name: /ban/i });
      fireEvent.click(banButtons[0]); // Elena Rostova (id: 'att-1')

      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();

      const confirmButton = within(modal).getByRole('button', { name: /confirm ban/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onBanAttendee).toHaveBeenCalledWith('att-1');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('5. AnnouncementBanner Component & Dismissal', () => {
    const mockAnnouncement: Announcement = {
      id: 'ann-101',
      room_id: 'room-test-1',
      title: '🍕 Midnight Pizza Drop',
      message: 'Pizza arrived in Lounge 2! First come first served.',
      is_pinned: true,
      created_at: '2026-11-06T12:00:00Z',
    };

    it('renders active broadcast message, title, and dismiss button when pinned', () => {
      render(<AnnouncementBanner announcement={mockAnnouncement} />);

      expect(screen.getByText('🍕 Midnight Pizza Drop:')).toBeInTheDocument();
      expect(screen.getByText('Pizza arrived in Lounge 2! First come first served.')).toBeInTheDocument();

      const dismissBtn = screen.getByRole('button', { name: /dismiss announcement/i });
      expect(dismissBtn).toBeInTheDocument();
    });

    it('dismissing the announcement removes banner from DOM', () => {
      render(<AnnouncementBanner announcement={mockAnnouncement} />);

      const dismissBtn = screen.getByRole('button', { name: /dismiss announcement/i });
      fireEvent.click(dismissBtn);

      expect(screen.queryByText('🍕 Midnight Pizza Drop:')).not.toBeInTheDocument();
    });

    it('renders null when announcement is null or is_pinned is false', () => {
      const { container: nullContainer } = render(<AnnouncementBanner announcement={null} />);
      expect(nullContainer.firstChild).toBeNull();

      const unpinnedAnnouncement: Announcement = {
        ...mockAnnouncement,
        id: 'ann-unpinned',
        is_pinned: false,
      };

      const { container: unpinnedContainer } = render(
        <AnnouncementBanner announcement={unpinnedAnnouncement} />
      );
      expect(unpinnedContainer.firstChild).toBeNull();
    });
  });

  describe('6. Negative & Edge Scenarios', () => {
    it('prevents broadcast submission when title or message is empty or whitespace-only', async () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      const titleInput = screen.getByPlaceholderText(/e\.g\. Lunch is served in Hall B/i);
      const messageInput = screen.getByPlaceholderText(/e\.g\. Vegetarian and gluten-free options available/i);
      const submitButton = screen.getByRole('button', { name: /publish broadcast to attendees/i });

      // Check required attributes on inputs
      expect(titleInput).toBeRequired();
      expect(messageInput).toBeRequired();

      // Submit with whitespace only
      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.change(messageInput, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      expect(onPostAnnouncement).not.toHaveBeenCalled();

      // Submit with empty title, valid message
      fireEvent.change(titleInput, { target: { value: '' } });
      fireEvent.change(messageInput, { target: { value: 'Valid message' } });
      fireEvent.click(submitButton);

      expect(onPostAnnouncement).not.toHaveBeenCalled();

      // Submit with valid title, empty message
      fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
      fireEvent.change(messageInput, { target: { value: '' } });
      fireEvent.click(submitButton);

      expect(onPostAnnouncement).not.toHaveBeenCalled();
    });

    it('zero attendees state: handles empty attendee array without division-by-zero or NaN errors', () => {
      render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={[]}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Verify zero metrics without NaN
      const totalCard = screen.getByText('Total Registered').closest('.shadow-card');
      expect(totalCard).toHaveTextContent('0');

      const activeCard = screen.getByText('Active & Available').closest('.shadow-card');
      expect(activeCard).toHaveTextContent('0');

      const skillsCard = screen.getByText('Distinct Skills').closest('.shadow-card');
      expect(skillsCard).toHaveTextContent('0');

      // Empty attendee roster message
      expect(
        screen.getByText(/No attendees have joined this room yet\. Share the stage QR code to begin onboarding!/i)
      ).toBeInTheDocument();
      expect(screen.getByText('0 in roster')).toBeInTheDocument();

      // DemographicCharts does not output NaN
      expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });

    it('zero attendees demographic charts render safely with 0% and empty breakdowns', () => {
      const emptyAnalytics = organizerService.calculateAnalytics([]);
      const { container } = render(<DemographicCharts analytics={emptyAnalytics} />);

      expect(screen.getByText('Role Composition')).toBeInTheDocument();
      expect(screen.getByText('Participant Intent Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Top Technical Skills Matrix')).toBeInTheDocument();

      // Total count in donut center is 0
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Attendees')).toBeInTheDocument();

      // Check no NaN in rendered markup
      expect(container.innerHTML).not.toContain('NaN');
    });
  });

  describe('7. Mobile Responsiveness & Layout Architecture', () => {
    it('verifies responsive grid layout for stat metric cards', () => {
      const { container } = render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Metric cards container has responsive grid: 2 cols on mobile, 3 on tablet/desktop
      const metricsGrid = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-3');
      expect(metricsGrid).toBeInTheDocument();

      // The 3rd metric card spans 2 columns on mobile (col-span-2) and 1 column on sm+ (sm:col-span-1)
      const thirdMetricCard = container.querySelector('.col-span-2.sm\\:col-span-1');
      expect(thirdMetricCard).toBeInTheDocument();
      expect(thirdMetricCard).toHaveTextContent('Distinct Skills');
    });

    it('verifies form inputs and action buttons take full width and satisfy mobile touch-targets', () => {
      const { container } = render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Input wrappers and inputs have full width
      const fullWidthWrappers = container.querySelectorAll('.w-full');
      expect(fullWidthWrappers.length).toBeGreaterThan(0);

      const titleInput = screen.getByPlaceholderText(/e\.g\. Lunch is served in Hall B/i);
      expect(titleInput.className).toContain('w-full');
      expect(titleInput.className).toContain('min-h-[44px]');

      const messageInput = screen.getByPlaceholderText(/e\.g\. Vegetarian and gluten-free options available/i);
      expect(messageInput.className).toContain('w-full');
      expect(messageInput.className).toContain('min-h-[44px]');

      // Action buttons meet minimum touch-target height (min-h-[44px])
      const broadcastButton = screen.getByRole('button', { name: /publish broadcast to attendees/i });
      expect(broadcastButton.className).toContain('min-h-[44px]');

      const exportButton = screen.getByRole('button', { name: /export sanitized csv/i });
      expect(exportButton.className).toContain('min-h-[44px]');
    });

    it('verifies SVG donut chart and demographic containers have responsive structures', () => {
      const { container } = render(
        <OrganizerDashboardPage
          room={mockRoom}
          attendees={mockAttendees}
          onBackToRoom={onBackToRoom}
          onPostAnnouncement={onPostAnnouncement}
          onBanAttendee={onBanAttendee}
        />
      );

      // Charts parent grid uses responsive 1 column on mobile, 2 columns on desktop
      const chartsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(chartsGrid).toBeInTheDocument();

      // Top skills matrix spans across both columns on desktop
      const skillsSection = container.querySelector('.md\\:col-span-2');
      expect(skillsSection).toBeInTheDocument();
      expect(skillsSection).toHaveTextContent('Top Technical Skills Matrix');

      // SVG Donut container has responsive fixed aspect wrapper with viewBox
      const donutWrapper = container.querySelector('.relative.w-40.h-40');
      expect(donutWrapper).toBeInTheDocument();

      const svgEl = donutWrapper?.querySelector('svg');
      expect(svgEl).toHaveAttribute('viewBox', '0 0 200 200');
      expect(svgEl?.className.baseVal || svgEl?.getAttribute('class')).toContain('w-full');

      // Roster table wrapper has horizontal overflow for mobile
      const rosterTableScroll = container.querySelector('.overflow-x-auto');
      expect(rosterTableScroll).toBeInTheDocument();

      const tableEl = rosterTableScroll?.querySelector('table');
      expect(tableEl?.className).toContain('min-w-[500px]');
    });
  });
});
