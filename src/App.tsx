import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './features/auth/useAuth';
import { Room, Attendee, Announcement, ConnectionWithProfile } from './types/models';
import { roomService } from './features/room/room-service';
import { onboardingService } from './features/onboarding/onboarding-service';
import { connectionService } from './features/connections/connection-service';
import { organizerService } from './features/organizer/organizer-service';
import { useRoomPresence } from './features/room/useRoomPresence';

// UI Components
import { CreateRoomPage } from './features/room/CreateRoomPage';
import { RoomLobbyPage } from './features/room/RoomLobbyPage';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';
import { DirectoryPage } from './features/directory/DirectoryPage';
import { MatchmakerPage } from './features/matching/MatchmakerPage';
import { ConnectionsPage } from './features/connections/ConnectionsPage';
import { OrganizerDashboardPage } from './features/organizer/OrganizerDashboardPage';
import { AnnouncementBanner } from './features/organizer/AnnouncementBanner';
import { AvailabilityToggle } from './features/directory/AvailabilityToggle';
import { MyBadgeModal } from './features/connections/MyBadgeModal';
import { QRBadgeScanner } from './features/connections/QRBadgeScanner';
import { MutualMatchModal } from './features/connections/MutualMatchModal';
import { Toast, ToastMessage } from './components/ui/toast';
import { ThemeToggle } from './components/ThemeToggle';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Icons
import {
  Users,
  Sparkles,
  Link2,
  QrCode,
  LayoutDashboard,
  Pencil,
} from 'lucide-react';

function getInitialNavigationState(): {
  view: 'create' | 'lobby' | 'onboard' | 'room' | 'dashboard';
  slug: string | null;
} {
  if (typeof window === 'undefined') {
    return { view: 'create', slug: null };
  }
  try {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(hash);
    const dashboardParam = params.get('dashboard');
    const roomParam = params.get('room');

    if (dashboardParam) {
      return { view: 'dashboard', slug: dashboardParam };
    }
    if (roomParam) {
      return { view: 'lobby', slug: roomParam };
    }
  } catch (_) {}
  return { view: 'create', slug: null };
}

export default function App() {
  const { ensureAnonymousUser } = useAuth();

  // Navigation State initialized synchronously from URL hash
  const [initialNav] = useState(getInitialNavigationState);
  const [currentSlug, setCurrentSlug] = useState<string | null>(initialNav.slug);
  const [view, setView] = useState<'create' | 'lobby' | 'onboard' | 'room' | 'dashboard'>(initialNav.view);
  const [activeTab, setActiveTab] = useState<'directory' | 'matches' | 'connections'>('directory');

  // Room & Attendee State
  const [room, setRoom] = useState<Room | null>(null);
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Toast State
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [mutualPartner, setMutualPartner] = useState<Attendee | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Parse URL hash on hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const params = new URLSearchParams(hash);
      const roomParam = params.get('room');
      const dashboardParam = params.get('dashboard');

      if (dashboardParam) {
        setCurrentSlug(dashboardParam);
        setView('dashboard');
      } else if (roomParam) {
        setCurrentSlug(roomParam);
        setView((prev) => (prev === 'create' ? 'lobby' : prev));
      } else {
        setCurrentSlug(null);
        setView('create');
        setRoom(null);
        setCurrentAttendee(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Dynamic SEO Page Title & Meta Updates
  useEffect(() => {
    let title = 'HallwaySync — Real-Time In-Person Event Networking & Team Formation | Supabase';
    let description =
      'Instant in-person tech event networking, frictionless 45-second onboarding, live QR badge scanner, real-time presence, and AI team matching for hackathons and builder summits.';

    if (view === 'create') {
      title = 'HallwaySync — Real-Time In-Person Event Networking & Team Formation | Supabase';
    } else if (view === 'lobby') {
      title = `${room?.title || 'Event Lobby'} • Room Entry & QR Pass | HallwaySync`;
      if (room?.description) description = room.description;
    } else if (view === 'onboard') {
      title = `Join ${room?.title || 'Event'} • 45s Badge Setup | HallwaySync`;
      if (room?.description) description = `Join ${room.title} networking directory in 45 seconds.`;
    } else if (view === 'dashboard') {
      title = `Organizer Command Center • ${room?.title || 'Event Dashboard'} | HallwaySync`;
    } else if (view === 'room') {
      const tabName =
        activeTab === 'directory'
          ? 'Live Directory'
          : activeTab === 'matches'
          ? 'Team Matchmaker'
          : 'My Connections';
      title = `${tabName} • ${room?.title || 'Event Hall'} | HallwaySync`;
    }

    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [view, activeTab, room]);

  // Load Room and Attendee Data
  const loadRoomData = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const targetRoom = await roomService.getRoomBySlug(slug);
      if (!targetRoom) {
        setView('create');
        return;
      }
      setRoom(targetRoom);

      // Check / Ensure current user
      const currentUser = await ensureAnonymousUser();

      // Check latest announcement
      const latestAnn = await organizerService.getLatestAnnouncement(targetRoom.id);
      setAnnouncement(latestAnn);

      // Fetch attendees
      let loadedAttendees: Attendee[] = [];
      if (isSupabaseConfigured) {
        const { data: attendeesData } = await supabase
          .from('attendees')
          .select('*')
          .eq('room_id', targetRoom.id)
          .eq('is_banned', false);
        loadedAttendees = (attendeesData as unknown as Attendee[]) || [];
      } else {
        const localAttendees: Attendee[] = JSON.parse(
          localStorage.getItem('hackbuild_local_attendees') || '[]'
        );
        loadedAttendees = localAttendees.filter((a) => a.room_id === targetRoom.id && !a.is_banned);
      }
      setAttendees(loadedAttendees);

      // Check if current user is onboarded
      if (currentUser) {
        const attendee = await onboardingService.getCurrentAttendee(targetRoom.id, currentUser.id);
        if (attendee) {
          setCurrentAttendee(attendee);
          setView((prev) => (prev === 'dashboard' ? 'dashboard' : 'room'));

          // Fetch connections with fresh attendee list
          const myConns = await connectionService.getMyConnections(
            targetRoom.id,
            currentUser.id,
            loadedAttendees
          );
          setConnections(myConns);
        } else {
          setView((prev) => (prev === 'onboard' || prev === 'dashboard' ? prev : 'lobby'));
        }
      }
    } catch (err) {
      console.error('Error loading room:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ensureAnonymousUser]);

  useEffect(() => {
    if (currentSlug) {
      loadRoomData(currentSlug);
    }
  }, [currentSlug, loadRoomData]);

  // Toast Helpers
  const addToast = (type: ToastMessage['type'], title: string, description?: string, action?: ToastMessage['action']) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Realtime Presence & Broadcast
  const { channel, onlineCount, trackPresence } = useRoomPresence({
    roomSlug: room?.slug || '',
    currentAttendee,
    onIncomingWave: (requesterName, requesterRole) => {
      addToast(
        'wave',
        `${requesterName} waved at you! 👋`,
        `${requesterRole} in this room wants to connect.`,
        {
          label: 'View',
          onClick: () => setActiveTab('connections'),
        }
      );
      if (currentSlug) loadRoomData(currentSlug);
    },
    onMutualMatch: async (partnerId) => {
      let partner = attendees.find((a) => a.id === partnerId);
      if (!partner && isSupabaseConfigured) {
        const { data } = await supabase
          .from('attendees')
          .select('*')
          .eq('id', partnerId)
          .maybeSingle();
        if (data) partner = data as unknown as Attendee;
      }
      if (partner) {
        setMutualPartner(partner);
      }
      if (currentSlug) loadRoomData(currentSlug);
    },
    onNewAnnouncement: (newAnn) => {
      setAnnouncement(newAnn);
      addToast('info', `Announcement: ${newAnn.title}`, newAnn.message);
    },
  });

  // Connection status map for fast lookups
  const connectionMap = React.useMemo(() => {
    const map: Record<string, 'pending' | 'connected' | 'none'> = {};
    for (const c of connections) {
      map[c.partner.id] = c.status === 'ignored' ? 'none' : c.status;
    }
    return map;
  }, [connections]);

  // Handle Onboarding Completion
  const handleOnboardingComplete = async (profileInput: any) => {
    if (!room) return;
    const authUser = await ensureAnonymousUser();
    if (!authUser) throw new Error('Could not initialize anonymous session');

    const isUpdate = Boolean(currentAttendee);
    const newAttendee = await onboardingService.joinRoom(room.id, authUser.id, profileInput);
    setCurrentAttendee(newAttendee);
    setAttendees((prev) => [...prev.filter((a) => a.id !== newAttendee.id), newAttendee]);
    setView('room');
    if (!isUpdate) {
      setActiveTab('directory');
      addToast('success', 'Joined room successfully!', 'Welcome to the networking hall.');
    } else {
      addToast('success', 'Profile updated!', 'Your updated badge is now live in the room.');
    }
  };

  // Handle Wave Send
  const handleSendWave = async (recipientId: string) => {
    if (!room || !currentAttendee) return;
    try {
      const { isMutual } = await connectionService.sendWave(
        room.id,
        currentAttendee,
        recipientId,
        channel
      );

      if (isMutual) {
        const partner = attendees.find((a) => a.id === recipientId);
        if (partner) setMutualPartner(partner);
      } else {
        addToast('success', 'Wave sent! 👋', 'Notification delivered in real-time.');
      }

      if (currentSlug) loadRoomData(currentSlug);
    } catch (err: any) {
      addToast('error', 'Could not send wave', err?.message);
    }
  };

  // Handle Wave Accept
  const handleAcceptWave = async (connectionId: string) => {
    if (!room || !currentAttendee) return;
    const conn = connections.find((c) => c.id === connectionId);
    if (!conn) return;

    await connectionService.sendWave(room.id, currentAttendee, conn.partner.id, channel);
    setMutualPartner(conn.partner);
    if (currentSlug) loadRoomData(currentSlug);
  };

  // Handle Badge QR Scan Success
  const handleBadgeScanSuccess = async (badgeOwnerId: string) => {
    if (!room || !currentAttendee) return;
    try {
      await connectionService.scanBadge(room.id, currentAttendee.id, badgeOwnerId, channel);
      let partner = attendees.find((a) => a.id === badgeOwnerId);
      if (!partner && isSupabaseConfigured) {
        const { data } = await supabase
          .from('attendees')
          .select('*')
          .eq('id', badgeOwnerId)
          .maybeSingle();
        if (data) partner = data as unknown as Attendee;
      }
      if (partner) {
        setMutualPartner(partner);
      }
      if (currentSlug) loadRoomData(currentSlug);
    } catch (err: any) {
      addToast('error', 'Badge scan failed', err?.message);
    }
  };

  // Handle Availability Toggle
  const handleUpdateAvailability = async (isAvailable: boolean, zone: string | null) => {
    if (!currentAttendee) return;
    await onboardingService.updateAvailability(currentAttendee.id, isAvailable, zone);
    const updated = {
      ...currentAttendee,
      is_available_to_chat: isAvailable,
      current_zone: zone,
    };
    setCurrentAttendee(updated);
    setAttendees((prev) =>
      prev.map((a) => (a.id === currentAttendee.id ? updated : a))
    );
    await trackPresence(updated);
    addToast(
      'info',
      isAvailable ? 'Status: Available to Chat' : 'Status: Standard',
      isAvailable ? `Located at ${zone || 'Venue'}` : 'Presence updated'
    );
  };

  // Handle Announcement Post (Organizer)
  const handlePostAnnouncement = async (title: string, message: string) => {
    if (!room) return;
    const token = room.creator_token || roomService.getStoredCreatorToken(room.slug) || '';
    const newAnn = await organizerService.postAnnouncement(room.id, title, message, token, channel);
    setAnnouncement(newAnn);
  };

  // Handle Ban Attendee (Organizer)
  const handleBanAttendee = async (attendeeId: string) => {
    if (!room) return;
    const token = room.creator_token || roomService.getStoredCreatorToken(room.slug) || '';
    await organizerService.banAttendee(room.id, attendeeId, token);
    setAttendees((prev) => prev.filter((a) => a.id !== attendeeId));
    addToast('info', 'Participant removed', 'Profile hidden from all directory queries.');
  };

  const isCreator = room ? roomService.isRoomCreator(room.slug) : false;

  return (
    <div className="min-h-screen bg-surface-base text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-slate-950">
      {/* Real-Time Pinned Announcement Banner */}
      <AnnouncementBanner announcement={announcement} />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-surface-base/90 backdrop-blur-md border-b border-surface-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div
            onClick={() => {
              window.location.hash = '';
              setView('create');
              setRoom(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm border border-brand-500/30">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                HallwaySync
              </h1>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Event Networking
              </span>
            </div>
          </div>

          {/* DESKTOP TOP NAVIGATION TABS */}
          {room && view === 'room' && currentAttendee && (
            <nav className="hidden md:flex items-center gap-1 bg-surface-card border border-surface-border p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'directory'
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Directory</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('matches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'matches'
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Matches</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('connections')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'connections'
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Connections</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBadgeModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>My Badge</span>
              </button>
            </nav>
          )}

          {/* ACTION CLUSTER (Includes ThemeToggle on all views) */}
          <div className="flex items-center gap-2">
            {room && view === 'room' && (
              <>
                {currentAttendee && (
                  <button
                    type="button"
                    onClick={() => setView('onboard')}
                    className="min-h-[44px] px-3 py-1.5 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl bg-surface-card border border-surface-border hover:bg-surface-raised transition-colors"
                    title="Edit your badge and profile"
                  >
                    <Pencil className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                )}

                {currentAttendee && (
                  <AvailabilityToggle
                    isAvailable={currentAttendee.is_available_to_chat}
                    currentZone={currentAttendee.current_zone}
                    onUpdate={handleUpdateAvailability}
                  />
                )}

                {/* Online Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card border border-surface-border text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{onlineCount || attendees.length} in hall</span>
                </div>

                {isCreator && (
                  <button
                    onClick={() => {
                      window.location.hash = `#dashboard=${room.slug}`;
                      setView('dashboard');
                    }}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl bg-surface-card border border-surface-border"
                    title="Organizer Dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                  </button>
                )}
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>

      {/* MAIN VIEW CONTENT ROUTER */}
      <main className="flex-1 w-full">
        {isLoading && !room && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading event room...</p>
          </div>
        )}

        {view === 'create' && !room && (
          <CreateRoomPage
            onRoomCreated={(createdRoom) => {
              setRoom(createdRoom);
              setCurrentSlug(createdRoom.slug);
              setView('lobby');
              window.location.hash = `#room=${createdRoom.slug}`;
            }}
          />
        )}

        {view === 'lobby' && room && (
          <RoomLobbyPage
            room={room}
            isCreator={isCreator}
            onJoinClick={() => setView('onboard')}
            onDashboardClick={() => {
              window.location.hash = `#dashboard=${room.slug}`;
              setView('dashboard');
            }}
          />
        )}

        {view === 'onboard' && room && (
          <div className="min-h-[80vh] flex items-center justify-center p-4">
            <OnboardingWizard
              roomTitle={room.title}
              roomCategory={room.category}
              initialProfile={currentAttendee}
              onCancel={() => setView(currentAttendee ? 'room' : 'lobby')}
              onComplete={handleOnboardingComplete}
            />
          </div>
        )}

        {view === 'dashboard' && room && (
          <OrganizerDashboardPage
            room={room}
            attendees={attendees}
            onBackToRoom={() => {
              window.location.hash = `#room=${room.slug}`;
              setView(currentAttendee ? 'room' : 'lobby');
            }}
            onPostAnnouncement={handlePostAnnouncement}
            onBanAttendee={handleBanAttendee}
          />
        )}

        {view === 'room' && room && currentAttendee && (
          <div>
            {activeTab === 'directory' && (
              <DirectoryPage
                room={room}
                attendees={attendees}
                currentAttendee={currentAttendee}
                connections={connectionMap}
                onSendWave={handleSendWave}
                onEditProfile={() => setView('onboard')}
                onRefresh={() => currentSlug && loadRoomData(currentSlug)}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'matches' && (
              <MatchmakerPage
                room={room}
                currentAttendee={currentAttendee}
                allAttendees={attendees}
                connections={connectionMap}
                onSendWave={handleSendWave}
              />
            )}

            {activeTab === 'connections' && (
              <ConnectionsPage
                connections={connections}
                currentAttendee={currentAttendee}
                onOpenMyBadge={() => setIsBadgeModalOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onAcceptWave={handleAcceptWave}
              />
            )}
          </div>
        )}
      </main>

      {/* BOTTOM MOBILE NAVIGATION BAR (For active room attendees) */}
      {view === 'room' && room && currentAttendee && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-lg border-t border-surface-border px-3 py-2">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
            <button
              onClick={() => setActiveTab('directory')}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors select-none ${
                activeTab === 'directory'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors select-none ${
                activeTab === 'matches'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>Matches</span>
            </button>

            <button
              onClick={() => setActiveTab('connections')}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition-colors select-none relative ${
                activeTab === 'connections'
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Link2 className="w-5 h-5" />
              <span>Contacts</span>
              {connections.filter((c) => c.status === 'connected').length > 0 && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-brand-400" />
              )}
            </button>

            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors select-none"
            >
              <QrCode className="w-5 h-5 text-brand-500 dark:text-brand-400" />
              <span>My Badge</span>
            </button>
          </div>
        </nav>
      )}

      {/* MODALS */}
      {currentAttendee && room && (
        <>
          <MyBadgeModal
            isOpen={isBadgeModalOpen}
            onClose={() => setIsBadgeModalOpen(false)}
            attendee={currentAttendee}
            roomId={room.id}
          />

          <QRBadgeScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            roomId={room.id}
            onScanSuccess={handleBadgeScanSuccess}
          />

          <MutualMatchModal
            isOpen={Boolean(mutualPartner)}
            onClose={() => setMutualPartner(null)}
            currentUser={currentAttendee}
            partner={mutualPartner}
          />
        </>
      )}
    </div>
  );
}
