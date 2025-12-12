import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, MapPin, Navigation, ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Route } from '../../types';
import { supabase } from '../../lib/supabase';

interface SearchResultsProps {
  onBack: () => void;
  onSelectRoute: (route: Route, date?: string) => void;
  selectedDate?: string;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onBack, onSelectRoute, selectedDate, onHome, onNavigate }) => {
  const { searchResults } = useApp();
  const { user } = useAuth();

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [showStops, setShowStops] = useState<string | null>(null);
  const [subscribedRoutes, setSubscribedRoutes] = useState<Set<string>>(new Set());
  const [subscribingRoute, setSubscribingRoute] = useState<string | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedRouteForSubscription, setSelectedRouteForSubscription] = useState<Route | null>(null);
  const [subscriptionDuration, setSubscriptionDuration] = useState<number>(4);

  const defaultStops = [
    'Berger Bus Stop',
    'Magodo Phase II (Secretariat)',
    '7UP Toll Gate',
    'Alapere',
    'Ogudu',
    'Iyana-Oworo',
    'Bonny Camp',
    'Adeola Odeku Junction',
    'Eko Hotel Roundabout',
    'Sandfill Bus Stop',
    'Lekki Phase 1'
  ];

  // Mock search results if none exist with updated price
  const routes: Route[] = searchResults.length > 0
    ? searchResults.map(route => ({
        ...route,
        stops: route.stops || defaultStops
      }))
    : [
    {
      id: '1',
      from: 'Berger',
      to: 'Lekki Phase 1',
      duration: '1h 30m',
      price: 2400,
      departureTime: '05:40',
      arrivalTime: '07:50',
      availableSeats: 12,
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1',
      totalStops: 11,
      stops: defaultStops
    },
    {
      id: '2',
      from: 'Berger',
      to: 'Lekki Phase 1',
      duration: '1h 45m',
      price: 2400,
      departureTime: '08:30',
      arrivalTime: '10:15',
      availableSeats: 8,
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1',
      totalStops: 11,
      stops: defaultStops
    },
    {
      id: '3',
      from: 'Berger',
      to: 'Lekki Phase 1',
      duration: '1h 35m',
      price: 2400,
      departureTime: '10:00',
      arrivalTime: '11:35',
      availableSeats: 15,
      boardingPoint: 'Berger Bus Stop',
      deboardingPoint: 'Lekki Phase 1',
      totalStops: 11,
      stops: defaultStops
    }
  ];

  // Load user's subscriptions
  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('route_subscriptions')
          .select('route_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        if (data) {
          setSubscribedRoutes(new Set(data.map(sub => sub.route_id)));
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error);
      }
    };

    loadSubscriptions();
  }, [user]);

  const toggleExpand = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const toggleStops = (routeId: string) => {
    setShowStops(showStops === routeId ? null : routeId);
  };

  const handleSubscribeToggle = async (route: Route) => {
    if (!user) {
      alert('Please log in to subscribe to routes');
      return;
    }

    const isSubscribed = subscribedRoutes.has(route.id);

    if (isSubscribed) {
      if (!confirm('Are you sure you want to unsubscribe from this route?')) {
        return;
      }

      setSubscribingRoute(route.id);

      try {
        const { error } = await supabase
          .from('route_subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('route_id', route.id);

        if (error) throw error;

        setSubscribedRoutes(prev => {
          const next = new Set(prev);
          next.delete(route.id);
          return next;
        });
        alert('Successfully unsubscribed from route');
      } catch (error) {
        console.error('Error unsubscribing:', error);
        alert('Failed to unsubscribe. Please try again.');
      } finally {
        setSubscribingRoute(null);
      }
    } else {
      setSelectedRouteForSubscription(route);
      setSubscriptionDuration(4);
      setShowSubscribeModal(true);
    }
  };

  const handleConfirmSubscription = () => {
    if (!selectedRouteForSubscription) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (subscriptionDuration * 7));

    const subscriptionData = {
      route: selectedRouteForSubscription,
      durationWeeks: subscriptionDuration,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      isSubscription: true
    };

    setShowSubscribeModal(false);

    if (onNavigate) {
      onNavigate('passenger-details', subscriptionData);
    }
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="search-results"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Subscription Modal */}
      {showSubscribeModal && selectedRouteForSubscription && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            onClick={() => setShowSubscribeModal(false)}
          />
          <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white shadow-lg border-2 border-oxford-blue z-[101]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-oxford-blue text-lg">Subscribe to Route</h3>
                <button
                  onClick={() => setShowSubscribeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin size={16} className="text-oxford-blue" />
                    <span className="font-medium text-oxford-blue">
                      {selectedRouteForSubscription.from} → {selectedRouteForSubscription.to}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Get updates for this route
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subscription Duration
                  </label>
                  <div className="space-y-2">
                    {[2, 3, 4].map((weeks) => (
                      <button
                        key={weeks}
                        onClick={() => setSubscriptionDuration(weeks)}
                        className={`w-full p-3 rounded-lg border-2 flex items-center justify-between transition-colors ${
                          subscriptionDuration === weeks
                            ? 'border-oxford-blue bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-medium text-oxford-blue">
                            {weeks} Weeks
                          </div>
                          <div className="text-sm text-gray-600">
                            Until {new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          subscriptionDuration === weeks
                            ? 'border-oxford-blue bg-oxford-blue'
                            : 'border-gray-300'
                        }`}>
                          {subscriptionDuration === weeks && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800">
                    <div className="font-medium mb-1">What you'll get:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• Route availability updates</li>
                      <li>• Schedule change notifications</li>
                      <li>• Quick access to this route</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubscribeModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSubscription}
                    disabled={subscribingRoute === selectedRouteForSubscription.id}
                    className="bg-oxford-blue hover:bg-oxford-blue/90"
                  >
                    {subscribingRoute === selectedRouteForSubscription.id ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Header - Using flexbox auto layout for proper spacing */}
      <div className="bg-oxford-blue flex flex-col relative min-h-[120px]">
        {/* Top section with back button and title */}
        <div className="flex items-center justify-center pt-16 pb-4 relative">
          <button 
            onClick={onBack}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl">
            Available Buses
          </h1>
        </div>

        {/* Route info section - positioned at bottom with proper spacing */}
        <div className="px-4 pb-4 mt-auto">
          <div className="text-white text-sm">
            <div className="flex justify-between items-center">
              <span>Berger → Lekki Phase 1</span>
              <span>Today, Dec 15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results - Proper spacing without negative margins */}
      <div className="px-4 py-4 space-y-4">
        {routes.map((route) => (
          <Card key={route.id} className="bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock size={16} className="text-oxford-blue" />
                    <span className="font-medium text-oxford-blue">
                      {route.departureTime} - {route.arrivalTime}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {route.duration}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-oxford-blue">
                    ₦{route.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                <Users size={16} />
                <span>{route.availableSeats} seats left</span>
              </div>

              {/* Route Details Toggle */}
              <button
                onClick={() => toggleExpand(route.id)}
                className="w-full flex items-center justify-between py-2 text-sm text-oxford-blue font-medium hover:bg-gray-50 rounded transition-colors"
              >
                <span>Route Details</span>
                {expandedRoute === route.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Expandable Route Details */}
              {expandedRoute === route.id && (
                <div className="mt-3 pt-3 border-t space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Boarding Point</div>
                      <div className="text-gray-600">{route.boardingPoint || route.from}</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Deboarding Point</div>
                      <div className="text-gray-600">{route.deboardingPoint || route.to}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => toggleStops(route.id)}
                      className="flex items-center space-x-2 text-sm hover:bg-gray-50 w-full py-1 rounded transition-colors"
                    >
                      <Navigation size={16} className="text-oxford-blue flex-shrink-0" />
                      <span className="text-gray-600">This route has {route.totalStops || 13} stops</span>
                      {showStops === route.id ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
                    </button>

                    {showStops === route.id && route.stops && (
                      <div className="pl-6 space-y-2 mt-2">
                        {route.stops.map((stop, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-green-600' :
                                index === route.stops!.length - 1 ? 'bg-red-600' :
                                'bg-gray-400'
                              }`} />
                              {index < route.stops!.length - 1 && (
                                <div className="w-0.5 h-6 bg-gray-300" />
                              )}
                            </div>
                            <span className="text-sm text-gray-700 pt-0">{stop}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t space-y-2">
                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribeToggle(route)}
                  disabled={subscribingRoute === route.id}
                  variant="outline"
                  className={`w-full py-2 flex items-center justify-center gap-2 ${
                    subscribedRoutes.has(route.id)
                      ? 'border-oxford-blue text-oxford-blue hover:bg-oxford-blue hover:text-white'
                      : 'border-gray-300 text-gray-700 hover:border-oxford-blue hover:text-oxford-blue'
                  }`}
                >
                  {subscribedRoutes.has(route.id) ? (
                    <>
                      <Bell size={16} className="fill-current" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <BellOff size={16} />
                      <span>Subscribe to Route</span>
                    </>
                  )}
                </Button>

                {/* Select Button */}
                <Button
                  onClick={() => onSelectRoute(route, selectedDate)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
                >
                  Select Bus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </MobileLayout>
  );
};