import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DirectoryPage } from '../../src/features/directory/DirectoryPage';
import { AttendeeDetailModal } from '../../src/features/directory/AttendeeDetailModal';
import { AvailabilityToggle } from '../../src/features/directory/AvailabilityToggle';
import { Attendee, Room } from '../../src/types/models';

describe('User Story 2 Component & Integration Tests: Directory & Discovery', () => {
  const mockRoom: Room = {
    id: 'room-1',
    slug: 'hackbuild-2026',
    title: 'HackBuild 2026',
    description: 'AI & Fullstack Networking Hall',
    category: 'hackathon',
    creator_token: 'secret-token',
    is_active: true,
    created_at: '2026-11-06T10:00:00Z',
  };

  const mockAttendees: Attendee[] = [
    {
      id: 'att-1',
      room_id: 'room-1',
      display_name: 'Alex Chen',
      role: 'Frontend',
      headline: 'React & Tailwind Hacker',
      bio: 'Passionate about accessible UI and design systems.',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      intent: ['Looking for Team', 'Open to Chat'],
      contact_handle: '@alexchen',
      avatar_color: '#38bdf8',
      avatar_github: 'alexchen',
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Table 4 (Hacking)',
      is_banned: false,
      created_at: '2026-11-06T10:05:00Z',
      updated_at: '2026-11-06T10:05:00Z',
    },
    {
      id: 'att-2',
      room_id: 'room-1',
      display_name: 'Sam Miller',
      role: 'Backend',
      headline: 'Distributed Systems & Supabase',
      bio: 'Building real-time data engines and microservices in Go & Python.',
      skills: ['Python', 'PostgreSQL', 'Go', 'Supabase'],
      intent: ['Looking for Team'],
      contact_handle: 'https://linkedin.com/in/sammiller',
      avatar_color: '#3ECF8E',
      avatar_github: 'sammiller',
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '2026-11-06T10:10:00Z',
      updated_at: '2026-11-06T10:10:00Z',
    },
    {
      id: 'att-3',
      room_id: 'room-1',
      display_name: 'Taylor Swift',
      role: 'AI/ML',
      headline: 'Fine-tuning LLMs & Vision models',
      bio: 'Researching diffusion architectures and multi-agent coordination.',
      skills: ['Python', 'PyTorch', 'Transformers'],
      intent: ['Open to Chat'],
      contact_handle: 'taylor@swift.ai',
      avatar_color: '#c084fc',
      avatar_github: null,
      is_available_to_chat: true,
      available_until: null,
      current_zone: 'Main Stage',
      is_banned: false,
      created_at: '2026-11-06T10:15:00Z',
      updated_at: '2026-11-06T10:15:00Z',
    },
    {
      id: 'att-4',
      room_id: 'room-1',
      display_name: 'Jordan Lee',
      role: 'UI/UX',
      headline: 'Product Designer & Figma artisan',
      bio: 'Designing intuitive interfaces with micro-interactions.',
      skills: ['Figma', 'UI Design', 'CSS', 'User Research'],
      intent: ['Co-founder Search'],
      contact_handle: 'https://jordanlee.design',
      avatar_color: '#f43f5e',
      avatar_github: 'jordanlee',
      is_available_to_chat: false,
      available_until: null,
      current_zone: 'Coffee Lounge',
      is_banned: false,
      created_at: '2026-11-06T10:20:00Z',
      updated_at: '2026-11-06T10:20:00Z',
    },
    {
      id: 'att-5',
      room_id: 'room-1',
      display_name: 'Ghost Member',
      role: 'Founder',
      headline: null,
      bio: null,
      skills: [],
      intent: [],
      contact_handle: null,
      avatar_color: '#94a3b8',
      avatar_github: null,
      is_available_to_chat: false,
      available_until: null,
      current_zone: null,
      is_banned: false,
      created_at: '2026-11-06T10:25:00Z',
      updated_at: '2026-11-06T10:25:00Z',
    },
  ];

  let onSendWaveMock: ReturnType<typeof vi.fn>;
  let onEditProfileMock: ReturnType<typeof vi.fn>;
  let onRefreshMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSendWaveMock = vi.fn().mockResolvedValue(undefined);
    onEditProfileMock = vi.fn();
    onRefreshMock = vi.fn();
  });

  // =========================================================================
  // 1. Positive Scenarios
  // =========================================================================
  describe('Positive Scenarios: Rendering, Filtering & Discovery', () => {
    it('renders attendee list with role badges, avatar badges, and skill tags', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]}
          connections={{}}
          onSendWave={onSendWaveMock}
          onEditProfile={onEditProfileMock}
          onRefresh={onRefreshMock}
        />
      );

      // Verify stats header
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText(/of 5 attendees/i)).toBeInTheDocument();

      // Verify attendee names
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
      expect(screen.getByText('Ghost Member')).toBeInTheDocument();

      // Verify role badges
      expect(screen.getAllByText('Frontend').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Backend').length).toBeGreaterThan(0);
      expect(screen.getAllByText('AI/ML').length).toBeGreaterThan(0);
      expect(screen.getAllByText('UI/UX').length).toBeGreaterThan(0);

      // Verify skill tags displayed on cards and tags cloud
      expect(screen.getAllByText('React').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PostgreSQL').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PyTorch').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Figma').length).toBeGreaterThan(0);

      // Verify self badge for current attendee
      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('filters attendees in real time by name, headline, skills, or zone via search input', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search attendees, skills, or roles/i);

      // 1. Search by name
      fireEvent.change(searchInput, { target: { value: 'Sam' } });
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
      expect(screen.queryByText('Taylor Swift')).not.toBeInTheDocument();

      // 2. Search by skill
      fireEvent.change(searchInput, { target: { value: 'PyTorch' } });
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.queryByText('Sam Miller')).not.toBeInTheDocument();

      // 3. Search by headline
      fireEvent.change(searchInput, { target: { value: 'Distributed' } });
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();

      // 4. Search by micro-location zone
      fireEvent.change(searchInput, { target: { value: 'Coffee Lounge' } });
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
    });

    it('filters attendees when clicking role filter buttons', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Role filter chips are rendered in the filters section
      const frontendBtn = screen.getByRole('button', { name: /^frontend$/i });
      fireEvent.click(frontendBtn);
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.queryByText('Sam Miller')).not.toBeInTheDocument();
      expect(screen.queryByText('Taylor Swift')).not.toBeInTheDocument();

      // Switch to Backend
      const backendBtn = screen.getByRole('button', { name: /^backend$/i });
      fireEvent.click(backendBtn);
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();

      // Switch to AI/ML
      const aimlBtn = screen.getByRole('button', { name: /^ai\/ml$/i });
      fireEvent.click(aimlBtn);
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.queryByText('Sam Miller')).not.toBeInTheDocument();

      // Switch to UI/UX (Design)
      const designBtn = screen.getByRole('button', { name: /^ui\/ux$/i });
      fireEvent.click(designBtn);
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
      expect(screen.queryByText('Taylor Swift')).not.toBeInTheDocument();

      // Toggling active role off restores full list
      fireEvent.click(designBtn);
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();

      // Selecting a role and clicking 'All Roles' resets filter
      fireEvent.click(frontendBtn);
      expect(screen.queryByText('Sam Miller')).not.toBeInTheDocument();
      const allRolesBtn = screen.getByRole('button', { name: /^all roles$/i });
      fireEvent.click(allRolesBtn);
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
    });

    it('filters attendees when clicking a skill pill in the skill cloud', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Top skills cloud shows skills with counts (e.g. Python appears 2 times)
      const pythonChip = screen.getByRole('button', { name: /python/i });
      fireEvent.click(pythonChip);

      // Both Sam Miller and Taylor Swift have Python
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();
      expect(screen.queryByText('Jordan Lee')).not.toBeInTheDocument();

      // Clicking Python chip again toggles off the filter
      fireEvent.click(pythonChip);
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    it('filters attendees by availability when clicking the Available toggle', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Alex Chen and Taylor Swift have is_available_to_chat: true
      const availableToggle = screen.getByTitle(/filter attendees available right now/i);
      fireEvent.click(availableToggle);

      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.queryByText('Sam Miller')).not.toBeInTheDocument();
      expect(screen.queryByText('Jordan Lee')).not.toBeInTheDocument();
      expect(screen.queryByText('Ghost Member')).not.toBeInTheDocument();

      // Toggle back off restores non-available attendees
      fireEvent.click(availableToggle);
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.getByText('Jordan Lee')).toBeInTheDocument();
    });

    it('opens AttendeeDetailModal with full bio, skills, intent, and github when clicking an attendee card', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Click on Alex Chen's card
      const alexCard = screen.getByText('Alex Chen').closest('.group')!;
      fireEvent.click(alexCard);

      // AttendeeDetailModal is open
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      const modal = within(dialog);

      // Check detailed bio & headline in modal
      expect(modal.getByText('"React & Tailwind Hacker"')).toBeInTheDocument();
      expect(
        modal.getByText('Passionate about accessible UI and design systems.')
      ).toBeInTheDocument();

      // Check intent badges
      expect(modal.getByText('Looking for Team')).toBeInTheDocument();
      expect(modal.getByText('Open to Chat')).toBeInTheDocument();

      // Check GitHub link in modal
      const githubLink = modal.getByRole('link', { name: /github\.com\/alexchen/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/alexchen');
    });

    it('renders unshielded contact links when connectionStatus is connected', () => {
      // Alex Chen is connected, Sam Miller is connected with LinkedIn, Taylor Swift with email
      render(
        <AttendeeDetailModal
          attendee={mockAttendees[0]}
          isOpen={true}
          onClose={vi.fn()}
          isSelf={false}
          connectionStatus="connected"
        />
      );

      // Telegram handle starts with @
      const telegramLink = screen.getByRole('link', { name: /telegram: @alexchen/i });
      expect(telegramLink).toBeInTheDocument();
      expect(telegramLink).toHaveAttribute('href', 'https://t.me/alexchen');
    });

    it('renders LinkedIn, Email, and generic links properly when connected', () => {
      const { rerender } = render(
        <AttendeeDetailModal
          attendee={mockAttendees[1]} // Sam: linkedin.com/in/sammiller
          isOpen={true}
          onClose={vi.fn()}
          isSelf={false}
          connectionStatus="connected"
        />
      );
      const linkedinLink = screen.getByRole('link', { name: /linkedin profile/i });
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/sammiller');

      // Taylor: email
      rerender(
        <AttendeeDetailModal
          attendee={mockAttendees[2]} // Taylor: taylor@swift.ai
          isOpen={true}
          onClose={vi.fn()}
          isSelf={false}
          connectionStatus="connected"
        />
      );
      const emailLink = screen.getByRole('link', { name: /email: taylor@swift.ai/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:taylor@swift.ai');

      // Jordan: website
      rerender(
        <AttendeeDetailModal
          attendee={mockAttendees[3]} // Jordan: https://jordanlee.design
          isOpen={true}
          onClose={vi.fn()}
          isSelf={false}
          connectionStatus="connected"
        />
      );
      const siteLink = screen.getByRole('link', { name: /contact: https:\/\/jordanlee\.design/i });
      expect(siteLink).toHaveAttribute('href', 'https://jordanlee.design');
    });

    it('renders Edit My Badge & Profile button and triggers onEditProfile when isSelf is true', () => {
      const onEditProfileMock = vi.fn();
      const onCloseMock = vi.fn();

      render(
        <AttendeeDetailModal
          attendee={mockAttendees[0]}
          isOpen={true}
          onClose={onCloseMock}
          isSelf={true}
          connectionStatus="none"
          onEditProfile={onEditProfileMock}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit my badge & profile/i });
      expect(editButton).toBeInTheDocument();

      fireEvent.click(editButton);
      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onEditProfileMock).toHaveBeenCalledTimes(1);
    });

    it('triggers onSendWave when clicking Wave on AttendeeCard without opening modal', async () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]} // Alex is self
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Find Wave button on Sam Miller's card
      const samCard = screen.getByText('Sam Miller').closest('.group')!;
      const waveButton = samCard.querySelector('button')!;
      expect(waveButton).toHaveTextContent(/wave/i);

      fireEvent.click(waveButton);

      expect(onSendWaveMock).toHaveBeenCalledWith('att-2');
      // Verify modal did NOT open because stopPropagation was called
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('triggers onSendWave from AttendeeDetailModal when clicking Wave to Connect', async () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Open Sam Miller's card modal
      const samCard = screen.getByText('Sam Miller').closest('.group')!;
      fireEvent.click(samCard);

      const modalWaveBtn = screen.getByRole('button', { name: /wave to connect/i });
      fireEvent.click(modalWaveBtn);

      expect(onSendWaveMock).toHaveBeenCalledWith('att-2');
    });

    it('triggers onEditProfile when clicking Edit on self card', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]} // Alex is self
          connections={{}}
          onSendWave={onSendWaveMock}
          onEditProfile={onEditProfileMock}
        />
      );

      const editBtn = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editBtn);

      expect(onEditProfileMock).toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('triggers onRefresh when clicking directory refresh button and reflects isLoading state', () => {
      const { rerender } = render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
          onRefresh={onRefreshMock}
          isLoading={false}
        />
      );

      const refreshBtn = screen.getByTitle(/refresh directory/i);
      fireEvent.click(refreshBtn);
      expect(onRefreshMock).toHaveBeenCalledTimes(1);

      // Check spinning class when isLoading is true
      rerender(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
          onRefresh={onRefreshMock}
          isLoading={true}
        />
      );
      const icon = refreshBtn.querySelector('svg');
      expect(icon?.className.baseVal || icon?.className).toContain('animate-spin');
    });
  });

  // =========================================================================
  // 2. Negative & Edge Scenarios
  // =========================================================================
  describe('Negative & Edge Scenarios', () => {
    it('renders empty state when search query matches no attendees', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search attendees, skills, or roles/i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentHacker999' } });

      expect(screen.getByRole('heading', { name: /no attendees found/i })).toBeInTheDocument();
      expect(
        screen.getByText(/try adjusting your search query, clearing your filters/i)
      ).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/of 5 attendees/i)).toBeInTheDocument();
    });

    it('renders empty state when conflicting role and availability filters match no attendees', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Backend role has only Sam Miller, who has is_available_to_chat: false
      const backendBtn = screen.getByRole('button', { name: /^backend$/i });
      fireEvent.click(backendBtn);

      const availableToggle = screen.getByTitle(/filter attendees available right now/i);
      fireEvent.click(availableToggle);

      expect(screen.getByRole('heading', { name: /no attendees found/i })).toBeInTheDocument();
    });

    it('renders cleanly without runtime exceptions for attendees with missing bio, empty skills, and null handles', () => {
      // Ghost Member has empty skills, null bio, null headline, null contact handle
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const ghostCard = screen.getByText('Ghost Member').closest('.group')!;
      expect(ghostCard).toBeInTheDocument();

      // Open Ghost Member modal
      fireEvent.click(ghostCard);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      const modal = within(dialog);
      expect(modal.getByText('Ghost Member')).toBeInTheDocument();
      expect(modal.getByText(/tech stack & skills/i)).toBeInTheDocument();
      expect(modal.getByText(/shielded/i)).toBeInTheDocument();
    });

    it('clears search input when clicking clear (X) button, restoring the full attendee list', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const searchInput = screen.getByPlaceholderText(
        /search attendees, skills, or roles/i
      ) as HTMLInputElement;

      fireEvent.change(searchInput, { target: { value: 'Sam' } });
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
      expect(screen.queryByText('Alex Chen')).not.toBeInTheDocument();

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Alex Chen')).toBeInTheDocument();
      expect(screen.getByText('Sam Miller')).toBeInTheDocument();
    });

    it('closes detail modal via the close button', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Open modal
      const alexCard = screen.getByText('Alex Chen').closest('.group')!;
      fireEvent.click(alexCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click Close button
      const closeBtn = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes detail modal via backdrop click', () => {
      const { container } = render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Open modal
      const alexCard = screen.getByText('Alex Chen').closest('.group')!;
      fireEvent.click(alexCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click backdrop (aria-hidden="true" fixed inset-0)
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/75')!;
      fireEvent.click(backdrop);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes detail modal when pressing Escape key', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const alexCard = screen.getByText('Alex Chen').closest('.group')!;
      fireEvent.click(alexCard);
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays Waved state and disables waving when connectionStatus is pending', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]}
          connections={{ 'att-2': 'pending' }}
          onSendWave={onSendWaveMock}
        />
      );

      // Sam Miller's card displays 'Waved'
      expect(screen.getByText('Waved')).toBeInTheDocument();

      // Open modal
      const samCard = screen.getByText('Sam Miller').closest('.group')!;
      fireEvent.click(samCard);

      const pendingBtn = screen.getByRole('button', {
        name: /wave sent \(waiting for response\)/i,
      });
      expect(pendingBtn).toBeDisabled();
    });

    it('displays Connected badge when connectionStatus is connected', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]}
          connections={{ 'att-2': 'connected' }}
          onSendWave={onSendWaveMock}
        />
      );

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('displays self contact info when viewing self in modal', () => {
      render(
        <AttendeeDetailModal
          attendee={mockAttendees[0]} // Alex Chen (@alexchen)
          isOpen={true}
          onClose={vi.fn()}
          isSelf={true}
          connectionStatus="none"
        />
      );

      expect(screen.getByText(/your contact info is:/i)).toBeInTheDocument();
      expect(screen.getByText('@alexchen')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. AvailabilityToggle Component & Integration
  // =========================================================================
  describe('AvailabilityToggle Component & In-Person Status Flow', () => {
    it('renders inactive status and opens zone selection modal when clicked', () => {
      const onUpdateMock = vi.fn().mockResolvedValue(undefined);
      render(
        <AvailabilityToggle
          isAvailable={false}
          currentZone={null}
          onUpdate={onUpdateMock}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /set available/i });
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(
        screen.getByRole('heading', { name: /in-person availability status/i })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/e\.g\. table 14 or coffee lounge/i)
      ).toBeInTheDocument();
    });

    it('allows selecting preset common zones and confirms availability with onUpdate', async () => {
      const onUpdateMock = vi.fn().mockResolvedValue(undefined);
      render(
        <AvailabilityToggle
          isAvailable={false}
          currentZone={null}
          onUpdate={onUpdateMock}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /set available/i }));

      // Click a common zone chip: "Coffee & Snacks Lounge"
      const coffeeChip = screen.getByRole('button', { name: /coffee & snacks lounge/i });
      fireEvent.click(coffeeChip);

      const zoneInput = screen.getByPlaceholderText(
        /e\.g\. table 14 or coffee lounge/i
      ) as HTMLInputElement;
      expect(zoneInput.value).toBe('Coffee & Snacks Lounge');

      // Submit modal form
      const submitBtn = screen.getByRole('button', {
        name: /set status: available to chat/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onUpdateMock).toHaveBeenCalledWith(true, 'Coffee & Snacks Lounge');
      });
    });

    it('defaults zone to Venue Hall if user submits empty zone', async () => {
      const onUpdateMock = vi.fn().mockResolvedValue(undefined);
      render(
        <AvailabilityToggle
          isAvailable={false}
          currentZone={null}
          onUpdate={onUpdateMock}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /set available/i }));

      const zoneInput = screen.getByPlaceholderText(/e\.g\. table 14 or coffee lounge/i);
      fireEvent.change(zoneInput, { target: { value: '   ' } });

      const submitBtn = screen.getByRole('button', {
        name: /set status: available to chat/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onUpdateMock).toHaveBeenCalledWith(true, 'Venue Hall');
      });
    });

    it('renders active status with zone badge and toggles off when clicked', async () => {
      const onUpdateMock = vi.fn().mockResolvedValue(undefined);
      render(
        <AvailabilityToggle
          isAvailable={true}
          currentZone="Table 12"
          onUpdate={onUpdateMock}
        />
      );

      const activeBtn = screen.getByRole('button', { name: /available to chat/i });
      expect(activeBtn).toBeInTheDocument();

      const zoneBadge = screen.getByRole('button', { name: /table 12/i });
      expect(zoneBadge).toBeInTheDocument();

      // Toggling off immediately calls onUpdate(false, null)
      fireEvent.click(activeBtn);

      await waitFor(() => {
        expect(onUpdateMock).toHaveBeenCalledWith(false, null);
      });
    });

    it('opens modal to edit zone when current zone badge is clicked', () => {
      const onUpdateMock = vi.fn().mockResolvedValue(undefined);
      render(
        <AvailabilityToggle
          isAvailable={true}
          currentZone="Stage A"
          onUpdate={onUpdateMock}
        />
      );

      const zoneBadge = screen.getByRole('button', { name: /stage a/i });
      fireEvent.click(zoneBadge);

      expect(
        screen.getByRole('heading', { name: /in-person availability status/i })
      ).toBeInTheDocument();
      const zoneInput = screen.getByPlaceholderText(
        /e\.g\. table 14 or coffee lounge/i
      ) as HTMLInputElement;
      expect(zoneInput.value).toBe('Stage A');
    });
  });

  // =========================================================================
  // 4. Mobile Responsiveness & Touch Target Ergonomics
  // =========================================================================
  describe('Mobile Responsiveness & Touch Target Ergonomics', () => {
    it('applies responsive grid classes to the attendee list', () => {
      const { container } = render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      // Single column on mobile (< sm), 2 columns on desktop (>= sm)
      const grid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toContain('gap-3.5');
    });

    it('applies mobile container padding and scroll boundary', () => {
      const { container } = render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const rootContainer = container.querySelector('.max-w-4xl.mx-auto.p-4.sm\\:p-6.pb-24');
      expect(rootContainer).toBeInTheDocument();
    });

    it('enforces touch target standards of at least 44px on primary controls', () => {
      render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={mockAttendees[0]}
          connections={{}}
          onSendWave={onSendWaveMock}
          onEditProfile={onEditProfileMock}
        />
      );

      // Search input min-height 44px
      const searchInput = screen.getByPlaceholderText(/search attendees, skills, or roles/i);
      expect(searchInput.className).toMatch(/min-h-\[44px\]/);

      // Available filter button min-height 44px
      const availableToggle = screen.getByTitle(/filter attendees available right now/i);
      expect(availableToggle.className).toMatch(/min-h-\[44px\]/);

      // Role filter chips minimum 38px
      const roleChip = screen.getByRole('button', { name: /^frontend$/i });
      expect(roleChip.className).toMatch(/min-h-\[38px\]/);

      // Edit profile button on self card minimum 44px
      const editBtn = screen.getByRole('button', { name: /edit/i });
      expect(editBtn.className).toMatch(/min-h-\[44px\]/);

      // Wave button on other card minimum 44px
      const samCard = screen.getByText('Sam Miller').closest('.group')!;
      const waveBtn = samCard.querySelector('button')!;
      expect(waveBtn.className).toMatch(/min-h-\[44px\]/);
    });

    it('provides horizontal swipe containers with no-scrollbar for role chips and skills cloud', () => {
      const { container } = render(
        <DirectoryPage
          room={mockRoom}
          attendees={mockAttendees}
          currentAttendee={null}
          connections={{}}
          onSendWave={onSendWaveMock}
        />
      );

      const horizontalScrollAreas = container.querySelectorAll('.overflow-x-auto.no-scrollbar');
      expect(horizontalScrollAreas.length).toBeGreaterThanOrEqual(2);
    });

    it('formats modal as bottom sheet on mobile and centered modal on desktop', () => {
      const { container } = render(
        <AttendeeDetailModal
          attendee={mockAttendees[0]}
          isOpen={true}
          onClose={vi.fn()}
          isSelf={false}
        />
      );

      const modalDialog = container.querySelector(
        '.flex.items-end.sm\\:items-center.justify-center.p-0.sm\\:p-4'
      );
      expect(modalDialog).toBeInTheDocument();

      const modalSurface = container.querySelector('.rounded-t-3xl.sm\\:rounded-3xl');
      expect(modalSurface).toBeInTheDocument();
    });
  });
});
