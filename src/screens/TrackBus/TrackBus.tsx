import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bus, Clock, MapPin, Bell, BellOff, MessageSquare, Phone, CheckCircle2, Circle, Navigation } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Ticket } from '../../types';
import { supabase } from '../../lib/supabase';

interface TrackBusProps {
  ticket: Ticket;
  onBack: () => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

interface BusTracking {
  id: string;
  busNumber: string;
  driverName: string;
  status: 'idle' | 'en_route' | 'delayed' | 'arrived';
  currentStage: 'departed' | 'approaching' | 'arriving_shortly' | 'completed';
  distanceToPickupKm: number;
  etaMinutes: number;
  lastUpdated: string;
  statusMessage: string;
  notify10Min: boolean;
  notifyDelay: boolean;
}

export const TrackBus: React.FC<TrackBusProps> = ({ ticket, onBack, onHome, onNavigate }) => {
  const [tracking, setTracking] = useState<BusTracking>({
    id: '',
    busNumber: 'Bus 07',
    driverName: 'Taye',
    status: 'en_route',
    currentStage: 'approaching',
    distanceToPickupKm: 5.2,
    etaMinutes: 15,
    lastUpdated: new Date().toISOString(),
    statusMessage: 'Your bus is moving smoothly and will arrive shortly.',
    notify10Min: true,
    notifyDelay: true
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();

    const subscription = supabase
      .channel('bus_tracking_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_tracking'
        },
        (payload) => {
          if (payload.new) {
            updateTrackingFromDB(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [ticket.id]);

  const fetchTrackingData = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_tracking')
        .select('*')
        .eq('booking_id', ticket.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        updateTrackingFromDB(data);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingFromDB = (data: any) => {
    setTracking({
      id: data.id,
      busNumber: data.bus_number,
      driverName: data.driver_name,
      status: data.status,
      currentStage: data.current_stage,
      distanceToPickupKm: parseFloat(data.distance_to_pickup_km),
      etaMinutes: data.eta_minutes,
      lastUpdated: data.last_updated,
      statusMessage: data.status_message,
      notify10Min: data.notify_10min,
      notifyDelay: data.notify_delay
    });
  };

  const toggleNotification = async (type: 'notify10Min' | 'notifyDelay') => {
    const newValue = !tracking[type];
    setTracking(prev => ({ ...prev, [type]: newValue }));

    if (tracking.id) {
      const column = type === 'notify10Min' ? 'notify_10min' : 'notify_delay';
      await supabase
        .from('bus_tracking')
        .update({ [column]: newValue })
        .eq('id', tracking.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'en_route': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'delayed': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'arrived': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Idle';
      case 'en_route': return 'En Route';
      case 'delayed': return 'Delayed';
      case 'arrived': return 'Arrived';
      default: return 'Unknown';
    }
  };

  const getStageIcon = (stage: string, currentStage: string) => {
    const stages = ['departed', 'approaching', 'arriving_shortly', 'completed'];
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) {
      return <CheckCircle2 size={20} className="text-green-600" />;
    } else if (stageIndex === currentIndex) {
      return <Navigation size={20} className="text-blue-600 animate-pulse" />;
    } else {
      return <Circle size={20} className="text-gray-300" />;
    }
  };

  const getStageStatus = (stage: string, currentStage: string) => {
    const stages = ['departed', 'approaching', 'arriving_shortly', 'completed'];
    const currentIndex = stages.indexOf(currentStage);
    const stageIndex = stages.indexOf(stage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const updated = new Date(tracking.lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    return `${diffMins} minutes ago`;
  };

  const stages = [
    { key: 'departed', label: 'Departed from terminal', description: 'Bus has left the depot' },
    { key: 'approaching', label: 'Approaching your stop', description: 'Getting closer to you' },
    { key: 'arriving_shortly', label: 'Arriving shortly', description: 'Almost at your location' },
    { key: 'completed', label: 'Trip completed', description: 'Journey finished' }
  ];

  if (loading) {
    return (
      <MobileLayout showBottomNav={true} activeScreen="track-bus" onNavigate={onNavigate} onHome={onHome}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tracking data...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBottomNav={true} activeScreen="track-bus" onNavigate={onNavigate} onHome={onHome}>
      <div className="bg-oxford-blue h-[140px] relative">
        <button
          onClick={onBack}
          className="absolute top-16 left-4 text-white p-2"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl mb-1">
            Track Your Bus
          </h1>
          <p className="text-white/80 text-sm">Live trip updates for your commute</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-6">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-oxford-blue rounded-full flex items-center justify-center">
                  <Bus size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-oxford-blue">{ticket.route}</h2>
                  <p className="text-sm text-gray-600">{tracking.busNumber} • Driver: {tracking.driverName}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tracking.status)}`}>
                {getStatusText(tracking.status)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-gray-600" />
                  <span className="text-gray-700">Boarding: {ticket.boardingPoint}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-5">
            <h3 className="font-semibold text-oxford-blue mb-4 flex items-center">
              <Navigation size={18} className="mr-2" />
              Live Status Timeline
            </h3>

            <div className="space-y-4">
              {stages.map((stage, index) => {
                const status = getStageStatus(stage.key, tracking.currentStage);
                return (
                  <div key={stage.key} className="relative">
                    {index < stages.length - 1 && (
                      <div
                        className={`absolute left-2.5 top-8 w-0.5 h-12 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {getStageIcon(stage.key, tracking.currentStage)}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          status === 'active' ? 'text-blue-600' :
                          status === 'completed' ? 'text-green-600' :
                          'text-gray-400'
                        }`}>
                          {stage.label}
                        </div>
                        <div className="text-sm text-gray-500">{stage.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin size={16} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Distance</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {tracking.distanceToPickupKm} km
              </div>
              <div className="text-xs text-blue-700 mt-1">To your stop</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={16} className="text-green-600" />
                <span className="text-xs font-medium text-green-800">ETA</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {tracking.etaMinutes} min
              </div>
              <div className="text-xs text-green-700 mt-1">Estimated arrival</div>
            </CardContent>
          </Card>
        </div>

        <Card className={`border-2 ${
          tracking.status === 'delayed'
            ? 'bg-orange-50 border-orange-300'
            : 'bg-blue-50 border-blue-300'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MessageSquare size={20} className={
                tracking.status === 'delayed' ? 'text-orange-600 mt-0.5' : 'text-blue-600 mt-0.5'
              } />
              <div>
                <h4 className={`font-semibold mb-1 ${
                  tracking.status === 'delayed' ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  Status Update
                </h4>
                <p className={`text-sm ${
                  tracking.status === 'delayed' ? 'text-orange-700' : 'text-blue-700'
                }`}>
                  {tracking.statusMessage}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {formatLastUpdated()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-3 flex items-center">
              <Bell size={18} className="mr-2" />
              Notification Preferences
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => toggleNotification('notify10Min')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  tracking.notify10Min
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {tracking.notify10Min ? (
                    <Bell size={20} className="text-green-600" />
                  ) : (
                    <BellOff size={20} className="text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Notify when bus is 10 minutes away
                  </span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  tracking.notify10Min ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${
                    tracking.notify10Min ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>

              <button
                onClick={() => toggleNotification('notifyDelay')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                  tracking.notifyDelay
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {tracking.notifyDelay ? (
                    <Bell size={20} className="text-green-600" />
                  ) : (
                    <BellOff size={20} className="text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Notify if there is a delay
                  </span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  tracking.notifyDelay ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${
                    tracking.notifyDelay ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="py-3 flex items-center justify-center space-x-2"
          >
            <Phone size={18} />
            <span>Contact Support</span>
          </Button>
          <Button
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 py-3"
          >
            View Trip Details
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};
