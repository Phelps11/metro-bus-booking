import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Shield, MapPin, Calendar, Percent, Clock, ArrowLeft, Wallet, Plus, CreditCard, Building2, MessageCircle, ChevronDown, ChevronUp, Bell, Trash2 } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { DatePicker } from '../../components/ui/date-picker';
import { InputWithSuggestions } from '../../components/ui/input-with-suggestions';
import { useApp } from '../../context/AppContext';
import { UserProfile, RouteSubscription, Route } from '../../types';
import { isWorkingDay, getNextWorkingDay, formatDateForInput, createDateFromString } from '../../utils/dateUtils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ProfileProps {
  activeScreen: string;
  onNavigate: (screen: string, data?: any) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ activeScreen, onNavigate, onBack, onHome }) => {
  const { userProfile, setUserProfile, setSearchResults } = useApp();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(userProfile);
  const [loading, setLoading] = useState(false);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      loadSubscribedRoutes();
    }
  }, [user]);

  const loadSubscribedRoutes = async () => {
    if (!user) return;

    setLoadingSubscriptions(true);
    try {
      const { data, error } = await supabase
        .from('route_subscriptions')
        .select(`
          id,
          route_id,
          from_location,
          to_location,
          is_active,
          created_at
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscribedRoutes(data || []);
    } catch (error) {
      console.error('Error loading subscribed routes:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setEditedProfile(localProfile);
    }
  }, [localProfile, isEditing]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const profile: UserProfile = {
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          email: data.email,
          emergencyContact: data.emergency_contact || '',
          preferredRoutes: [],
          subscriptions: [],
          walletBalance: data.wallet_balance || 0
        };
        setUserProfile(profile);
        setLocalProfile(profile);
        setEditedProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  const [newSubscription, setNewSubscription] = useState({
    route: '',
    duration: 1,
    subscriptionType: 'weekly' as 'weekly' | 'custom'
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  // Wallet funding states
  const [showWalletFunding, setShowWalletFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [walletBalance] = useState(15750); // Mock wallet balance

  // Contact support states
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [isSupportExpanded, setIsSupportExpanded] = useState(false);

  // Subscribed routes states
  const [subscribedRoutes, setSubscribedRoutes] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  // Quick booking states
  const [showQuickBooking, setShowQuickBooking] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Route suggestions for the input
  const routeSuggestions = [
    { value: "Berger - Lekki Phase 1", label: "Berger → Lekki Phase 1" },
    { value: "Ikorodu - Lekki Phase 1", label: "Ikorodu → Lekki Phase 1" },
    { value: "TBS - Ikorodu", label: "TBS → Ikorodu" },
    { value: "Ojota - Victoria Island", label: "Ojota → Victoria Island" },
    { value: "Ikeja - Surulere", label: "Ikeja → Surulere" },
    { value: "Mile 2 - Lekki", label: "Mile 2 → Lekki" },
    { value: "Oshodi - Victoria Island", label: "Oshodi → Victoria Island" },
    { value: "Yaba - Ikeja", label: "Yaba → Ikeja" },
    { value: "Marina - Ikorodu", label: "Marina → Ikorodu" },
    { value: "CMS - Berger", label: "CMS → Berger" },
    { value: "Obalende - Ojota", label: "Obalende → Ojota" },
    { value: "Ketu - Lekki Phase 1", label: "Ketu → Lekki Phase 1" },
    { value: "Surulere - Victoria Island", label: "Surulere → Victoria Island" },
    { value: "Ikeja - Marina", label: "Ikeja → Marina" },
    { value: "Berger - Victoria Island", label: "Berger → Victoria Island" },
    { value: "Lekki - Ikeja", label: "Lekki → Ikeja" },
    { value: "Victoria Island - Ikorodu", label: "Victoria Island → Ikorodu" },
    { value: "TBS - Lekki Phase 1", label: "TBS → Lekki Phase 1" },
    { value: "Oshodi - Berger", label: "Oshodi → Berger" },
    { value: "Mile 2 - Victoria Island", label: "Mile 2 → Victoria Island" }
  ];

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editedProfile.fullName,
          phone_number: editedProfile.phoneNumber,
          email: editedProfile.email,
          emergency_contact: editedProfile.emergencyContact
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile(editedProfile);
      setLocalProfile(editedProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(localProfile);
    setIsEditing(false);
  };

  const handleSubscribeToRoute = () => {
    if (newSubscription.route) {
      if (newSubscription.subscriptionType === 'custom' && selectedDates.length === 0) {
        alert('Please select at least one date for your custom subscription');
        return;
      }

      // Calculate pricing with updated base price
      const basePrice = 2400; // Updated base price per trip
      let originalPrice = 0;
      let workingDays = 0;

      if (newSubscription.subscriptionType === 'weekly') {
        const tripsPerWeek = 10; // Assume 5 days * 2 trips per day
        workingDays = 5 * newSubscription.duration;
        originalPrice = basePrice * tripsPerWeek * newSubscription.duration;
      } else {
        workingDays = selectedDates.length;
        originalPrice = basePrice * selectedDates.length * 2; // Round trip
      }

      const discount = 5; // 5% discount
      const discountedPrice = Math.round(originalPrice * (1 - discount / 100));

      const subscriptionData = {
        route: newSubscription.route,
        duration: newSubscription.duration,
        subscriptionType: newSubscription.subscriptionType,
        selectedDates: newSubscription.subscriptionType === 'custom' ? selectedDates : [],
        originalPrice,
        discountedPrice,
        discount,
        workingDays
      };

      // Navigate to subscription payment page
      onNavigate('subscription-payment', subscriptionData);
    }
  };

  const handleSubscriptionPaymentComplete = (subscription: RouteSubscription) => {
    setEditedProfile(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, subscription]
    }));
    setUserProfile({
      ...editedProfile,
      subscriptions: [...editedProfile.subscriptions, subscription]
    });
    setNewSubscription({ route: '', duration: 1, subscriptionType: 'weekly' });
    setSelectedDates([]);
    onNavigate('profile');
  };

  const handleWalletFunding = () => {
    const amount = parseFloat(fundingAmount);
    if (amount && amount >= 100) {
      // Simulate funding process
      alert(`Funding wallet with ₦${amount.toLocaleString()}. Payment method: ${selectedPaymentMethod === 'card' ? 'Card' : 'Bank Transfer'}`);
      setShowWalletFunding(false);
      setFundingAmount('');
    } else {
      alert('Minimum funding amount is ₦100');
    }
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage.trim() || !supportSubject.trim()) {
      alert('Please fill in both subject and message');
      return;
    }

    if (supportMessage.length > 500) {
      alert('Message must be 500 characters or less');
      return;
    }

    setSendingSupport(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user?.id,
          user_email: userProfile.email,
          user_name: userProfile.fullName,
          subject: supportSubject,
          message: supportMessage,
          status: 'pending'
        });

      if (error) throw error;

      alert('Your message has been sent to support. We will respond within 24 hours.');
      setSupportMessage('');
      setSupportSubject('');
    } catch (error) {
      console.error('Error sending support message:', error);
      alert('Failed to send message. Please try emailing metrobusng@gmail.com directly.');
    } finally {
      setSendingSupport(false);
    }
  };

  const handleRouteClick = (route: string) => {
    setSelectedRoute(route);
    setSelectedDate(formatDateForInput(getNextWorkingDay()));
    setDateError('');
    setShowQuickBooking(true);
  };

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString);
    
    if (dateString) {
      const selectedDateObj = createDateFromString(dateString);
      
      if (!isWorkingDay(selectedDateObj)) {
        setDateError('Service is only available Monday to Friday for working commuters');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleQuickBooking = () => {
    if (selectedRoute && selectedDate && !dateError) {
      const selectedDateObj = createDateFromString(selectedDate);

      if (!isWorkingDay(selectedDateObj)) {
        setDateError('Service is only available Monday to Friday for working commuters');
        return;
      }

      // Parse route to get from and to
      const [from, to] = selectedRoute.split(' - ');

      // Mock search results
      const mockResults: Route[] = [
        {
          id: '1',
          from: from,
          to: to,
          duration: '1h 30m',
          price: 2400,
          departureTime: '05:40',
          arrivalTime: '07:50',
          availableSeats: 12
        },
        {
          id: '2',
          from: from,
          to: to,
          duration: '1h 45m',
          price: 2400,
          departureTime: '08:30',
          arrivalTime: '10:15',
          availableSeats: 8
        },
        {
          id: '3',
          from: from,
          to: to,
          duration: '1h 35m',
          price: 2400,
          departureTime: '10:00',
          arrivalTime: '11:35',
          availableSeats: 15
        }
      ];

      setSearchResults(mockResults);
      setShowQuickBooking(false);
      onNavigate('search-results');
    }
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to unsubscribe from this route?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('route_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      setSubscribedRoutes(prev => prev.filter(sub => sub.id !== subscriptionId));
      alert('Successfully unsubscribed from route');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe. Please try again.');
    }
  };

  const availableRoutes = [
    'Berger - Lekki Phase 1',
    'Ikorodu - Lekki Phase 1',
    'TBS - Ikorodu',
    'Ojota - Victoria Island',
    'Ikeja - Surulere'
  ];

  const quickAmounts = [1000, 2500, 5000, 10000];

  return (
    <MobileLayout 
      showBottomNav={true} 
      activeScreen={activeScreen}
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Reduced size with auto layout and compact design */}
      <div className="bg-oxford-blue flex flex-col items-center justify-center py-4 px-4 relative min-h-[100px]">
        {/* Back Button - Only show if onBack is provided and we're not on home */}
        {onBack && activeScreen !== 'home' && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Compact profile section with auto layout */}
        <div className="flex items-center space-x-3">
          {/* Profile Avatar */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <User size={24} className="text-oxford-blue" />
          </div>
          
          {/* Profile Info */}
          <div className="text-white">
            <h1 className="[font-family:'Lato',Helvetica] font-bold text-lg">
              Profile
            </h1>
            <div className="text-sm opacity-90">
              {userProfile.fullName}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-4">
        {/* Quick Booking Modal */}
        {showQuickBooking && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]" onClick={() => setShowQuickBooking(false)} />
            <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white shadow-lg border-2 border-green-200 z-[101]">
              <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-oxford-blue text-lg">Quick Book Trip</h3>
                <button
                  onClick={() => setShowQuickBooking(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Selected Route */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-green-600" />
                    <span className="font-medium text-green-800">{selectedRoute}</span>
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Travel Date
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={formatDateForInput(new Date())}
                    className={`w-full ${dateError ? 'border-red-500' : ''}`}
                  />
                  {dateError && (
                    <div className="mt-1 text-red-500 text-sm">
                      {dateError}
                    </div>
                  )}
                </div>

                {/* Working Days Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Service available Monday to Friday for working commuters
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowQuickBooking(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleQuickBooking}
                    disabled={!selectedRoute || !selectedDate || !!dateError}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Find Buses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
        )}

        {/* Wallet Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Wallet size={24} className="text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Wallet Balance</h3>
                  <div className="text-2xl font-bold text-green-700">
                    ₦{walletBalance.toLocaleString()}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowWalletFunding(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
              >
                <Plus size={16} className="mr-1" />
                Add Funds
              </Button>
            </div>
            
            <div className="text-sm text-green-700">
              Use your wallet for quick payments and enjoy seamless booking experience
            </div>
          </CardContent>
        </Card>

        {/* Wallet Funding Modal */}
        {showWalletFunding && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[100]" onClick={() => setShowWalletFunding(false)} />
            <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white shadow-lg border-2 border-green-200 z-[101]">
              <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-oxford-blue text-lg">Fund Wallet</h3>
                <button
                  onClick={() => setShowWalletFunding(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Minimum ₦100)
                  </label>
                  <Input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="100"
                    className="text-lg"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setFundingAmount(amount.toString())}
                        className="text-sm"
                      >
                        ₦{amount.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`w-full p-3 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                        selectedPaymentMethod === 'card'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard 
                        size={20} 
                        className={selectedPaymentMethod === 'card' ? 'text-green-600' : 'text-gray-600'} 
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Instant funding</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === 'card'
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'card' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod('transfer')}
                      className={`w-full p-3 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                        selectedPaymentMethod === 'transfer'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 
                        size={20} 
                        className={selectedPaymentMethod === 'transfer' ? 'text-green-600' : 'text-gray-600'} 
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-gray-600">5-10 minutes processing</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === 'transfer'
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === 'transfer' && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Fund Button */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowWalletFunding(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWalletFunding}
                    disabled={!fundingAmount || parseFloat(fundingAmount) < 100}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Fund Wallet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </>
        )}

        {/* Subscribed Routes */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Bell size={20} className="text-oxford-blue" />
              <h3 className="font-semibold text-oxford-blue">My Subscribed Routes</h3>
            </div>

            {loadingSubscriptions ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : subscribedRoutes.length > 0 ? (
              <div className="space-y-3">
                {subscribedRoutes.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-oxford-blue transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin size={16} className="text-green-600" />
                          <span className="font-medium text-oxford-blue">
                            {subscription.from_location} → {subscription.to_location}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Subscribed on {new Date(subscription.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleUnsubscribe(subscription.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 mb-2">No subscribed routes yet</p>
                <p className="text-sm text-gray-400">
                  Subscribe to routes from the search results to get updates
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-oxford-blue">Contact Information</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditedProfile(localProfile);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User size={20} className="text-gray-500" />
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Full Name</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.fullName}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  ) : (
                    <div className="font-medium">{localProfile.fullName}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-gray-500" />
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Phone Number</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.phoneNumber}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    />
                  ) : (
                    <div className="font-medium">{localProfile.phoneNumber}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-gray-500" />
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Email Address</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="font-medium">{localProfile.email}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield size={20} className="text-gray-500" />
                <div className="flex-1">
                  <label className="block text-sm text-gray-600">Emergency Contact</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.emergencyContact}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  ) : (
                    <div className="font-medium">{localProfile.emergencyContact}</div>
                  )}
                </div>
              </div>

              {isEditing && (
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Route Subscriptions */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin size={20} className="text-oxford-blue" />
              <h3 className="font-semibold text-oxford-blue">Route Subscriptions</h3>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2">
                <Percent size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Save 5% when you subscribe to any route!
                </span>
              </div>
            </div>

            {/* Existing Subscriptions */}
            {editedProfile.subscriptions.length > 0 && (
              <div className="space-y-3 mb-4">
                {editedProfile.subscriptions.map((subscription) => (
                  <div key={subscription.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{subscription.route}</div>
                        <div className="text-sm text-gray-600">
                          {subscription.duration} week{subscription.duration > 1 ? 's' : ''} subscription
                        </div>
                        <div className="text-sm text-green-600">
                          {subscription.discount}% discount applied
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        subscription.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.isActive ? 'Active' : 'Expired'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Subscription */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Route
                </label>
                <Select
                  value={newSubscription.route}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, route: e.target.value }))}
                >
                  <option value="">Choose a route</option>
                  {availableRoutes.map((route) => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Type
                </label>
                <Select
                  value={newSubscription.subscriptionType}
                  onChange={(e) => setNewSubscription(prev => ({ 
                    ...prev, 
                    subscriptionType: e.target.value as 'weekly' | 'custom' 
                  }))}
                >
                  <option value="weekly">Weekly (Mon-Fri)</option>
                  <option value="custom">Custom Dates (Hybrid)</option>
                </Select>
              </div>

              {newSubscription.subscriptionType === 'weekly' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Weeks)
                  </label>
                  <Select
                    value={newSubscription.duration.toString()}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  >
                    <option value="1">1 Week</option>
                    <option value="2">2 Weeks</option>
                    <option value="3">3 Weeks</option>
                    <option value="4">4 Weeks</option>
                  </Select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Working Days
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Perfect for hybrid workers! Choose specific days you need to commute.
                      </span>
                    </div>
                  </div>
                  <DatePicker
                    selectedDates={selectedDates}
                    onDatesChange={setSelectedDates}
                    maxDates={20}
                  />
                </div>
              )}

              <Button
                onClick={handleSubscribeToRoute}
                disabled={!newSubscription.route || (newSubscription.subscriptionType === 'custom' && selectedDates.length === 0)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {newSubscription.subscriptionType === 'weekly' 
                  ? 'Subscribe to Route' 
                  : `Subscribe (${selectedDates.length} days selected)`
                }
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="bg-white shadow-md">
          <CardContent className="p-4">
            <button
              onClick={() => setIsSupportExpanded(!isSupportExpanded)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} className="text-oxford-blue" />
                <h3 className="font-semibold text-oxford-blue">Contact Support</h3>
              </div>
              {isSupportExpanded ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>

            {isSupportExpanded && (
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    Need help? Send us a message and we'll respond within 24 hours.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="Brief description of your issue"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message ({supportMessage.length}/500)
                    </label>
                    <textarea
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail..."
                      maxLength={500}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleSendSupportMessage}
                    disabled={sendingSupport || !supportMessage.trim() || !supportSubject.trim()}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {sendingSupport ? 'Sending...' : 'Send Message'}
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    Or email us directly at{' '}
                    <a href="mailto:metrobusng@gmail.com" className="text-green-600 hover:underline">
                      metrobusng@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="bg-white shadow-md border-red-100">
          <CardContent className="p-4">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};