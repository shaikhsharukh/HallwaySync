import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import confetti from 'canvas-confetti';
import { ConnectionsPage } from '../../src/features/connections/ConnectionsPage';
import { MyBadgeModal } from '../../src/features/connections/MyBadgeModal';
import { QRBadgeScanner } from '../../src/features/connections/QRBadgeScanner';
import { MutualMatchModal } from '../../src/features/connections/MutualMatchModal';
import { connectionService } from '../../src/features/connections/connection-service';
import { Attendee, ConnectionWithProfile } from '../../src/types/models';

// Mock Supabase to ensure clean offline/local test execution
vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {},
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock html5-qrcode
let mockScannerStart: any = null;
let mockScannerStop: any = null;
let mockScannerClear: any = null;
let lastScanSuccessCallback: ((decodedText: string) => void) | null = null;
let lastScanFailureCallback: (() => void) | null = null;

vi.mock('html5-qrcode', () => {
  return {
    Html5Qrcode: class MockHtml5Qrcode {
      elementId: string;
      constructor(elementId: string) {
        this.elementId = elementId;
      }
      async start(camera: any, config: any, onSuccess: any, onError: any) {
        lastScanSuccessCallback = onSuccess;
        lastScanFailureCallback = onError;
        if (mockScannerStart) {
          return mockScannerStart(camera, config, onSuccess, onError);
        }
        return Promise.resolve();
      }
      async stop() {
        if (mockScannerStop) return mockScannerStop();
        return Promise.resolve();
      }
      async clear() {
        if (mockScannerClear) return mockScannerClear();
        return Promise.resolve();
      }
    },
  };
});

describe('Connections & QR Badge Feature Flow', () => {
  // Test Fixtures
  const currentUser: Attendee = {
    id: 'user_current',
    room_id: 'room_devfest',
    display_name: 'Alice Developer',
    role: 'Frontend',
    headline: 'Senior UI/UX Engineer',
    bio: 'Passionate about building fast, responsive web apps',
    skills: ['React', 'TypeScript', 'TailwindCSS'],
    intent: ['Collaborate', 'Find Teammates'],
    contact_handle: '@alice_tg',
    avatar_color: '#38bdf8',
    avatar_github: 'alice-dev',
    is_available_to_chat: true,
    available_until: null,
    current_zone: 'Hack Hall A',
    is_banned: false,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-01T10:00:00Z',
  };

  const partnerBob: Attendee = {
    id: 'user_bob',
    room_id: 'room_devfest',
    display_name: 'Bob Backend',
    role: 'Backend',
    headline: 'Distributed Systems Architect',
    bio: 'Postgres & Go specialist',
    skills: ['Go', 'PostgreSQL', 'Supabase', 'Docker'],
    intent: ['Collaborate'],
    contact_handle: 'https://linkedin.com/in/bob-backend',
    avatar_color: '#10b981',
    avatar_github: '@bob-engineer',
    is_available_to_chat: true,
    available_until: null,
    current_zone: 'Coffee Bar',
    is_banned: false,
    created_at: '2026-11-01T10:05:00Z',
    updated_at: '2026-11-01T10:05:00Z',
  };

  const partnerCharlie: Attendee = {
    id: 'user_charlie',
    room_id: 'room_devfest',
    display_name: 'Charlie Telegram',
    role: 'AI/ML',
    headline: 'LLM fine-tuning researcher',
    bio: 'Exploring agentic architectures',
    skills: ['Python', 'PyTorch'],
    intent: ['Hire'],
    contact_handle: '@charlie_ai',
    avatar_color: '#f59e0b',
    avatar_github: 'charlie-ml',
    is_available_to_chat: true,
    available_until: null,
    current_zone: 'Stage Lounge',
    is_banned: false,
    created_at: '2026-11-01T10:10:00Z',
    updated_at: '2026-11-01T10:10:00Z',
  };

  const partnerDanaMinimal: Attendee = {
    id: 'user_dana',
    room_id: 'room_devfest',
    display_name: 'Dana Minimal',
    role: 'UI/UX',
    headline: null,
    bio: null,
    skills: [],
    intent: [],
    contact_handle: null,
    avatar_color: '#ec4899',
    avatar_github: null,
    is_available_to_chat: false,
    available_until: null,
    current_zone: null,
    is_banned: false,
    created_at: '2026-11-01T10:15:00Z',
    updated_at: '2026-11-01T10:15:00Z',
  };

  const partnerEvanCustomHandle: Attendee = {
    id: 'user_evan',
    room_id: 'room_devfest',
    display_name: 'Evan Custom',
    role: 'Product',
    headline: 'Technical PM',
    bio: null,
    skills: ['Product Strategy'],
    intent: [],
    contact_handle: 'matrix:@evan:matrix.org',
    avatar_color: '#8b5cf6',
    avatar_github: null,
    is_available_to_chat: true,
    available_until: null,
    current_zone: 'Room Entrance',
    is_banned: false,
    created_at: '2026-11-01T10:20:00Z',
    updated_at: '2026-11-01T10:20:00Z',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockScannerStart = null;
    mockScannerStop = null;
    mockScannerClear = null;
    lastScanSuccessCallback = null;
    lastScanFailureCallback = null;
  });

  // ==========================================
  // 1. POSITIVE SCENARIOS: ConnectionsPage
  // ==========================================
  describe('Positive Scenarios - ConnectionsPage', () => {
    it('renders tabs: "Mutual Connections" and "Waves Sent & Received" with correct counts', () => {
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_1',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerBob.id,
          status: 'connected',
          connection_type: 'wave',
          created_at: '2026-11-01T10:30:00Z',
          updated_at: '2026-11-01T10:35:00Z',
          partner: partnerBob,
        },
        {
          id: 'conn_2',
          room_id: 'room_devfest',
          requester_id: partnerCharlie.id,
          recipient_id: currentUser.id,
          status: 'pending',
          connection_type: 'wave',
          created_at: '2026-11-01T10:40:00Z',
          updated_at: '2026-11-01T10:40:00Z',
          partner: partnerCharlie,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Verify Tab 1 (Mutual Connections) and its count badge
      const mutualTab = screen.getByRole('button', { name: /mutual connections/i });
      expect(mutualTab).toBeInTheDocument();
      expect(within(mutualTab).getByText('1')).toBeInTheDocument();

      // Verify Tab 2 (Waves Sent & Received) and its count badge
      const pendingTab = screen.getByRole('button', { name: /waves sent & received/i });
      expect(pendingTab).toBeInTheDocument();
      expect(within(pendingTab).getByText('1')).toBeInTheDocument();

      // Default active tab is 'connected'
      expect(screen.getByText('Bob Backend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('displays list of connected attendees with avatar, role, zone, and social links (GitHub, LinkedIn, Telegram)', () => {
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_bob',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerBob.id,
          status: 'connected',
          connection_type: 'wave',
          created_at: '2026-11-01T10:30:00Z',
          updated_at: '2026-11-01T10:35:00Z',
          partner: partnerBob,
        },
        {
          id: 'conn_charlie',
          room_id: 'room_devfest',
          requester_id: partnerCharlie.id,
          recipient_id: currentUser.id,
          status: 'connected',
          connection_type: 'qr_scan',
          created_at: '2026-11-01T10:32:00Z',
          updated_at: '2026-11-01T10:32:00Z',
          partner: partnerCharlie,
        },
        {
          id: 'conn_evan',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerEvanCustomHandle.id,
          status: 'connected',
          connection_type: 'qr_scan',
          created_at: '2026-11-01T10:33:00Z',
          updated_at: '2026-11-01T10:33:00Z',
          partner: partnerEvanCustomHandle,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Verify Bob's profile & LinkedIn + GitHub links
      expect(screen.getByText('Bob Backend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('• Coffee Bar')).toBeInTheDocument();

      const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
      expect(linkedInLink).toHaveAttribute('href', 'https://linkedin.com/in/bob-backend');
      expect(linkedInLink).toHaveAttribute('target', '_blank');

      const githubLinks = screen.getAllByRole('link', { name: /github profile/i });
      expect(githubLinks.length).toBeGreaterThanOrEqual(1);
      expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/bob-engineer');

      // Verify Charlie's Telegram handle link
      expect(screen.getByText('Charlie Telegram')).toBeInTheDocument();
      expect(screen.getByText('AI/ML')).toBeInTheDocument();
      const telegramLink = screen.getByRole('link', { name: /telegram/i });
      expect(telegramLink).toHaveAttribute('href', 'https://t.me/charlie_ai');

      // Verify Evan's custom matrix handle is rendered as text
      expect(screen.getByText('Evan Custom')).toBeInTheDocument();
      expect(screen.getByText('matrix:@evan:matrix.org')).toBeInTheDocument();
    });

    it('clicking "My Badge" calls onOpenMyBadge', () => {
      const onOpenMyBadge = vi.fn();
      render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={onOpenMyBadge}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      const myBadgeBtn = screen.getByRole('button', { name: /my badge qr/i });
      fireEvent.click(myBadgeBtn);
      expect(onOpenMyBadge).toHaveBeenCalledTimes(1);
    });

    it('clicking "Scan Badge" calls onOpenScanner', () => {
      const onOpenScanner = vi.fn();
      render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={onOpenScanner}
          onAcceptWave={vi.fn()}
        />
      );

      const scanBadgeBtn = screen.getByRole('button', { name: /scan peer badge/i });
      fireEvent.click(scanBadgeBtn);
      expect(onOpenScanner).toHaveBeenCalledTimes(1);
    });

    it('switching to pending tab displays incoming and outgoing waves correctly', () => {
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_incoming',
          room_id: 'room_devfest',
          requester_id: partnerBob.id,
          recipient_id: currentUser.id,
          status: 'pending',
          connection_type: 'wave',
          created_at: '2026-11-01T10:40:00Z',
          updated_at: '2026-11-01T10:40:00Z',
          partner: partnerBob,
        },
        {
          id: 'conn_outgoing',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerCharlie.id,
          status: 'pending',
          connection_type: 'wave',
          created_at: '2026-11-01T10:45:00Z',
          updated_at: '2026-11-01T10:45:00Z',
          partner: partnerCharlie,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Switch to Pending tab
      const pendingTabBtn = screen.getByRole('button', { name: /waves sent & received/i });
      fireEvent.click(pendingTabBtn);

      // Incoming wave
      expect(screen.getByText(/Bob Backend waved at you 👋/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /wave back/i })).toBeInTheDocument();

      // Outgoing wave
      expect(screen.getByText(/You waved • Waiting for response/i)).toBeInTheDocument();
      expect(screen.getByText('Charlie Telegram')).toBeInTheDocument();
    });

    it('clicking "Accept Wave" (Wave Back) triggers onAcceptWave with the connection ID', async () => {
      const onAcceptWave = vi.fn().mockResolvedValue(undefined);
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_incoming_999',
          room_id: 'room_devfest',
          requester_id: partnerBob.id,
          recipient_id: currentUser.id,
          status: 'pending',
          connection_type: 'wave',
          created_at: '2026-11-01T10:40:00Z',
          updated_at: '2026-11-01T10:40:00Z',
          partner: partnerBob,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={onAcceptWave}
        />
      );

      // Navigate to pending tab
      fireEvent.click(screen.getByRole('button', { name: /waves sent & received/i }));

      // Find Wave Back button and click it
      const waveBackBtn = screen.getByRole('button', { name: /wave back/i });
      fireEvent.click(waveBackBtn);

      expect(onAcceptWave).toHaveBeenCalledTimes(1);
      expect(onAcceptWave).toHaveBeenCalledWith('conn_incoming_999');
    });
  });

  // ==========================================
  // 2. POSITIVE SCENARIOS: MyBadgeModal
  // ==========================================
  describe('Positive Scenarios - MyBadgeModal', () => {
    it('renders badge presentation, attendee name, role, and QR code SVG encoding hallway sync payload', () => {
      const onClose = vi.fn();
      const { container } = render(
        <MyBadgeModal
          isOpen={true}
          onClose={onClose}
          attendee={currentUser}
          roomId="room_devfest"
        />
      );

      expect(screen.getByText('In-Person Networking Badge')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /show to connect/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /alice developer/i })).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Instant Bidirectional Handshake')).toBeInTheDocument();

      // Check that QR Code SVG is rendered inside the white container
      const qrWrapper = container.querySelector('.bg-white.rounded-xl');
      expect(qrWrapper).toBeInTheDocument();
      const qrSvg = qrWrapper?.querySelector('svg');
      expect(qrSvg).toBeInTheDocument();
      expect(qrSvg).toHaveAttribute('height', '180');
      expect(qrSvg).toHaveAttribute('width', '180');
    });

    it('renders null when isOpen is false or attendee is null', () => {
      const { container: closedContainer } = render(
        <MyBadgeModal
          isOpen={false}
          onClose={vi.fn()}
          attendee={currentUser}
          roomId="room_devfest"
        />
      );
      expect(closedContainer.firstChild).toBeNull();

      const { container: nullUserContainer } = render(
        <MyBadgeModal
          isOpen={true}
          onClose={vi.fn()}
          attendee={null}
          roomId="room_devfest"
        />
      );
      expect(nullUserContainer.firstChild).toBeNull();
    });
  });

  // ==========================================
  // 3. POSITIVE SCENARIOS: MutualMatchModal
  // ==========================================
  describe('Positive Scenarios - MutualMatchModal', () => {
    it('renders mutual match celebration, attendee profiles, unlocked contacts, and triggers confetti animation', () => {
      const onClose = vi.fn();
      render(
        <MutualMatchModal
          isOpen={true}
          onClose={onClose}
          currentUser={currentUser}
          partner={partnerBob}
        />
      );

      // Verify confetti trigger
      expect(confetti).toHaveBeenCalledTimes(1);
      expect(confetti).toHaveBeenCalledWith(
        expect.objectContaining({
          particleCount: 80,
          spread: 70,
          colors: ['#3ECF8E', '#38bdf8', '#c084fc', '#facc15'],
        })
      );

      // Verify celebration text
      expect(screen.getByText("It's a Mutual Match!")).toBeInTheDocument();
      expect(screen.getByText(/You & Bob Backend connected!/i)).toBeInTheDocument();

      // Verify both avatars are represented
      expect(screen.getByText('Bob Backend\'s Contact Channel')).toBeInTheDocument();

      // Verify unlocked LinkedIn contact button
      const linkedInBtn = screen.getByRole('link', { name: /connect on linkedin/i });
      expect(linkedInBtn).toBeInTheDocument();
      expect(linkedInBtn).toHaveAttribute('href', 'https://linkedin.com/in/bob-backend');

      // Verify unlocked GitHub link
      const githubLink = screen.getByRole('link', { name: /github\.com\/bob-engineer/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/bob-engineer');

      // Click "Done" calls onClose
      const doneBtn = screen.getByRole('button', { name: /done/i });
      fireEvent.click(doneBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders Telegram contact button for partners with @ telegram handle', () => {
      render(
        <MutualMatchModal
          isOpen={true}
          onClose={vi.fn()}
          currentUser={currentUser}
          partner={partnerCharlie}
        />
      );

      const telegramLink = screen.getByRole('link', { name: /open telegram \(@charlie_ai\)/i });
      expect(telegramLink).toBeInTheDocument();
      expect(telegramLink).toHaveAttribute('href', 'https://t.me/charlie_ai');
    });

    it('renders plain text contact container for custom non-standard handles', () => {
      render(
        <MutualMatchModal
          isOpen={true}
          onClose={vi.fn()}
          currentUser={currentUser}
          partner={partnerEvanCustomHandle}
        />
      );

      expect(screen.getByText('matrix:@evan:matrix.org')).toBeInTheDocument();
    });
  });

  // ==========================================
  // 4. NEGATIVE & EDGE SCENARIOS
  // ==========================================
  describe('Negative & Edge Scenarios', () => {
    it('shows empty state guidance when active tab has no mutual connections', () => {
      render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      expect(screen.getByText('No mutual connections yet')).toBeInTheDocument();
      expect(
        screen.getByText(
          /Wave at people in the directory or scan their QR badge to unlock direct contact channels\./i
        )
      ).toBeInTheDocument();
    });

    it('shows empty state guidance when pending waves tab has no waves', () => {
      render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Switch to pending tab
      fireEvent.click(screen.getByRole('button', { name: /waves sent & received/i }));

      expect(screen.getByText('No pending waves')).toBeInTheDocument();
      expect(
        screen.getByText(/Explore the room directory and wave at fellow builders!/i)
      ).toBeInTheDocument();
    });

    it('handles QRBadgeScanner camera access error gracefully when permission is denied or camera is missing', async () => {
      const onClose = vi.fn();
      mockScannerStart = vi.fn().mockRejectedValue(new Error('NotAllowedError: Permission denied by user'));

      render(
        <QRBadgeScanner
          isOpen={true}
          onClose={onClose}
          roomId="room_devfest"
          onScanSuccess={vi.fn()}
        />
      );

      // Wait for scanner initialization timeout (200ms) to trigger catch block
      await waitFor(() => {
        expect(screen.getByText('NotAllowedError: Permission denied by user')).toBeInTheDocument();
      });

      // Verify "Close Scanner" button is shown and clickable
      const closeBtn = screen.getByRole('button', { name: /close scanner/i });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles QRBadgeScanner camera error fallback when error object has no message', async () => {
      const onClose = vi.fn();
      mockScannerStart = vi.fn().mockRejectedValue({});

      render(
        <QRBadgeScanner
          isOpen={true}
          onClose={onClose}
          roomId="room_devfest"
          onScanSuccess={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Camera permission denied or camera not accessible in this browser.')
        ).toBeInTheDocument();
      });
    });

    it('QRBadgeScanner successfully scans valid badge and triggers onScanSuccess + onClose', async () => {
      const onClose = vi.fn();
      const onScanSuccess = vi.fn();
      mockScannerStart = vi.fn().mockResolvedValue(undefined);

      render(
        <QRBadgeScanner
          isOpen={true}
          onClose={onClose}
          roomId="room_devfest"
          onScanSuccess={onScanSuccess}
        />
      );

      // Wait for scanner to start
      await waitFor(() => {
        expect(lastScanSuccessCallback).not.toBeNull();
      });

      // Simulate a successful QR scan with hallwaysync prefix
      lastScanSuccessCallback!('hallwaysync:badge:room_devfest:user_bob');

      expect(onScanSuccess).toHaveBeenCalledWith('user_bob');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('QRBadgeScanner supports legacy hackbuild:badge: prefix', async () => {
      const onClose = vi.fn();
      const onScanSuccess = vi.fn();
      mockScannerStart = vi.fn().mockResolvedValue(undefined);

      render(
        <QRBadgeScanner
          isOpen={true}
          onClose={onClose}
          roomId="room_devfest"
          onScanSuccess={onScanSuccess}
        />
      );

      await waitFor(() => {
        expect(lastScanSuccessCallback).not.toBeNull();
      });

      // Simulate legacy format scan
      lastScanSuccessCallback!('hackbuild:badge:room_devfest:user_charlie');

      expect(onScanSuccess).toHaveBeenCalledWith('user_charlie');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('QRBadgeScanner ignores invalid QR formats and frames without valid payload', async () => {
      const onClose = vi.fn();
      const onScanSuccess = vi.fn();
      mockScannerStart = vi.fn().mockResolvedValue(undefined);

      render(
        <QRBadgeScanner
          isOpen={true}
          onClose={onClose}
          roomId="room_devfest"
          onScanSuccess={onScanSuccess}
        />
      );

      await waitFor(() => {
        expect(lastScanSuccessCallback).not.toBeNull();
      });

      // Scan unrelated URL or text
      lastScanSuccessCallback!('https://some-random-site.com');
      lastScanSuccessCallback!('badge:invalid:format');

      // Neither callback should be called
      expect(onScanSuccess).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();

      // Test scanner frame error callback doesn't throw
      expect(() => {
        if (lastScanFailureCallback) lastScanFailureCallback();
      }).not.toThrow();
    });

    it('dismissing MutualMatchModal calls onClose via close button and Escape key', () => {
      const onClose = vi.fn();
      render(
        <MutualMatchModal
          isOpen={true}
          onClose={onClose}
          currentUser={currentUser}
          partner={partnerBob}
        />
      );

      // Modal close button with aria-label="Close dialog"
      const closeDialogBtn = screen.getByRole('button', { name: /close dialog/i });
      fireEvent.click(closeDialogBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      // Escape key press
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('dismissing MutualMatchModal returns null when closed or props are missing', () => {
      const { container: closed } = render(
        <MutualMatchModal
          isOpen={false}
          onClose={vi.fn()}
          currentUser={currentUser}
          partner={partnerBob}
        />
      );
      expect(closed.firstChild).toBeNull();

      const { container: noPartner } = render(
        <MutualMatchModal
          isOpen={true}
          onClose={vi.fn()}
          currentUser={currentUser}
          partner={null}
        />
      );
      expect(noPartner.firstChild).toBeNull();

      const { container: noUser } = render(
        <MutualMatchModal
          isOpen={true}
          onClose={vi.fn()}
          currentUser={null}
          partner={partnerBob}
        />
      );
      expect(noUser.firstChild).toBeNull();
    });

    it('renders connected attendee with missing optional profiles (no contact, no github, no zone) gracefully without error', () => {
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_dana',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerDanaMinimal.id,
          status: 'connected',
          connection_type: 'wave',
          created_at: '2026-11-01T10:30:00Z',
          updated_at: '2026-11-01T10:35:00Z',
          partner: partnerDanaMinimal,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      expect(screen.getByText('Dana Minimal')).toBeInTheDocument();
      expect(screen.getByText('UI/UX')).toBeInTheDocument();
      // Should show fallback "No contact link"
      expect(screen.getByText('No contact link')).toBeInTheDocument();
      // Should not have any github links
      expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
    });

    it('MutualMatchModal handles partner with no contact handle gracefully', () => {
      render(
        <MutualMatchModal
          isOpen={true}
          onClose={vi.fn()}
          currentUser={currentUser}
          partner={partnerDanaMinimal}
        />
      );

      expect(screen.getByText('No external link provided.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // 5. MOBILE RESPONSIVENESS & TOUCH TARGETS
  // ==========================================
  describe('Mobile Responsiveness & Touch Targets', () => {
    it('tab switch buttons meet minimum touch target height (min-h-[44px])', () => {
      render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      const mutualTab = screen.getByRole('button', { name: /mutual connections/i });
      const pendingTab = screen.getByRole('button', { name: /waves sent & received/i });

      expect(mutualTab.className).toContain('min-h-[44px]');
      expect(pendingTab.className).toContain('min-h-[44px]');
    });

    it('quick action buttons meet 48px touch target and use 2-column responsive grid layout', () => {
      const { container } = render(
        <ConnectionsPage
          connections={[]}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      const gridContainer = container.querySelector('.grid.grid-cols-2.gap-3');
      expect(gridContainer).toBeInTheDocument();

      const myBadgeBtn = screen.getByRole('button', { name: /my badge qr/i });
      const scanBadgeBtn = screen.getByRole('button', { name: /scan peer badge/i });

      expect(myBadgeBtn.className).toContain('min-h-[48px]');
      expect(scanBadgeBtn.className).toContain('min-h-[48px]');
    });

    it('contact action links and wave back buttons satisfy touch target minimum (min-h-[44px])', () => {
      const connections: ConnectionWithProfile[] = [
        {
          id: 'conn_bob',
          room_id: 'room_devfest',
          requester_id: currentUser.id,
          recipient_id: partnerBob.id,
          status: 'connected',
          connection_type: 'wave',
          created_at: '2026-11-01T10:30:00Z',
          updated_at: '2026-11-01T10:35:00Z',
          partner: partnerBob,
        },
        {
          id: 'conn_incoming',
          room_id: 'room_devfest',
          requester_id: partnerBob.id,
          recipient_id: currentUser.id,
          status: 'pending',
          connection_type: 'wave',
          created_at: '2026-11-01T10:40:00Z',
          updated_at: '2026-11-01T10:40:00Z',
          partner: partnerBob,
        },
      ];

      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Contact links on connected tab
      const linkedInLink = screen.getByRole('link', { name: /linkedin/i });
      expect(linkedInLink.className).toContain('min-h-[44px]');

      const githubLink = screen.getByRole('link', { name: /github profile/i });
      expect(githubLink.className).toContain('min-h-[44px]');
      expect(githubLink.className).toContain('min-w-[44px]');

      // Switch to pending tab for Wave Back button
      fireEvent.click(screen.getByRole('button', { name: /waves sent & received/i }));
      const waveBackBtn = screen.getByRole('button', { name: /wave back/i });
      expect(waveBackBtn.className).toContain('min-h-[44px]');
    });

    it('modal dialogs fit within mobile viewports with bottom-sheet on mobile, centered dialog on desktop, and vertical scrolling', () => {
      const { container } = render(
        <MyBadgeModal
          isOpen={true}
          onClose={vi.fn()}
          attendee={currentUser}
          roomId="room_devfest"
        />
      );

      // Outer backdrop/wrapper handles mobile-first sheet: items-end on mobile, sm:items-center on larger screens
      const dialogWrapper = container.querySelector('[role="dialog"]');
      expect(dialogWrapper?.className).toContain('items-end');
      expect(dialogWrapper?.className).toContain('sm:items-center');
      expect(dialogWrapper?.className).toContain('p-0');
      expect(dialogWrapper?.className).toContain('sm:p-4');

      // Inner modal card has mobile rounded-t-3xl, desktop sm:rounded-3xl, and max-h-[90vh] with scroll
      const modalSurface = dialogWrapper?.querySelector('.rounded-t-3xl.sm\\:rounded-3xl');
      expect(modalSurface).toBeInTheDocument();
      expect(modalSurface?.className).toContain('max-h-[90vh]');
      expect(modalSurface?.className).toContain('overflow-y-auto');

      // Close button meets touch target
      const closeBtn = screen.getByRole('button', { name: /close dialog/i });
      expect(closeBtn.className).toContain('min-h-[44px]');
      expect(closeBtn.className).toContain('min-w-[44px]');
    });
  });

  // ==========================================
  // 6. INTEGRATION FLOW WITH CONNECTION SERVICE
  // ==========================================
  describe('Integration Flow - Service to UI State Transitions', () => {
    it('executes full wave -> mutual match handshake lifecycle in local service and reflects in UI', async () => {
      const roomId = 'room_devfest';

      // 1. Initial State: User A sends a wave to User B
      const wave1 = await connectionService.sendWave(roomId, currentUser, partnerBob.id);
      expect(wave1.connection.status).toBe('pending');
      expect(wave1.isMutual).toBe(false);

      // Verify User B sees incoming wave in their connections query
      const userBConnections = await connectionService.getMyConnections(roomId, partnerBob.id, [
        currentUser,
        partnerBob,
      ]);
      expect(userBConnections).toHaveLength(1);
      expect(userBConnections[0].status).toBe('pending');
      expect(userBConnections[0].requester_id).toBe(currentUser.id);
      expect(userBConnections[0].partner.display_name).toBe('Alice Developer');

      // 2. User B accepts the wave (waves back)
      const wave2 = await connectionService.sendWave(roomId, partnerBob, currentUser.id);
      expect(wave2.isMutual).toBe(true);
      expect(wave2.connection.status).toBe('connected');

      // 3. User A queries connections now - status is 'connected'
      const userAConnections = await connectionService.getMyConnections(roomId, currentUser.id, [
        currentUser,
        partnerBob,
      ]);
      expect(userAConnections).toHaveLength(1);
      expect(userAConnections[0].status).toBe('connected');
      expect(userAConnections[0].partner.display_name).toBe('Bob Backend');

      // 4. Render ConnectionsPage with this resolved state
      render(
        <ConnectionsPage
          connections={userAConnections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      // Verify Bob Backend appears under Mutual Connections
      expect(screen.getByText('Bob Backend')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();

      // Switch to pending tab - should now be empty
      fireEvent.click(screen.getByRole('button', { name: /waves sent & received/i }));
      expect(screen.getByText('No pending waves')).toBeInTheDocument();
    });

    it('executes in-person QR scan badge connection directly into connected status', async () => {
      const roomId = 'room_devfest';

      // Alice scans Charlie's physical badge
      const scannedConnection = await connectionService.scanBadge(
        roomId,
        currentUser.id,
        partnerCharlie.id
      );
      expect(scannedConnection.status).toBe('connected');
      expect(scannedConnection.connection_type).toBe('qr_scan');

      // Query connections
      const connections = await connectionService.getMyConnections(roomId, currentUser.id, [
        currentUser,
        partnerCharlie,
      ]);
      expect(connections).toHaveLength(1);
      expect(connections[0].status).toBe('connected');
      expect(connections[0].partner.display_name).toBe('Charlie Telegram');

      // Render ConnectionsPage
      render(
        <ConnectionsPage
          connections={connections}
          currentAttendee={currentUser}
          onOpenMyBadge={vi.fn()}
          onOpenScanner={vi.fn()}
          onAcceptWave={vi.fn()}
        />
      );

      expect(screen.getByText('Charlie Telegram')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /telegram/i })).toBeInTheDocument();
    });

    it('getMyConnections safely filters connections with missing or unregistered partner profiles', async () => {
      const roomId = 'room_devfest';

      // Create a connection with an attendee ID not in allAttendees list
      await connectionService.sendWave(roomId, currentUser, 'ghost_user_id');

      const connections = await connectionService.getMyConnections(roomId, currentUser.id, [
        currentUser, // 'ghost_user_id' is missing
      ]);

      expect(connections).toEqual([]);
    });
  });
});
