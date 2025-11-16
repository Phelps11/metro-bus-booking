import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BookingDetails, Ticket, UserProfile, Route } from '../types';

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
  fullName: 'Oluwafemi Johnson',
  phoneNumber: '+234 801 234 5678',
  email: 'oluwafemi@email.com',
  emergencyContact: '+234 802 345 6789',
  preferredRoutes: ['Berger - Lekki Phase 1', 'TBS - Ikorodu'],
  subscriptions: [],
  walletBalance: 15000
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState<BookingDetails | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [searchResults, setSearchResults] = useState<Route[]>([]);

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