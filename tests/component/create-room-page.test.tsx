import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateRoomPage } from '../../src/features/room/CreateRoomPage';
import { roomService } from '../../src/features/room/room-service';

vi.mock('../../src/features/room/room-service', () => ({
  roomService: {
    createRoom: vi.fn(),
  },
}));

describe('CreateRoomPage component', () => {
  it('renders two-column command center with form and live stage preview', () => {
    const onRoomCreated = vi.fn();
    render(<CreateRoomPage onRoomCreated={onRoomCreated} />);

    expect(screen.getByRole('heading', { name: /create an event networking hall/i })).toBeInTheDocument();
    expect(screen.getByText(/stage screen preview/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/supabase ai hackathon/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /launch room & generate stage qr code/i })).toBeInTheDocument();
  });

  it('autofills fields when a quick start preset is clicked', () => {
    const onRoomCreated = vi.fn();
    render(<CreateRoomPage onRoomCreated={onRoomCreated} />);

    const hackathonPreset = screen.getByRole('button', { name: /supabase ai hackathon/i });
    fireEvent.click(hackathonPreset);

    const titleInput = screen.getByPlaceholderText(/supabase ai hackathon/i) as HTMLInputElement;
    expect(titleInput.value).toBe('Supabase AI Hackathon 2026 - Main Hall');
    expect(screen.getByText(/Matches Frontend ↔ Backend ↔ AI\/ML ↔ Designers/i)).toBeInTheDocument();
  });

  it('switches event format when format button is clicked', () => {
    const onRoomCreated = vi.fn();
    render(<CreateRoomPage onRoomCreated={onRoomCreated} />);

    const summitButton = screen.getByRole('button', { name: /tech summit/i });
    fireEvent.click(summitButton);

    expect(screen.getByText(/Matches Founders ↔ Engineers ↔ Product Leaders/i)).toBeInTheDocument();
  });

  it('validates title and triggers onRoomCreated upon valid submission', async () => {
    const onRoomCreated = vi.fn();
    const mockRoom = {
      id: 'room-123',
      title: 'DevFest 2026',
      slug: 'devfest-2026',
      description: 'Main hall',
      category: 'hackathon',
      created_at: new Date().toISOString(),
      creator_token: 'secret-token',
    };

    (roomService.createRoom as any).mockResolvedValueOnce({ room: mockRoom });

    render(<CreateRoomPage onRoomCreated={onRoomCreated} />);

    const titleInput = screen.getByPlaceholderText(/supabase ai hackathon/i);
    fireEvent.change(titleInput, { target: { value: 'DevFest 2026' } });

    const submitBtn = screen.getByRole('button', { name: /launch room & generate stage qr code/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(roomService.createRoom).toHaveBeenCalledWith({
        title: 'DevFest 2026',
        description: '',
        category: 'hackathon',
      });
      expect(onRoomCreated).toHaveBeenCalledWith(mockRoom);
    });
  });

  it('guarantees mobile-responsive layout structure and touch target heights', () => {
    const onRoomCreated = vi.fn();
    const { container } = render(<CreateRoomPage onRoomCreated={onRoomCreated} />);

    // Responsive grid: 1 column on mobile (< lg), 12 columns on desktop (>= lg)
    const gridEl = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12');
    expect(gridEl).toBeInTheDocument();

    // Primary CTA meets minimum 48px touch target
    const submitBtn = screen.getByRole('button', { name: /launch room & generate stage qr code/i });
    expect(submitBtn.className).toMatch(/min-h-\[48px\]/);

    // Format selection buttons meet 48px touch target
    const hackathonButton = screen.getByRole('button', { name: /active hackathon/i });
    expect(hackathonButton.className).toMatch(/min-h-\[48px\]/);

    // Preset chips meet touch target floor
    const presetBtn = screen.getByRole('button', { name: /supabase ai hackathon/i });
    expect(presetBtn.className).toMatch(/min-h-\[36px\]/);
  });
});
