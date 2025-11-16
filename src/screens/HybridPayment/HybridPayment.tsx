import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Building2, Copy, Check, Calendar, MapPin, Info, Clock } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Route, Ticket } from '../../types';

interface HybridPaymentProps {
  bookingData: {
    route: Route;
    dates: string[];
    totalPrice: number;
    bookingType: string;
    originalPrice: number;
    discount: number;
  };
  onBack: () => void;
  onPaymentComplete: (tickets: Ticket[]) => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const HybridPayment: React.FC<HybridPaymentProps> = ({
  bookingData,
  onBack,
  onPaymentComplete,
  onHome,
  onNavigate
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'wallet' | 'transfer'>('card');
  const [promoCode, setPromoCode] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

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

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      // Create tickets for each selected date
      const tickets: Ticket[] = bookingData.dates.map((date, index) => ({
        id: `${Date.now()}-${index}`,
        ticketNumber: `HB${Date.now().toString().slice(-6)}${index}`,
        passengerName: 'Hybrid Worker', // This would come from user profile
        route: `${bookingData.route.from} → ${bookingData.route.to}`,
        boardingTime: bookingData.route.departureTime,
        boardingPoint: 'Berger Bus Stop',
        deboardingPoint: 'Lekki Phase 1 Terminal',
        date: date,
        status: Math.random() > 0.8 ? 'delayed' : 'confirmed',
        delayMinutes: Math.random() > 0.8 ? 30 : undefined,
        barcode: `HB${Date.now().toString()}${index}`
      }));
      
      onPaymentComplete(tickets);
    }, 1500);
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="hybrid-payment"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header */}
      <div className="bg-oxford-blue h-[120px] relative">
        <button 
          onClick={onBack}
          className="absolute top-16 left-4 text-white p-2"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl">
            Hybrid Payment
          </h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Hybrid Booking Notice */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Clock className="text-purple-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-purple-800 mb-1">
                  Hybrid Worker Multi-Day Booking
                </h3>
                <p className="text-sm text-purple-700">
                  Perfect for flexible schedules! You've selected {bookingData.dates.length} specific working days 
                  that fit your hybrid work pattern.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-4">Booking Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-green-600" />
                <div>
                  <div className="font-medium text-lg">{bookingData.route.from} → {bookingData.route.to}</div>
                  <div className="text-sm text-gray-600">
                    Hybrid Multi-Day Booking
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-oxford-blue" />
                <div>
                  <div className="font-medium">
                    {bookingData.dates.length} Selected Working Days
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(bookingData.dates[0]).toLocaleDateString()} to {new Date(bookingData.dates[bookingData.dates.length - 1]).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    Departure: {bookingData.route.departureTime} each day
                  </div>
                </div>
              </div>

              {/* Selected dates preview */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-medium text-purple-800 mb-2">Your Selected Dates:</h4>
                <div className="grid grid-cols-2 gap-1 text-sm text-purple-700">
                  {bookingData.dates.slice(0, 6).map(date => (
                    <div key={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  ))}
                  {bookingData.dates.length > 6 && (
                    <div className="text-purple-600 font-medium">
                      +{bookingData.dates.length - 6} more days
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Original Price:</span>
                  <span className="text-sm line-through text-gray-500">
                    ₦{bookingData.originalPrice.toLocaleString()}
                  </span>
                </div>
                {bookingData.discount > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-700 font-medium">
                      Bulk Discount ({bookingData.discount}%):
                    </span>
                    <span className="text-sm text-green-700 font-medium">
                      -₦{(bookingData.originalPrice - bookingData.totalPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">You Pay:</span>
                    <span className="text-2xl font-bold text-green-800">
                      ₦{bookingData.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-800 mb-3">
              Hybrid Worker Benefits
            </h3>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span>Perfect flexibility for hybrid work schedules</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span>Save money with bulk booking discounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span>Choose only the days you need to commute</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span>Lock in your seat and save time</span>
              </li>
            </ul>
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
                  <strong>Instructions:</strong> Transfer the exact amount and use "HYBRID-{Date.now().toString().slice(-6)}" as the reference. 
                  Your tickets will be generated once payment is received (usually within 5-10 minutes).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Button */}
        <div className="pb-4">
          <Button 
            onClick={handlePayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
          >
            Pay ₦{bookingData.totalPrice.toLocaleString()}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};