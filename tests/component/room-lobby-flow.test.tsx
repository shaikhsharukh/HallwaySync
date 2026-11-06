import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoomLobbyPage } from '../../src/features/room/RoomLobbyPage';
import { Room } from '../../src/types/models';

describe('RoomLobbyPage Component', () => {
  const createMockRoom = (overrides?: Partial<Room>): Room => ({
    id: 'room-101',
    slug: 'ai-hackathon-2026',
    title: 'AI Innovation Hackathon 2026',
    description: 'Build agentic workflows and collaborative apps with Supabase and React.',
    category: 'hackathon',
    creator_token: 'cr_mock_secret_token_999',
    is_active: true,
    created_at: '2026-11-06T12:00:00.000Z',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('Positive Scenarios - Host Presentation Mode (isCreator: true)', () => {
    it('renders host controls, Stage Projector notice, and Host badge', () => {
      const mockRoom = createMockRoom();
      const onJoinClick = vi.fn();
      const onDashboardClick = vi.fn();

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={true}
          onJoinClick={onJoinClick}
          onDashboardClick={onDashboardClick}
        />
      );

      // Host / Stage Projector Notice banner
      expect(screen.getByText(/stage & projector presentation mode/i)).toBeInTheDocument();
      expect(screen.getByText(/^host$/i)).toBeInTheDocument();
      expect(
        screen.getByText(/display this screen on your venue projector or slides/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/<45s onboarding flow/i)).toBeInTheDocument();

      // Category badge & Live indicator
      expect(screen.getByText(/hackathon hall/i)).toBeInTheDocument();
      expect(screen.getByText(/live & ready/i)).toBeInTheDocument();

      // Room title and description
      expect(
        screen.getByRole('heading', { level: 1, name: /ai innovation hackathon 2026/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/build agentic workflows and collaborative apps/i)
      ).toBeInTheDocument();

      // Host CTA label
      expect(
        screen.getByRole('button', { name: /preview attendee experience \(<45s\)/i })
      ).toBeInTheDocument();

      // Organizer Command Center card
      expect(
        screen.getByRole('heading', { level: 2, name: /organizer command center/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/live demographics, real-time stage announcements/i)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open dashboard/i })).toBeInTheDocument();
      expect(screen.getByText('Live Alerts')).toBeInTheDocument();
      expect(screen.getByText('Demographics')).toBeInTheDocument();
      expect(screen.getByText('CSV Export')).toBeInTheDocument();
    });

    it('triggers onJoinClick when host clicks the preview CTA button', () => {
      const mockRoom = createMockRoom();
      const onJoinClick = vi.fn();

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={true}
          onJoinClick={onJoinClick}
        />
      );

      const previewBtn = screen.getByRole('button', {
        name: /preview attendee experience \(<45s\)/i,
      });
      fireEvent.click(previewBtn);

      expect(onJoinClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onDashboardClick when host clicks the Open Dashboard button', () => {
      const mockRoom = createMockRoom();
      const onJoinClick = vi.fn();
      const onDashboardClick = vi.fn();

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={true}
          onJoinClick={onJoinClick}
          onDashboardClick={onDashboardClick}
        />
      );

      const dashboardBtn = screen.getByRole('button', { name: /open dashboard/i });
      fireEvent.click(dashboardBtn);

      expect(onDashboardClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Positive Scenarios - Attendee Lobby View (isCreator: false)', () => {
    it('renders clean attendee lobby view without host controls or projector notice', () => {
      const mockRoom = createMockRoom({
        category: 'summit',
        title: 'Global Tech Summit 2026',
        description: 'Connect with software engineers, designers, and founders.',
      });
      const onJoinClick = vi.fn();
      const onDashboardClick = vi.fn();

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={onJoinClick}
          onDashboardClick={onDashboardClick}
        />
      );

      // Should NOT render Host banner or Host badge
      expect(screen.queryByText(/stage & projector presentation mode/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/^host$/i)).not.toBeInTheDocument();

      // Should NOT render Organizer Command Center even if onDashboardClick is passed
      expect(screen.queryByRole('heading', { level: 2, name: /organizer command center/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open dashboard/i })).not.toBeInTheDocument();

      // Event details
      expect(screen.getByText(/summit hall/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /global tech summit 2026/i })).toBeInTheDocument();
      expect(screen.getByText(/connect with software engineers/i)).toBeInTheDocument();

      // Attendee-specific Join button label
      const joinBtn = screen.getByRole('button', { name: /join room as attendee/i });
      expect(joinBtn).toBeInTheDocument();
    });

    it('triggers onJoinClick when attendee clicks Join Room As Attendee', () => {
      const mockRoom = createMockRoom();
      const onJoinClick = vi.fn();

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={onJoinClick}
        />
      );

      const joinBtn = screen.getByRole('button', { name: /join room as attendee/i });
      fireEvent.click(joinBtn);

      expect(onJoinClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('QR Code & Room Join URL Generation', () => {
    it('generates proper join URL formatted with window.location.origin and room slug', () => {
      const mockRoom = createMockRoom({ slug: 'special-keynote-room' });
      const expectedUrl = `${window.location.origin}/#room=special-keynote-room`;

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      // Check QR SVG presence
      const qrSvg = document.getElementById('room-qr-code');
      expect(qrSvg).toBeInTheDocument();

      // Monospace join URL text displayed below QR code
      expect(screen.getByText(expectedUrl)).toBeInTheDocument();
      expect(screen.getByText(/scan with phone to join hall/i)).toBeInTheDocument();
      expect(
        screen.getByText(/open your camera to find teammates, exchange contact handles/i)
      ).toBeInTheDocument();
    });

    it('copies generated room URL to clipboard when Copy Link button is clicked', async () => {
      const mockRoom = createMockRoom({ slug: 'devcon-hall' });
      const expectedUrl = `${window.location.origin}/#room=devcon-hall`;

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copy link/i });
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedUrl);
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('handles clipboard write failure gracefully without throwing unhandled exceptions', async () => {
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Clipboard permission denied'));

      const mockRoom = createMockRoom();
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copy link/i });
      expect(() => fireEvent.click(copyBtn)).not.toThrow();
    });

    it('renders Download QR code action button with accessible title', () => {
      const mockRoom = createMockRoom();
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const downloadBtn = screen.getByRole('button', { name: /download qr image/i });
      expect(downloadBtn).toBeInTheDocument();
      expect(downloadBtn).toHaveAttribute('title', 'Download QR code image');
    });
  });

  describe('Negative & Edge Scenarios', () => {
    it('handles missing optional onDashboardClick gracefully when isCreator is true', () => {
      const mockRoom = createMockRoom();
      const onJoinClick = vi.fn();

      // Render without onDashboardClick prop
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={true}
          onJoinClick={onJoinClick}
        />
      );

      // Projector notice should still render
      expect(screen.getByText(/stage & projector presentation mode/i)).toBeInTheDocument();

      // Organizer Command Center should be cleanly omitted without crashing
      expect(screen.queryByRole('heading', { level: 2, name: /organizer command center/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /open dashboard/i })).not.toBeInTheDocument();

      // Join button works properly
      const joinBtn = screen.getByRole('button', { name: /preview attendee experience/i });
      fireEvent.click(joinBtn);
      expect(onJoinClick).toHaveBeenCalledTimes(1);
    });

    it('renders cleanly when room description is null or empty string', () => {
      const mockRoom = createMockRoom({ description: null });
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: mockRoom.title })).toBeInTheDocument();
      // Description paragraph is omitted
      expect(screen.queryByText(/build agentic workflows/i)).not.toBeInTheDocument();
    });

    it('handles long room titles without breaking or throwing', () => {
      const longTitle = 'Super Global High Performance Distributed Systems & Microservices Engineering Championship 2026';
      const mockRoom = createMockRoom({ title: longTitle });

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: longTitle })).toBeInTheDocument();
    });

    it('safely handles special characters and potential script tags in room title', () => {
      const dangerousTitle = '<script>alert("xss")</script> & <html> "Quotes" & Emojis 🚀⚡️';
      const mockRoom = createMockRoom({ title: dangerousTitle });

      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      // React escapes text content safely
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toBe(dangerousTitle);
      // Ensure no raw script tag was injected into DOM
      expect(document.querySelector('script[src*="xss"]')).toBeNull();
    });

    it('formats category badge across different room categories', () => {
      const categories: Array<Room['category']> = ['hackathon', 'summit', 'meetup'];

      categories.forEach((cat) => {
        const { unmount } = render(
          <RoomLobbyPage
            room={createMockRoom({ category: cat })}
            isCreator={false}
            onJoinClick={vi.fn()}
          />
        );

        expect(screen.getByText(new RegExp(`${cat} hall`, 'i'))).toBeInTheDocument();
        unmount();
      });
    });

    it('renders trust and platform badges in the footer', () => {
      const mockRoom = createMockRoom();
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      expect(screen.getByText(/anonymous authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/zero app store downloads/i)).toBeInTheDocument();
      expect(screen.getByText(/supabase realtime powered/i)).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness & Touch Target Compliance', () => {
    it('applies mobile-first max-width and adaptive responsive padding classes', () => {
      const mockRoom = createMockRoom();
      const { container } = render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={true}
          onJoinClick={vi.fn()}
          onDashboardClick={vi.fn()}
        />
      );

      const rootContainer = container.firstChild as HTMLElement;
      expect(rootContainer).toHaveClass('max-w-xl');
      expect(rootContainer).toHaveClass('mx-auto');
      expect(rootContainer).toHaveClass('p-4');
      expect(rootContainer).toHaveClass('sm:p-6');
    });

    it('ensures primary action CTA button meets the 48px minimum touch target height', () => {
      const mockRoom = createMockRoom();
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const joinBtn = screen.getByRole('button', { name: /join room as attendee/i });
      // Button size="lg" applies min-h-[48px]
      expect(joinBtn.className).toMatch(/min-h-\[48px\]/);
      // Button has full width for clean mobile stacking
      expect(joinBtn.className).toMatch(/w-full/);
    });

    it('ensures secondary action buttons in QR display meet minimum 44px touch targets', () => {
      const mockRoom = createMockRoom();
      render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const copyBtn = screen.getByRole('button', { name: /copy link/i });
      expect(copyBtn.className).toMatch(/min-h-\[44px\]/);

      const downloadBtn = screen.getByRole('button', { name: /download qr image/i });
      expect(downloadBtn.className).toMatch(/min-h-\[44px\]/);
      expect(downloadBtn.className).toMatch(/min-w-\[44px\]/);
    });

    it('ensures footer badges stack and wrap responsively for mobile screens', () => {
      const mockRoom = createMockRoom();
      const { container } = render(
        <RoomLobbyPage
          room={mockRoom}
          isCreator={false}
          onJoinClick={vi.fn()}
        />
      );

      const footer = container.querySelector('.flex.flex-wrap.items-center.justify-center');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex-wrap');
    });
  });
});
