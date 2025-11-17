import React, { useState } from 'react';
import { ArrowLeft, Clock, Users, MapPin, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useApp } from '../../context/AppContext';
import { Route } from '../../types';

interface SearchResultsProps {
  onBack: () => void;
  onSelectRoute: (route: Route, date?: string) => void;
  selectedDate?: string;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onBack, onSelectRoute, selectedDate, onHome, onNavigate }) => {
  const { searchResults } = useApp();

  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [showStops, setShowStops] = useState<string | null>(null);

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

  const toggleExpand = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const toggleStops = (routeId: string) => {
    setShowStops(showStops === routeId ? null : routeId);
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="search-results"
      onNavigate={onNavigate}
      onHome={onHome}
    >
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

              {/* Select Button */}
              <div className="mt-4 pt-3 border-t">
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