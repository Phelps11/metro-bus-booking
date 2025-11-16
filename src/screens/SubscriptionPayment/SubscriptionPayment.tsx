import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Building2, Copy, Check, Calendar, MapPin, Info, Clock } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { RouteSubscription } from '../../types';
import { getWorkingDaysInRange } from '../../utils/dateUtils';

interface SubscriptionPaymentProps {
  subscription: {
    route: string;
    duration: number;
    subscriptionType: 'weekly' | 'custom';
    selectedDates?: string[];
    originalPrice: number;
    discountedPrice: number;
    discount: number;
    workingDays: number;
  };
  onBack: () => void;
  onPaymentComplete: (subscription: RouteSubscription) => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const SubscriptionPayment: React.FC<SubscriptionPaymentProps> = ({
  subscription,
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
      const newSubscription: RouteSubscription = {
        id: Date.now().toString(),
        route: subscription.route,
        duration: subscription.duration,
        startDate: new Date().toISOString().split('T')[0],
        endDate: subscription.subscriptionType === 'weekly' 
          ? new Date(Date.now() + subscription.duration * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : subscription.selectedDates?.[subscription.selectedDates.length - 1] || new Date().toISOString().split('T')[0],
        discount: 5,
        isActive: true
      };
      onPaymentComplete(newSubscription);
    }, 1500);
  };

  const getSubscriptionDescription = () => {
    if (subscription.subscriptionType === 'weekly') {
      return `${subscription.duration} week${subscription.duration > 1 ? 's' : ''} of daily commuting (Mon-Fri)`;
    } else {
      return `${subscription.selectedDates?.length || 0} custom selected working days`;
    }
  };

  const getDateRangeText = () => {
    if (subscription.subscriptionType === 'weekly') {
      const endDate = new Date(Date.now() + subscription.duration * 7 * 24 * 60 * 60 * 1000);
      return `${new Date().toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    } else if (subscription.selectedDates && subscription.selectedDates.length > 0) {
      const sortedDates = [...subscription.selectedDates].sort();
      const firstDate = new Date(sortedDates[0]).toLocaleDateString();
      const lastDate = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString();
      return `${firstDate} to ${lastDate}`;
    }
    return 'Custom dates selected';
  };

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="subscription-payment"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Reduced height from 160px to 120px */}
      <div className="bg-oxford-blue h-[120px] relative">
        <button 
          onClick={onBack}
          className="absolute top-16 left-4 text-white p-2"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl">
            Subscription Payment
          </h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Subscription Type Notice */}
        <Card className={`border-2 ${
          subscription.subscriptionType === 'custom' 
            ? 'bg-purple-50 border-purple-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {subscription.subscriptionType === 'custom' ? (
                <Clock className="text-purple-600 mt-0.5" size={20} />
              ) : (
                <Info className="text-blue-600 mt-0.5" size={20} />
              )}
              <div>
                <h3 className={`font-semibold mb-1 ${
                  subscription.subscriptionType === 'custom' 
                    ? 'text-purple-800' 
                    : 'text-blue-800'
                }`}>
                  {subscription.subscriptionType === 'custom' 
                    ? 'Hybrid Worker Subscription' 
                    : 'Weekly Working Days Service'
                  }
                </h3>
                <p className={`text-sm ${
                  subscription.subscriptionType === 'custom' 
                    ? 'text-purple-700' 
                    : 'text-blue-700'
                }`}>
                  {subscription.subscriptionType === 'custom' 
                    ? `Perfect for flexible schedules! You've selected ${subscription.workingDays} specific working days that fit your hybrid work pattern.`
                    : `This subscription covers ${subscription.workingDays} working days (Monday-Friday only) over ${subscription.duration} week${subscription.duration > 1 ? 's' : ''}. Perfect for your daily commute to work!`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Summary */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <h3 className="font-semibold text-oxford-blue mb-4">Subscription Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-green-600" />
                <div>
                  <div className="font-medium text-lg">{subscription.route}</div>
                  <div className="text-sm text-gray-600">
                    {subscription.subscriptionType === 'custom' ? 'Custom Hybrid' : 'Weekly'} Route Subscription
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-oxford-blue" />
                <div>
                  <div className="font-medium">
                    {getSubscriptionDescription()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Valid: {getDateRangeText()}
                  </div>
                  <div className={`text-sm font-medium ${
                    subscription.subscriptionType === 'custom' 
                      ? 'text-purple-600' 
                      : 'text-blue-600'
                  }`}>
                    Covers {subscription.workingDays} working days
                  </div>
                </div>
              </div>

              {/* Custom dates preview */}
              {subscription.subscriptionType === 'custom' && subscription.selectedDates && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-medium text-purple-800 mb-2">Your Selected Dates:</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm text-purple-700">
                    {subscription.selectedDates.slice(0, 6).map(date => (
                      <div key={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    ))}
                    {subscription.selectedDates.length > 6 && (
                      <div className="text-purple-600 font-medium">
                        +{subscription.selectedDates.length - 6} more days
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Original Price:</span>
                  <span className="text-sm line-through text-gray-500">
                    ₦{subscription.originalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-green-700 font-medium">
                    Subscription Discount (5%):
                  </span>
                  <span className="text-sm text-green-700 font-medium">
                    -₦{(subscription.originalPrice - subscription.discountedPrice).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">You Pay:</span>
                    <span className="text-2xl font-bold text-green-800">
                      ₦{subscription.discountedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className={`bg-gradient-to-r border-2 ${
          subscription.subscriptionType === 'custom' 
            ? 'from-purple-50 to-pink-50 border-purple-200' 
            : 'from-green-50 to-blue-50 border-green-200'
        }`}>
          <CardContent className="p-4">
            <h3 className={`font-semibold mb-3 ${
              subscription.subscriptionType === 'custom' 
                ? 'text-purple-800' 
                : 'text-green-800'
            }`}>
              {subscription.subscriptionType === 'custom' 
                ? 'Hybrid Worker Benefits' 
                : 'Subscription Benefits'
              }
            </h3>
            <ul className={`space-y-2 text-sm ${
              subscription.subscriptionType === 'custom' 
                ? 'text-purple-700' 
                : 'text-green-700'
            }`}>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.subscriptionType === 'custom' 
                    ? 'bg-purple-600' 
                    : 'bg-green-600'
                }`}></div>
                <span>Save 5% on every trip</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.subscriptionType === 'custom' 
                    ? 'bg-purple-600' 
                    : 'bg-green-600'
                }`}></div>
                <span>
                  {subscription.subscriptionType === 'custom' 
                    ? 'Perfect flexibility for hybrid work schedules' 
                    : 'No more daily booking stress'
                  }
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.subscriptionType === 'custom' 
                    ? 'bg-purple-600' 
                    : 'bg-green-600'
                }`}></div>
                <span>Lock in your seat and save time, money, and energy</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.subscriptionType === 'custom' 
                    ? 'bg-purple-600' 
                    : 'bg-green-600'
                }`}></div>
                <span>
                  {subscription.subscriptionType === 'custom' 
                    ? 'Choose only the days you need to commute' 
                    : 'Perfect for working professionals (Mon-Fri service)'
                  }
                </span>
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
                  <strong>Instructions:</strong> Transfer the exact amount and use "SUB-{subscription.route.replace(' ', '')}" as the reference. 
                  Your subscription will be activated once payment is received (usually within 5-10 minutes).
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
            Pay ₦{subscription.discountedPrice.toLocaleString()}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};