import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './screens/Login';
import { SignUp } from './screens/SignUp';
import { Onboarding } from './screens/Onboarding/Onboarding';
import { ResetPassword } from './screens/ResetPassword';
import { ResetPasswordDemo } from './screens/ResetPassword/ResetPasswordDemo';
import { MobileAppFront } from './screens/MobileAppFront/MobileAppFront';
import { SearchResults } from './screens/SearchResults/SearchResults';
import { PassengerDetails } from './screens/PassengerDetails/PassengerDetails';
import { Payment } from './screens/Payment/Payment';
import { Ticket } from './screens/Ticket/Ticket';
import { Profile } from './screens/Profile/Profile';
import { MyTrips } from './screens/MyTrips/MyTrips';
import { SubscriptionPayment } from './screens/SubscriptionPayment/SubscriptionPayment';
import { HybridBooking } from './screens/HybridBooking/HybridBooking';
import { HybridPayment } from './screens/HybridPayment/HybridPayment';
import { HybridTickets } from './screens/HybridTickets/HybridTickets';
import { Discover } from './screens/Discover';
import { Route, PassengerDetails as PassengerDetailsType, BookingDetails, Ticket as TicketType, RouteSubscription } from './types';

type Screen = 'login' | 'signup' | 'onboarding' | 'reset-password' | 'reset-password-demo' | 'home' | 'search-results' | 'passenger-details' | 'payment' | 'ticket' | 'profile' | 'trips' | 'discover' | 'subscription-payment' | 'hybrid-booking' | 'hybrid-payment' | 'hybrid-tickets';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>(['login']);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [currentTicket, setCurrentTicket] = useState<TicketType | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [hybridBookingData, setHybridBookingData] = useState<any>(null);
  const [hybridTickets, setHybridTickets] = useState<TicketType[]>([]);
  const [currentSubscriptionData, setCurrentSubscriptionData] = useState<any>(null);

  // Check if we're on the reset-password route
  useEffect(() => {
    if (location.pathname === '/reset-password') {
      setCurrentScreen('reset-password');
    } else if (location.pathname === '/reset-password-demo') {
      setCurrentScreen('reset-password-demo');
    }
  }, [location.pathname]);

  const handleOnboardingComplete = (userData: any) => {
    // In a real app, you would save this to your backend/database
    console.log('User registered:', userData);
    setIsOnboarded(true);
    setCurrentScreen('home');
    setNavigationHistory(['home']);
  };

  const handleNavigation = (screen: string, data?: any) => {
    const newScreen = screen as Screen;

    // Add current screen to history if it's not already the same as the new screen
    if (currentScreen !== newScreen) {
      setNavigationHistory(prev => [...prev, currentScreen]);
    }

    setCurrentScreen(newScreen);

    if (data) {
      if (screen === 'passenger-details') {
        if (data.isSubscription) {
          setCurrentSubscriptionData(data);
          setSelectedRoute(data.route);
          setSelectedDate(data.startDate);
        } else {
          setCurrentSubscriptionData(null);
          setSelectedRoute(data.route);
          setSelectedDate(data.date || new Date().toISOString().split('T')[0]);
        }
      } else if (screen === 'search-results' && data.date) {
        setSelectedDate(data.date);
      } else if (screen === 'subscription-payment') {
        setSubscriptionData(data);
      } else if (screen === 'hybrid-booking') {
        setHybridBookingData(data);
      } else if (screen === 'ticket') {
        setCurrentTicket(data);
      }
    }
  };

  const handleBackNavigation = () => {
    if (navigationHistory.length > 1) {
      const previousScreen = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentScreen(previousScreen);
    } else {
      // If no history, go to home
      setCurrentScreen('home');
      setNavigationHistory(['home']);
    }
  };

  const handleHomeNavigation = () => {
    setCurrentScreen('home');
    setNavigationHistory(['home']);
  };

  const handleRouteSelection = (route: Route, date?: string) => {
    setSelectedRoute(route);
    setSelectedDate(date || new Date().toISOString().split('T')[0]);
    setCurrentScreen('passenger-details');
    setNavigationHistory(prev => [...prev, currentScreen]);
  };

  const handlePassengerDetailsSubmit = (details: PassengerDetailsType) => {
    if (!selectedRoute) return;

    let booking: BookingDetails;

    if (currentSubscriptionData?.isSubscription && currentSubscriptionData?.durationWeeks) {
      const basePrice = selectedRoute.price;
      const weeksMultiplier = 6;
      const subscriptionPrice = basePrice * currentSubscriptionData.durationWeeks * weeksMultiplier;

      booking = {
        route: selectedRoute,
        passenger: details,
        boardingPoint: details.boardingPoint,
        deboardingPoint: details.deboardingPoint,
        date: currentSubscriptionData.startDate,
        totalFare: subscriptionPrice,
        isSubscription: true,
        subscriptionData: {
          durationWeeks: currentSubscriptionData.durationWeeks,
          startDate: currentSubscriptionData.startDate,
          endDate: currentSubscriptionData.endDate
        }
      };
    } else {
      booking = {
        route: selectedRoute,
        passenger: details,
        boardingPoint: details.boardingPoint,
        deboardingPoint: details.deboardingPoint,
        date: selectedDate || new Date().toISOString().split('T')[0],
        totalFare: selectedRoute.price
      };
    }

    setBookingDetails(booking);
    setCurrentScreen('payment');
    setNavigationHistory(prev => [...prev, currentScreen]);
  };

  const handlePaymentComplete = () => {
    if (bookingDetails) {
      if (bookingDetails.isSubscription) {
        setCurrentScreen('profile');
        setNavigationHistory(['profile']);
        setCurrentSubscriptionData(null);
      } else {
        const ticket: TicketType = {
          id: Date.now().toString(),
          ticketNumber: `MB${Date.now().toString().slice(-6)}`,
          passengerName: bookingDetails.passenger.name,
          route: `${bookingDetails.route.from} → ${bookingDetails.route.to}`,
          boardingTime: bookingDetails.route.departureTime,
          boardingPoint: bookingDetails.boardingPoint,
          deboardingPoint: bookingDetails.deboardingPoint,
          date: bookingDetails.date,
          status: Math.random() > 0.7 ? 'delayed' : 'confirmed',
          delayMinutes: Math.random() > 0.7 ? 30 : undefined,
          barcode: `MB${Date.now().toString()}`
        };
        setCurrentTicket(ticket);
        setCurrentScreen('ticket');
        setNavigationHistory(prev => [...prev, currentScreen]);
      }
    }
  };

  const handleSubscriptionPaymentComplete = (subscription: RouteSubscription) => {
    setCurrentScreen('profile');
    setNavigationHistory(prev => [...prev, currentScreen]);
  };

  const handleHybridBookingContinue = (bookingData: any) => {
    setHybridBookingData(bookingData);
    setCurrentScreen('hybrid-payment');
    setNavigationHistory(prev => [...prev, currentScreen]);
  };

  const handleHybridPaymentComplete = (tickets: TicketType[]) => {
    setHybridTickets(tickets);
    setCurrentScreen('hybrid-tickets');
    setNavigationHistory(prev => [...prev, currentScreen]);
  };

  const renderScreen = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      if (currentScreen === 'onboarding') {
        return (
          <Onboarding
            onComplete={() => {
              setIsOnboarded(true);
              setCurrentScreen('home');
              setNavigationHistory(['home']);
            }}
          />
        );
      }
      if (currentScreen === 'signup') {
        return (
          <SignUp
            onSignUpSuccess={() => {
              setIsOnboarded(true);
              setCurrentScreen('home');
              setNavigationHistory(['home']);
            }}
            onLoginClick={() => setCurrentScreen('login')}
          />
        );
      }
      if (currentScreen === 'reset-password') {
        return (
          <ResetPassword
            onResetSuccess={() => {
              setCurrentScreen('login');
              setNavigationHistory(['login']);
            }}
          />
        );
      }
      if (currentScreen === 'reset-password-demo') {
        return <ResetPasswordDemo />;
      }
      return (
        <Login
          onLoginSuccess={() => {
            setIsOnboarded(true);
            setCurrentScreen('home');
            setNavigationHistory(['home']);
          }}
          onSignUpClick={() => setCurrentScreen('signup')}
        />
      );
    }

    switch (currentScreen) {
      case 'home':
        return <MobileAppFront onNavigate={handleNavigation} onBack={handleBackNavigation} onHome={handleHomeNavigation} />;
      
      case 'search-results':
        return (
          <SearchResults
            onBack={handleBackNavigation}
            onSelectRoute={handleRouteSelection}
            selectedDate={selectedDate}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        );
      
      case 'passenger-details':
        return selectedRoute ? (
          <PassengerDetails
            selectedRoute={selectedRoute}
            onBack={handleBackNavigation}
            onContinue={handlePassengerDetailsSubmit}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        ) : null;
      
      case 'payment':
        return bookingDetails ? (
          <Payment
            bookingDetails={bookingDetails}
            onBack={handleBackNavigation}
            onPaymentComplete={handlePaymentComplete}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        ) : null;
      
      case 'ticket':
        return currentTicket ? (
          <Ticket
            ticket={currentTicket}
            onBack={handleBackNavigation}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        ) : null;
      
      case 'profile':
        return (
          <Profile
            activeScreen={currentScreen}
            onNavigate={handleNavigation}
            onBack={handleBackNavigation}
            onHome={handleHomeNavigation}
          />
        );

      case 'trips':
        return (
          <MyTrips
            activeScreen={currentScreen}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        );

      case 'subscription-payment':
        return subscriptionData ? (
          <SubscriptionPayment
            subscription={subscriptionData}
            onBack={handleBackNavigation}
            onPaymentComplete={handleSubscriptionPaymentComplete}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        ) : null;

      case 'hybrid-booking':
        return (
          <HybridBooking
            onBack={handleBackNavigation}
            onContinue={handleHybridBookingContinue}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        );

      case 'hybrid-payment':
        return hybridBookingData ? (
          <HybridPayment
            bookingData={hybridBookingData}
            onBack={handleBackNavigation}
            onPaymentComplete={handleHybridPaymentComplete}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        ) : null;

      case 'hybrid-tickets':
        return (
          <HybridTickets
            tickets={hybridTickets}
            onBack={handleBackNavigation}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        );
      
      case 'discover':
        return (
          <Discover
            activeScreen={currentScreen}
            onNavigate={handleNavigation}
            onHome={handleHomeNavigation}
          />
        );
      
      default:
        return <MobileAppFront onNavigate={handleNavigation} onBack={handleBackNavigation} onHome={handleHomeNavigation} />;
    }
  };

  return (
    <AppProvider>
      <div className="App">
        {renderScreen()}
      </div>
    </AppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;