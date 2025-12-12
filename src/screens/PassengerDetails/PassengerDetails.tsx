import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { useApp } from '../../context/AppContext';
import { PassengerDetails as PassengerDetailsType, Route } from '../../types';

interface PassengerDetailsProps {
  selectedRoute: Route;
  subscriptionData?: any;
  onBack: () => void;
  onContinue: (details: PassengerDetailsType) => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const PassengerDetails: React.FC<PassengerDetailsProps> = ({
  selectedRoute,
  subscriptionData,
  onBack,
  onContinue,
  onHome,
  onNavigate
}) => {
  const { userProfile } = useApp();
  const [details, setDetails] = useState<PassengerDetailsType>({
    name: userProfile.fullName,
    age: '',
    gender: '',
    email: userProfile.email,
    phoneNumber: userProfile.phoneNumber,
    boardingPoint: '',
    deboardingPoint: '',
    subscribeToUpdates: false,
    receiveAlerts: true
  });

  // Get available stops from the route
  const allStops = selectedRoute.stops || [];

  // Define stop filtering logic based on the route
  const getPickupStops = () => {
    if (allStops.length === 0) return [];

    // Find the indices of the boundary stops (handle variations in naming)
    const bergerIndex = allStops.findIndex(stop =>
      stop.toLowerCase().includes('berger')
    );
    const iyanaOworoIndex = allStops.findIndex(stop =>
      stop.toLowerCase().replace(/[-\s]/g, '').includes('iyanaoworo')
    );

    if (bergerIndex !== -1 && iyanaOworoIndex !== -1) {
      // Return stops from Berger to Iyana Oworo (inclusive)
      return allStops.slice(bergerIndex, iyanaOworoIndex + 1);
    }

    return allStops;
  };

  const getDropOffStops = () => {
    if (allStops.length === 0) return [];

    // Find the indices of the boundary stops (handle variations in naming)
    const bonnyCampIndex = allStops.findIndex(stop =>
      stop.toLowerCase().includes('bonny camp')
    );
    const lekkiPhase1Index = allStops.findIndex(stop =>
      stop.toLowerCase().includes('lekki phase 1')
    );

    if (bonnyCampIndex !== -1 && lekkiPhase1Index !== -1) {
      // Return stops from Bonny Camp to Lekki Phase 1 (inclusive)
      return allStops.slice(bonnyCampIndex, lekkiPhase1Index + 1);
    }

    return allStops;
  };

  const pickupStops = getPickupStops();
  const dropOffStops = getDropOffStops();

  const handleInputChange = (field: keyof PassengerDetailsType, value: string | boolean) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (details.name && details.age && details.gender && details.email && details.phoneNumber && details.boardingPoint && details.deboardingPoint) {
      onContinue(details);
    }
  };

  const isFormValid = details.name && details.age && details.gender && details.email && details.phoneNumber && details.boardingPoint && details.deboardingPoint;

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="passenger-details"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Using auto layout with proper spacing */}
      <div className="bg-oxford-blue w-full flex flex-col items-center justify-center py-6 px-4 relative min-h-[120px]">
        {/* Back Button - Positioned absolutely for proper alignment */}
        <button 
          onClick={onBack}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        {/* Title - Centered using flexbox */}
        <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl text-center">
          Passenger Details
        </h1>
      </div>

      {/* Content with proper spacing */}
      <div className="px-4 py-4 space-y-4">
        {/* Passenger Information Form */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-4">Passenger Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  value={details.name}
                  readOnly
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <Input
                    type="number"
                    value={details.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <Select
                    value={details.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={details.email}
                  readOnly
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={details.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pick-up Location *
                </label>
                <Select
                  value={details.boardingPoint}
                  onChange={(e) => handleInputChange('boardingPoint', e.target.value)}
                >
                  <option value="">Select pick-up location</option>
                  {pickupStops.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drop-off Location *
                </label>
                <Select
                  value={details.deboardingPoint}
                  onChange={(e) => handleInputChange('deboardingPoint', e.target.value)}
                >
                  <option value="">Select drop-off location</option>
                  {dropOffStops.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Checkbox
                  checked={details.subscribeToUpdates}
                  onChange={(e) => handleInputChange('subscribeToUpdates', e.target.checked)}
                  label="Subscribe to route updates and notifications"
                />
                
                <Checkbox
                  checked={details.receiveAlerts}
                  onChange={(e) => handleInputChange('receiveAlerts', e.target.checked)}
                  label="Receive trip alerts via email/SMS"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Fare */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            {subscriptionData?.isSubscription && subscriptionData?.durationWeeks ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Base Price:</span>
                  <span>₦{selectedRoute.price.toLocaleString()} × {subscriptionData.durationWeeks * 6} trips</span>
                </div>
                {subscriptionData.durationWeeks === 4 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>4-Week Discount (7%):</span>
                    <span>-₦{Math.round((selectedRoute.price * subscriptionData.durationWeeks * 6) * 0.07).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-lg font-medium">Total Subscription Fare</span>
                  <span className="text-2xl font-bold text-oxford-blue">
                    ₦{(() => {
                      const basePrice = selectedRoute.price * subscriptionData.durationWeeks * 6;
                      const discount = subscriptionData.durationWeeks === 4 ? 0.93 : 1;
                      return Math.round(basePrice * discount).toLocaleString();
                    })()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Fare</span>
                <span className="text-2xl font-bold text-oxford-blue">
                  ₦{selectedRoute.price.toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="pb-4">
          <Button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
          >
            Continue to Pay
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};