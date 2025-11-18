import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Clock } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { InputWithSuggestions } from '../../components/ui/input-with-suggestions';
import { DatePicker } from '../../components/ui/date-picker';
import { Route } from '../../types';
import { supabase } from '../../lib/supabase';

interface HybridBookingProps {
  onBack: () => void;
  onContinue: (bookingData: any) => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const HybridBooking: React.FC<HybridBookingProps> = ({ onBack, onContinue, onHome, onNavigate }) => {
  const [step, setStep] = useState<'route' | 'stops' | 'dates' | 'summary'>('route');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState('');
  const [deboardingPoint, setDeboardingPoint] = useState('');
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: ''
  });
  const [showBuses, setShowBuses] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  // Location suggestions for dropdown
  const locationSuggestions = [
    { value: "Berger", label: "Berger Bus Stop" },
    { value: "Ikorodu", label: "Ikorodu Terminal" },
    { value: "TBS", label: "Tafawa Balewa Square" },
    { value: "Lekki Phase 1", label: "Lekki Phase 1 Terminal" },
    { value: "Victoria Island", label: "Victoria Island" },
    { value: "Ikeja", label: "Ikeja Bus Terminal" },
    { value: "Surulere", label: "Surulere" },
    { value: "Ojota", label: "Ojota Terminal" },
    { value: "Mile 2", label: "Mile 2 Bus Stop" },
    { value: "Oshodi", label: "Oshodi Interchange" },
    { value: "Yaba", label: "Yaba Bus Stop" },
    { value: "Marina", label: "Marina Terminal" },
    { value: "CMS", label: "CMS Bus Stop" },
    { value: "Obalende", label: "Obalende Terminal" },
    { value: "Ketu", label: "Ketu Bus Stop" }
  ];

  const handleRouteSearch = async () => {
    if (searchForm.from && searchForm.to) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('from_location', searchForm.from)
          .eq('to_location', searchForm.to);

        if (error) {
          console.error('Error fetching routes:', error);
          return;
        }

        const formattedRoutes: Route[] = (data || []).map((route) => ({
          id: route.id,
          from: route.from_location,
          to: route.to_location,
          duration: route.duration,
          price: route.price,
          departureTime: route.departure_time,
          arrivalTime: route.arrival_time,
          availableSeats: route.available_seats
        }));

        setAvailableRoutes(formattedRoutes);
        setShowBuses(true);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    // Set default boarding and deboarding points
    setBoardingPoint(route.from);
    setDeboardingPoint(route.to);
    setStep('stops');
  };

  const handleStopsConfirm = () => {
    if (boardingPoint && deboardingPoint) {
      setStep('dates');
    }
  };

  const handleDatesConfirm = () => {
    if (selectedDates.length > 0) {
      setStep('summary');
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedRoute) return 0;
    const basePrice = selectedRoute.price * selectedDates.length;
    const discount = selectedDates.length >= 5 ? 0.05 : 0;
    return Math.round(basePrice * (1 - discount));
  };

  const getDiscountText = () => {
    if (selectedDates.length >= 5) return '5% bulk discount applied!';
    return '';
  };

  const handleBookingConfirm = () => {
    const bookingData = {
      route: selectedRoute,
      dates: selectedDates,
      boardingPoint,
      deboardingPoint,
      totalPrice: calculateTotalPrice(),
      bookingType: 'hybrid',
      originalPrice: selectedRoute ? selectedRoute.price * selectedDates.length : 0,
      discount: selectedDates.length >= 5 ? 5 : 0
    };
    onContinue(bookingData);
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="hybrid-booking"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Reduced size with compact layout */}
      <div className="bg-oxford-blue h-[80px] flex items-center justify-center relative px-4">
        {/* Back Button - Positioned on the left */}
        <button 
          onClick={onBack}
          className="absolute left-4 text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        {/* Title - Centered using flexbox with smaller text */}
        <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-lg text-center">
          Hybrid Booking
        </h1>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Progress Indicator */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs">
              <div className={`flex items-center space-x-1 ${step === 'route' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step === 'route' ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>1</div>
                <span className="font-medium">Route</span>
              </div>

              <div className={`flex items-center space-x-1 ${step === 'stops' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step === 'stops' ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>2</div>
                <span className="font-medium">Stops</span>
              </div>

              <div className={`flex items-center space-x-1 ${step === 'dates' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step === 'dates' ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>3</div>
                <span className="font-medium">Dates</span>
              </div>

              <div className={`flex items-center space-x-1 ${step === 'summary' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  step === 'summary' ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>4</div>
                <span className="font-medium">Summary</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Route Selection */}
        {step === 'route' && (
          <>
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Perfect for Hybrid Workers!</h3>
                <p className="text-sm text-blue-700">
                  Select your route and choose specific working days. Great for flexible schedules, 
                  remote work days, and part-time office attendance.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold text-oxford-blue mb-4">Select Your Route</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <InputWithSuggestions
                      value={searchForm.from}
                      onChange={(value) => setSearchForm(prev => ({ ...prev, from: value }))}
                      placeholder="Enter departure location"
                      suggestions={locationSuggestions}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <InputWithSuggestions
                      value={searchForm.to}
                      onChange={(value) => setSearchForm(prev => ({ ...prev, to: value }))}
                      placeholder="Enter destination"
                      suggestions={locationSuggestions}
                    />
                  </div>
                  
                  <Button
                    onClick={handleRouteSearch}
                    disabled={loading || !searchForm.from || !searchForm.to}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Find Routes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Buses */}
            {showBuses && (
              <div className="space-y-3">
                <h3 className="font-semibold text-oxford-blue">Available Buses</h3>
                {availableRoutes.map((route) => (
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
                          <div className="text-sm text-gray-600">per trip</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users size={16} />
                          <span>{route.availableSeats} seats available</span>
                        </div>
                        
                        <Button 
                          onClick={() => handleRouteSelect(route)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                        >
                          Select Route
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: Pick-up and Drop-off Selection */}
        {step === 'stops' && selectedRoute && (
          <>
            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin size={20} className="text-green-600" />
                  <div>
                    <div className="font-medium">{selectedRoute.from} → {selectedRoute.to}</div>
                    <div className="text-sm text-gray-600">
                      {selectedRoute.departureTime} • ₦{selectedRoute.price.toLocaleString()} per trip
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Select Your Stops</h3>
                <p className="text-sm text-blue-700">
                  Choose your preferred boarding and deboarding points for maximum convenience.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold text-oxford-blue mb-4">Boarding & Deboarding Points</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Pick-up Point
                    </label>
                    <InputWithSuggestions
                      value={boardingPoint}
                      onChange={setBoardingPoint}
                      placeholder="Select boarding point"
                      suggestions={locationSuggestions}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Drop-off Point
                    </label>
                    <InputWithSuggestions
                      value={deboardingPoint}
                      onChange={setDeboardingPoint}
                      placeholder="Select deboarding point"
                      suggestions={locationSuggestions}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setStep('route')}
                className="py-3"
              >
                Back to Routes
              </Button>
              <Button
                onClick={handleStopsConfirm}
                disabled={!boardingPoint || !deboardingPoint}
                className="bg-green-600 hover:bg-green-700 py-3 disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Date Selection */}
        {step === 'dates' && selectedRoute && (
          <>
            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin size={20} className="text-green-600" />
                  <div>
                    <div className="font-medium">{selectedRoute.from} → {selectedRoute.to}</div>
                    <div className="text-sm text-gray-600">
                      {selectedRoute.departureTime} • ₦{selectedRoute.price.toLocaleString()} per trip
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Choose Your Working Days</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Select the specific days you need to commute. Perfect for hybrid work schedules!
                </p>
                <div className="text-xs text-blue-600">
                  💰 Save more with bulk booking: 5+ days = 5% off
                </div>
              </CardContent>
            </Card>

            <DatePicker
              selectedDates={selectedDates}
              onDatesChange={setSelectedDates}
              maxDates={10}
            />

            {selectedDates.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Selected Dates</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedDates.map(date => (
                      <div key={date} className="text-green-700">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    ))}
                  </div>
                  {getDiscountText() && (
                    <div className="mt-2 text-sm font-medium text-green-800">
                      🎉 {getDiscountText()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleDatesConfirm}
              disabled={selectedDates.length === 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Continue to Summary ({selectedDates.length} days selected)
            </Button>
          </>
        )}

        {/* Step 3: Summary */}
        {step === 'summary' && selectedRoute && (
          <>
            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <h3 className="font-semibold text-oxford-blue mb-4">Booking Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium">{selectedRoute.from} → {selectedRoute.to}</div>
                      <div className="text-sm text-gray-600">
                        {selectedRoute.departureTime} - {selectedRoute.arrivalTime} • {selectedRoute.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-oxford-blue" />
                    <div>
                      <div className="font-medium">{selectedDates.length} Selected Days</div>
                      <div className="text-sm text-gray-600">
                        {selectedDates.slice(0, 3).map(date =>
                          new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        ).join(', ')}
                        {selectedDates.length > 3 && ` +${selectedDates.length - 3} more`}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Boarding Point:</span>
                      <span className="text-sm font-medium">{boardingPoint}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deboarding Point:</span>
                      <span className="text-sm font-medium">{deboardingPoint}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Base Price ({selectedDates.length} trips):</span>
                    <span className="text-sm">₦{(selectedRoute.price * selectedDates.length).toLocaleString()}</span>
                  </div>
                  
                  {getDiscountText() && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-green-700">Discount:</span>
                      <span className="text-sm text-green-700">
                        -₦{((selectedRoute.price * selectedDates.length) - calculateTotalPrice()).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-oxford-blue">
                        ₦{calculateTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => setStep('dates')}
                className="py-3"
              >
                Back to Dates
              </Button>
              <Button 
                onClick={handleBookingConfirm}
                className="bg-green-600 hover:bg-green-700 py-3"
              >
                Proceed to Payment
              </Button>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};