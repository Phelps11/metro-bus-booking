import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BookingDetails, Ticket, UserProfile, Route } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentBooking: BookingDetails | null;
  setCurrentBooking: (booking: BookingDetails | null) => void;
  currentTicket: Ticket | null;
  setCurrentTicket: (ticket: Ticket | null) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  searchResults: Route[];
  setSearchResults: (routes: Route[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultProfile: UserProfile = {
  fullName: 'User',
  phoneNumber: '',
  email: '',
  emergencyContact: '',
  preferredRoutes: [],
  subscriptions: [],
  walletBalance: 0
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<BookingDetails | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [searchResults, setSearchResults] = useState<Route[]>([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userData && !error) {
          setUserProfile({
            fullName: userData.full_name || session.user.email?.split('@')[0] || 'User',
            phoneNumber: userData.phone_number || '',
            email: userData.email,
            emergencyContact: userData.emergency_contact || '',
            preferredRoutes: userData.preferred_routes || [],
            subscriptions: [],
            walletBalance: userData.wallet_balance || 0
          });
        } else {
          setUserProfile(prev => ({
            ...prev,
            fullName: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || ''
          }));
        }
      }
    };

    loadUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (userData && !error) {
            setUserProfile({
              fullName: userData.full_name || session.user.email?.split('@')[0] || 'User',
              phoneNumber: userData.phone_number || '',
              email: userData.email,
              emergencyContact: userData.emergency_contact || '',
              preferredRoutes: userData.preferred_routes || [],
              subscriptions: [],
              walletBalance: userData.wallet_balance || 0
            });
          } else {
            setUserProfile(prev => ({
              ...prev,
              fullName: session.user.email?.split('@')[0] || 'User',
              email: session.user.email || ''
            }));
          }
        } else {
          setUserProfile(defaultProfile);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{
      currentBooking,
      setCurrentBooking,
      currentTicket,
      setCurrentTicket,
      userProfile,
      setUserProfile,
      searchResults,
      setSearchResults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};