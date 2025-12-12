import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Building2, Copy, Check } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { BookingDetails } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface PaymentProps {
  bookingDetails: BookingDetails;
  onBack: () => void;
  onPaymentComplete: () => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const Payment: React.FC<PaymentProps> = ({
  bookingDetails,
  onBack,
  onPaymentComplete,
  onHome,
  onNavigate
}) => {
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'wallet' | 'transfer'>('card');
  const [promoCode, setPromoCode] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard' },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, description: 'Quick payment' },
    { id: 'transfer', name: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' }
  ];

  const bankDetails = {
    bankName: 'First Bank of Nigeria',
    accountName: 'Metro Bus Services Ltd',
    accountNumber: '2034567890',
    sortCode: '011-152-003'
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(type);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handlePayment = async () => {
    if (!user) return;

    setProcessing(true);

    try {
      if (bookingDetails.isSubscription && bookingDetails.subscriptionData) {
        const { error } = await supabase
          .from('route_subscriptions')
          .insert({
            user_id: user.id,
            route_id: bookingDetails.route.id,
            from_location: bookingDetails.route.from,
            to_location: bookingDetails.route.to,
            duration_weeks: bookingDetails.subscriptionData.durationWeeks,
            start_date: bookingDetails.subscriptionData.startDate,
            end_date: bookingDetails.subscriptionData.endDate,
            is_active: true
          });

        if (error) throw error;

        alert(`Successfully subscribed for ${bookingDetails.subscriptionData.durationWeeks} weeks!`);
      } else {
        const ticketNumber = `MB${Date.now().toString().slice(-8)}`;

        const { error } = await supabase
          .from('bookings')
          .insert({
            user_id: user.id,
            route_id: bookingDetails.route.id,
            passenger_name: bookingDetails.passenger.name,
            passenger_age: parseInt(bookingDetails.passenger.age),
            passenger_gender: bookingDetails.passenger.gender,
            passenger_email: bookingDetails.passenger.email,
            passenger_phone: bookingDetails.passenger.phoneNumber,
            boarding_point: bookingDetails.boardingPoint,
            deboarding_point: bookingDetails.deboardingPoint,
            booking_date: bookingDetails.date,
            total_fare: bookingDetails.totalFare,
            ticket_number: ticketNumber,
            status: 'confirmed',
            subscribe_to_updates: bookingDetails.passenger.subscribeToUpdates,
            receive_alerts: bookingDetails.passenger.receiveAlerts
          });

        if (error) throw error;
      }

      setTimeout(() => {
        onPaymentComplete();
      }, 500);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="payment"
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
          Payment
        </h1>
      </div>

      {/* Content with proper spacing */}
      <div className="px-4 py-4 space-y-4">
        {/* Price Summary */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-4">
              {bookingDetails.isSubscription ? 'Subscription Summary' : 'Payment Summary'}
            </h3>

            <div className="space-y-2">
              {bookingDetails.isSubscription ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="text-sm font-medium text-blue-800 mb-1">Route Subscription</div>
                    <div className="text-xs text-blue-600">
                      {bookingDetails.subscriptionData?.durationWeeks} weeks subscription pass
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-medium">{bookingDetails.route.from} → {bookingDetails.route.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passenger:</span>
                    <span className="font-medium">{bookingDetails.passenger.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{bookingDetails.subscriptionData?.durationWeeks} weeks</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Single Trip Price:</span>
                    <span>₦{bookingDetails.route.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Value equivalent:</span>
                    <span>~{(bookingDetails.subscriptionData?.durationWeeks || 0) * 6} trips</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span className="font-medium">{new Date(bookingDetails.subscriptionData?.startDate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span className="font-medium">{new Date(bookingDetails.subscriptionData?.endDate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700">
                    Save money with subscription pricing
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Route: {bookingDetails.route.from} → {bookingDetails.route.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passenger: {bookingDetails.passenger.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date: {bookingDetails.date}</span>
                  </div>
                </>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-oxford-blue">
                    ₦{bookingDetails.totalFare.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Promo Code */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1"
              />
              <Button variant="outline" className="px-4">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                    className={`w-full p-3 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent 
                      size={24} 
                      className={selectedPaymentMethod === method.id ? 'text-green-600' : 'text-gray-600'} 
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPaymentMethod === method.id
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === method.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bank Transfer Details */}
        {selectedPaymentMethod === 'transfer' && (
          <Card className="bg-white shadow-md">
            <CardContent className="p-4">
              <h3 className="font-semibold text-oxford-blue mb-4">Bank Transfer Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Bank Name</div>
                    <div className="font-medium">{bankDetails.bankName}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Account Name</div>
                    <div className="font-medium">{bankDetails.accountName}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Account Number</div>
                    <div className="font-medium">{bankDetails.accountNumber}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                    className="text-green-600 p-1"
                  >
                    {copiedAccount === 'account' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm text-gray-600">Sort Code</div>
                    <div className="font-medium">{bankDetails.sortCode}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.sortCode, 'sort')}
                    className="text-green-600 p-1"
                  >
                    {copiedAccount === 'sort' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> Transfer the exact amount and use your phone number as the reference. 
                  Your ticket will be confirmed once payment is received (usually within 5-10 minutes).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Button */}
        <div className="pb-4">
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
          >
            {processing ? 'Processing...' : `Pay ₦${bookingDetails.totalFare.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};