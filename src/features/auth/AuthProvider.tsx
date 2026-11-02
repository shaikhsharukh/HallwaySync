import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
  ensureAnonymousUser: () => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key for fallback demo mock session if Supabase is unconfigured
const MOCK_USER_KEY = 'hackbuild_mock_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline/Local mock fallback
      let mockId = localStorage.getItem(MOCK_USER_KEY);
      if (!mockId) {
        mockId = crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}`;
        localStorage.setItem(MOCK_USER_KEY, mockId);
      }
      setUser({
        id: mockId,
        app_metadata: { provider: 'anonymous' },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        is_anonymous: true,
      } as User);
      setIsLoading(false);
      return;
    }

    // Supabase Live Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ensureAnonymousUser = async (): Promise<User | null> => {
    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          return session.user;
        }

        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          return data.user;
        }
      } catch (err) {
        console.warn('Anonymous session creation error:', err);
      }
    }

    if (user) return user;

    let mockId = localStorage.getItem(MOCK_USER_KEY);
    if (!mockId) {
      mockId = crypto.randomUUID ? crypto.randomUUID() : `mock-${Date.now()}`;
      localStorage.setItem(MOCK_USER_KEY, mockId);
    }
    const mockUser = {
      id: mockId,
      app_metadata: { provider: 'anonymous' },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      is_anonymous: true,
    } as User;
    setUser(mockUser);
    return mockUser;
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(MOCK_USER_KEY);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAnonymous: user?.is_anonymous ?? true,
        ensureAnonymousUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
