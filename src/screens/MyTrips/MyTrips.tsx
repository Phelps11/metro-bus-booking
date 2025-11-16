import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight, Filter, Search, ArrowLeft } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useApp } from '../../context/AppContext';
import { Ticket } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface MyTripsProps {
  activeScreen: string;
  onNavigate: (screen: string, data?: any) => void;
  onHome?: () => void;
}

export const MyTrips: React.FC<MyTripsProps> = ({ activeScreen, onNavigate, onHome }) => {
  const { userProfile } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          routes (
            from_location,
            to_location
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedTrips: Ticket[] = data.map((booking: any) => ({
          id: booking.id,
          ticketNumber: booking.ticket_number,
          passengerName: booking.passenger_name,
          route: `${booking.routes?.from_location} → ${booking.routes?.to_location}`,
          boardingTime: booking.created_at.split('T')[1].slice(0, 5),
          boardingPoint: booking.boarding_point,
          deboardingPoint: booking.deboarding_point,
          date: booking.booking_date,
          status: booking.status as 'confirmed' | 'delayed' | 'cancelled',
          delayMinutes: booking.delay_minutes,
          barcode: booking.ticket_number
        }));
        setTrips(formattedTrips);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockTrips: Ticket[] = trips.length > 0 ? trips : [
    {
      id: '1',
      ticketNumber: 'MB123456',
      passengerName: userProfile.fullName,
      route: 'Berger → Lekki Phase 1',
      boardingTime: '07:30',
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1 Terminal',
      date: '2024-12-20',
      status: 'confirmed',
      barcode: 'MB1234567890'
    },
    {
      id: '2',
      ticketNumber: 'MB123457',
      passengerName: userProfile.fullName,
      route: 'Berger → Lekki Phase 1',
      boardingTime: '08:15',
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1 Terminal',
      date: '2024-12-21',
      status: 'confirmed',
      barcode: 'MB1234567891'
    },
    {
      id: '3',
      ticketNumber: 'MB123458',
      passengerName: userProfile.fullName,
      route: 'Lekki Phase 1 → Berger',
      boardingTime: '17:45',
      boardingPoint: 'Lekki Phase 1 Terminal',
      deboardingPoint: 'Berger Bus Stop',
      date: '2024-12-22',
      status: 'delayed',
      delayMinutes: 15,
      barcode: 'MB1234567892'
    },
    {
      id: '4',
      ticketNumber: 'HB123459',
      passengerName: userProfile.fullName,
      route: 'Berger → Lekki Phase 1',
      boardingTime: '07:30',
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1 Terminal',
      date: '2024-12-23',
      status: 'confirmed',
      barcode: 'HB1234567893'
    },
    // Past trips
    {
      id: '5',
      ticketNumber: 'MB123450',
      passengerName: userProfile.fullName,
      route: 'Berger → Lekki Phase 1',
      boardingTime: '07:30',
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1 Terminal',
      date: '2024-12-15',
      status: 'confirmed',
      barcode: 'MB1234567885'
    },
    {
      id: '6',
      ticketNumber: 'MB123451',
      passengerName: userProfile.fullName,
      route: 'Lekki Phase 1 → Berger',
      boardingTime: '17:30',
      boardingPoint: 'Lekki Phase 1 Terminal',
      deboardingPoint: 'Berger Bus Stop',
      date: '2024-12-14',
      status: 'confirmed',
      barcode: 'MB1234567886'
    },
    {
      id: '7',
      ticketNumber: 'HB123452',
      passengerName: userProfile.fullName,
      route: 'Berger → Lekki Phase 1',
      boardingTime: '08:00',
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1 Terminal',
      date: '2024-12-13',
      status: 'confirmed',
      barcode: 'HB1234567887'
    }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTrips = mockTrips.filter(trip => {
    const tripDate = new Date(trip.date);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate >= today;
  });

  const pastTrips = mockTrips.filter(trip => {
    const tripDate = new Date(trip.date);
    tripDate.setHours(0, 0, 0, 0);
    return tripDate < today;
  });

  const filteredTrips = (activeTab === 'upcoming' ? upcomingTrips : pastTrips).filter(trip =>
    trip.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'delayed': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string, delayMinutes?: number) => {
    switch (status) {
      case 'confirmed': return 'On Time';
      case 'delayed': return `Delayed ${delayMinutes}min`;
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getTripTypeIcon = (ticketNumber: string) => {
    if (ticketNumber.startsWith('HB')) {
      return (
        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-purple-600">H</span>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-blue-600">S</span>
      </div>
    );
  };

  const handleTripClick = (trip: Ticket) => {
    // Navigate to ticket details
    onNavigate('ticket', trip);
  };

  const handleBackNavigation = () => {
    if (onHome) {
      onHome();
    }
  };

  return (
    <MobileLayout 
      showBottomNav={true} 
      activeScreen={activeScreen}
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Reduced size with auto layout and back button */}
      <div className="bg-oxford-blue flex flex-col relative min-h-[100px]">
        {/* Top section with back button and title */}
        <div className="flex items-center justify-center pt-16 pb-2 relative">
          <button 
            onClick={handleBackNavigation}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-lg">
            My Trips
          </h1>
        </div>

        {/* Trip Summary - Compact layout */}
        <div className="px-4 pb-3">
          <div className="flex justify-between text-white text-sm">
            <div className="text-center">
              <div className="font-bold text-base">{upcomingTrips.length}</div>
              <div className="text-xs opacity-90">Upcoming</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-base">{pastTrips.length}</div>
              <div className="text-xs opacity-90">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-base">{userProfile.subscriptions.filter(s => s.isActive).length}</div>
              <div className="text-xs opacity-90">Active Plans</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Search and Filter */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trips..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" className="px-3">
                <Filter size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-oxford-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upcoming ({upcomingTrips.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-white text-oxford-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Past ({pastTrips.length})
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="font-semibold text-gray-600 mb-2">
                  {activeTab === 'upcoming' ? 'No Upcoming Trips' : 'No Past Trips'}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'upcoming' 
                    ? 'Book your next trip to see it here'
                    : 'Your completed trips will appear here'
                  }
                </p>
                {activeTab === 'upcoming' && (
                  <Button 
                    onClick={() => onHome?.()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Book a Trip
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className={`bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                  activeTab === 'past' ? 'opacity-75' : ''
                }`}
                onClick={() => handleTripClick(trip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getTripTypeIcon(trip.ticketNumber)}
                      <div>
                        <div className="font-medium text-oxford-blue">{trip.route}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(trip.date)} • {trip.boardingTime}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {trip.ticketNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status, trip.delayMinutes)}
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{trip.boardingPoint}</span>
                    </div>
                    
                    {activeTab === 'upcoming' && trip.status === 'delayed' && (
                      <div className="text-orange-600 font-medium">
                        +{trip.delayMinutes} min delay
                      </div>
                    )}
                    
                    {activeTab === 'past' && (
                      <div className="text-green-600 font-medium">
                        Completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {activeTab === 'upcoming' && upcomingTrips.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onHome?.()}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Book Another Trip
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('hybrid-booking')}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Hybrid Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <h4 className="font-medium text-gray-700 mb-2 text-sm">Trip Types</h4>
            <div className="flex justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">S</span>
                </div>
                <span className="text-gray-600">Single Trip</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">H</span>
                </div>
                <span className="text-gray-600">Hybrid Booking</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};