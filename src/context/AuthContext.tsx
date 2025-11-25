import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isPasswordRecovery: boolean;
  clearRecoveryMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check if URL contains recovery hash - must be done before getSession
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    console.log('Hash params:', { type, hasAccessToken: !!accessToken });

    if (type === 'recovery' || (type && accessToken)) {
      console.log('Setting password recovery mode');
      setIsPasswordRecovery(true);
    }

    // Listen for auth state changes BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);

      (async () => {
        if (event === 'PASSWORD_RECOVERY') {
          console.log('PASSWORD_RECOVERY event detected');
          setIsPasswordRecovery(true);
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_IN' && isPasswordRecovery) {
          // Keep recovery mode if we're in recovery flow
          setUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsPasswordRecovery(false);
        } else {
          setUser(session?.user ?? null);
        }
      })();
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      // Don't update user if we're in recovery mode
      if (!isPasswordRecovery) {
        setUser(session?.user ?? null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsPasswordRecovery(false);
    window.location.reload();
  };

  const clearRecoveryMode = () => {
    setIsPasswordRecovery(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, isPasswordRecovery, clearRecoveryMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
