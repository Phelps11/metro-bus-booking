import React, { useState, useEffect } from 'react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MapPin, Clock, Users, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Route } from '../../types';
import { supabase } from '../../lib/supabase';

interface DiscoverProps {
  activeScreen?: string;
  onNavigate: (screen: string, data?: any) => void;
  onHome?: () => void;
}

export const Discover: React.FC<DiscoverProps> = ({ activeScreen, onNavigate, onHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'trending' | 'all'>('popular');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedRoutes: Route[] = data.map((route: any) => ({
          id: route.id,
          from: route.from_location,
          to: route.to_location,
          duration: route.duration,
          price: route.price,
          departureTime: route.departure_time,
          arrivalTime: route.arrival_time,
          availableSeats: route.available_seats
        }));
        setRoutes(formattedRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularRoutes = routes.slice(0, 4);
  const trendingRoutes = routes.slice(4, 7);
  const allRoutes = routes;

  const getDisplayRoutes = () => {
    switch (selectedCategory) {
      case 'popular':
        return popularRoutes;
      case 'trending':
        return trendingRoutes;
      case 'all':
        return allRoutes;
      default:
        return popularRoutes;
    }
  };

  const handleRouteSelect = (route: Route) => {
    onNavigate('passenger-details', route);
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen={activeScreen || 'discover'}
      onNavigate={onNavigate}
      onHome={onHome}
    >
      <div className="bg-gradient-to-b from-green-50 to-white min-h-screen">
        {/* Header */}
        <div className="bg-green-600 text-white px-6 pt-6 pb-8">
          <h1 className="text-2xl font-bold mb-2">Discover Routes</h1>
          <p className="text-green-100 text-sm">Find the best routes for your commute</p>
        </div>

        {/* Category Tabs */}
        <div className="px-6 -mt-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-1 flex gap-1">
            <button
              onClick={() => setSelectedCategory('popular')}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'popular'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star size={16} className="inline mr-1" />
              Popular
            </button>
            <button
              onClick={() => setSelectedCategory('trending')}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'trending'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <TrendingUp size={16} className="inline mr-1" />
              Trending
            </button>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Routes
            </button>
          </div>
        </div>

        {/* Routes List */}
        <div className="px-6 pb-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading routes...</p>
            </div>
          ) : getDisplayRoutes().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No routes available</p>
            </div>
          ) : (
            getDisplayRoutes().map((route) => (
            <Card key={route.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={18} className="text-green-600" />
                      <h3 className="font-semibold text-gray-900">
                        {route.from} → {route.to}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{route.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{route.availableSeats} seats</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₦{route.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    Departs: <span className="font-medium text-gray-900">{route.departureTime}</span>
                  </div>
                  <Button
                    onClick={() => handleRouteSelect(route)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Book Now
                    <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>

        {/* Info Banner */}
        <div className="px-6 pb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Save with Subscriptions</h4>
              <p className="text-sm text-blue-800 mb-3">
                Travel frequently? Get weekly subscriptions and save up to 10% on your favourite routes, terms and conditions apply.
              </p>
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                View Subscriptions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};
