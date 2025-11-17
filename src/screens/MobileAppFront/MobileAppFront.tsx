import { CalendarIcon, MapPin, ArrowUpDown, Wallet, Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { InputWithSuggestions } from "../../components/ui/input-with-suggestions";
import { BottomNavigation } from "../../components/Layout/BottomNavigation";
import { useApp } from "../../context/AppContext";
import { Route } from "../../types";
import { isWorkingDay, getNextWorkingDay, formatDateForInput, createDateFromString } from "../../utils/dateUtils";
import { supabase } from "../../lib/supabase";

interface MobileAppFrontProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack?: () => void;
  onHome?: () => void;
}

export const MobileAppFront: React.FC<MobileAppFrontProps> = ({ onNavigate, onBack, onHome }) => {
  const { userProfile, setUserProfile, setSearchResults } = useApp();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: ''
  });
  const [dateError, setDateError] = useState('');
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [availableBuses, setAvailableBuses] = useState<Route[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get battery level
  useEffect(() => {
    const getBatteryLevel = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          setBatteryLevel(Math.round(battery.level * 100));

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        } catch (error) {
          console.log('Battery API not supported');
        }
      }
    };
    getBatteryLevel();
  }, []);

  // Set default date to next working day
  useEffect(() => {
    const nextWorkingDay = getNextWorkingDay();
    setSearchForm(prev => ({
      ...prev,
      date: formatDateForInput(nextWorkingDay)
    }));
  }, []);

  // Navigation items data
  const navItems = [
    { name: "Home", icon: "🏠" },
    { name: "My trips", icon: "📅" },
    { name: "Discover", icon: "🧭" },
    { name: "Profile", icon: "👤" },
  ];

  // Routes data with structured from/to information
  const routes = [
    { display: "Berger - Lekki Phase 1", from: "Berger", to: "Lekki Phase 1" },
    { display: "Ikorodu - Lekki Phase 1", from: "Ikorodu", to: "Lekki Phase 1" },
    { display: "TBS - Ikorodu", from: "TBS", to: "Ikorodu" },
  ];

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

  const handleDateChange = (dateString: string) => {
    setSearchForm(prev => ({ ...prev, date: dateString }));
    
    if (dateString) {
      // Use the helper function to create date without timezone issues
      const selectedDate = createDateFromString(dateString);
      
      // Debug logging
      console.log('Selected date string:', dateString);
      console.log('Created date:', selectedDate);
      console.log('Day of week:', selectedDate.getDay());
      console.log('Is working day:', isWorkingDay(selectedDate));
      
      if (!isWorkingDay(selectedDate)) {
        setDateError('Service is only available Monday to Friday for working commuters');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleSearch = async () => {
    if (searchForm.from && searchForm.to && searchForm.date && !dateError) {
      const selectedDate = createDateFromString(searchForm.date);

      if (!isWorkingDay(selectedDate)) {
        setDateError('Service is only available Monday to Friday for working commuters');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('from_location', searchForm.from)
          .eq('to_location', searchForm.to);

        if (error) throw error;

        if (data && data.length > 0) {
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

          setAvailableBuses(formattedRoutes);
          setSearchPerformed(true);
          setSearchResults(formattedRoutes);
        } else {
          setAvailableBuses([]);
          setSearchPerformed(true);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    }
  };

  const handleAddWalletFunds = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      setUserProfile({
        ...userProfile,
        walletBalance: userProfile.walletBalance + amount
      });
      setAddAmount('');
      setShowAddWallet(false);
    }
  };

  // Handle route click - automatically search for next working day
  const handleRouteClick = async (route: { from: string; to: string; display: string }) => {
    const nextWorkingDay = getNextWorkingDay();
    const nextWorkingDayString = formatDateForInput(nextWorkingDay);

    // Update search form with selected route and next working day
    setSearchForm({
      from: route.from,
      to: route.to,
      date: nextWorkingDayString
    });

    // Clear any existing date errors
    setDateError('');

    // Fetch routes from Supabase
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('from_location', route.from)
        .eq('to_location', route.to);

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedRoutes: Route[] = data.map((r: any) => ({
          id: r.id,
          from: r.from_location,
          to: r.to_location,
          duration: r.duration,
          price: r.price,
          departureTime: r.departure_time,
          arrivalTime: r.arrival_time,
          availableSeats: r.available_seats
        }));

        setAvailableBuses(formattedRoutes);
        setSearchPerformed(true);
        setSearchResults(formattedRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const handleBottomNavigation = (screen: string) => {
    onNavigate(screen);
  };

  return (
    <div className="bg-[#f0f1f3] flex flex-row justify-center w-full">
      <div className="bg-[#f0f1f3] overflow-x-hidden w-full max-w-md min-h-screen relative pb-24">
        {/* Header Section */}
        <div className="relative w-full h-[463px]">
          <div className="absolute w-full h-[249px] top-0 left-0 bg-[#f0f1f3]" />
          <div className="absolute w-full h-[230px] top-0 left-0 bg-oxford-blue" />

          {/* Status Bar */}
          <div className="absolute w-full h-10 top-0 left-0 px-2 z-50">
            <div className="relative h-10 bg-[url(/fill-17.svg)] bg-[100%_100%]">
              {/* Network Signal - CSS bars */}
              <div className="absolute top-[14px] right-[76px] flex space-x-0.5 items-end">
                <div className="w-1 h-2 bg-white rounded-sm"></div>
                <div className="w-1 h-2.5 bg-white rounded-sm"></div>
                <div className="w-1 h-3 bg-white rounded-sm"></div>
                <div className="w-1 h-3.5 bg-white rounded-sm"></div>
              </div>

              {/* WiFi Icon - CSS curved lines */}
              <div className="absolute top-[14px] right-[53px] w-4 h-3.5">
                <div className="absolute inset-0 flex items-end justify-center">
                  <div className="relative w-full h-full">
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2.5 h-1.5 border-t-2 border-white rounded-t-full"></div>
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-4 h-2 border-t-2 border-white rounded-t-full"></div>
                  </div>
                </div>
              </div>

              {/* Battery Icon - CSS rectangle with fill */}
              <div className="absolute top-[14px] right-[24px] w-[25px] h-[11px]">
                <div className="relative w-full h-full">
                  {/* Battery outline */}
                  <div className="absolute top-0 left-0 w-[22px] h-[11px] border border-white rounded-sm bg-transparent"></div>
                  {/* Battery fill - dynamic based on battery level */}
                  <div
                    className="absolute top-[1px] left-[1px] h-[9px] bg-white rounded-sm transition-all duration-300"
                    style={{
                      width: `${Math.max(1, (batteryLevel / 100) * 20)}px`,
                      backgroundColor: batteryLevel <= 20 ? '#ef4444' : 'white'
                    }}
                  ></div>
                  {/* Battery tip */}
                  <div className="absolute top-[3px] right-0 w-[2px] h-[5px] bg-white rounded-r-sm"></div>
                </div>
              </div>

              <div className="absolute top-[13px] left-[24px] [font-family:'Satoshi-Italic',Helvetica] font-normal italic text-white text-[15px] tracking-[0.07px] leading-[normal]">
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div className="absolute h-6 top-16 left-4 sm:left-10 [font-family:'Lato',Helvetica] font-bold text-white text-2xl tracking-[0] leading-6 whitespace-nowrap">
            Hi, {userProfile.fullName.split(' ')[0]}
          </div>
          <div className="absolute w-[158px] h-3.5 top-[94px] left-4 sm:left-10 [font-family:'Lato',Helvetica] font-bold text-white text-xs tracking-[0] leading-6 whitespace-nowrap">
            Where are you going to?
          </div>

          {/* Search Form Card */}
          <Card className="absolute w-[calc(100%-2rem)] max-w-[313px] h-[329px] top-[134px] left-4 sm:left-10 rounded-xl shadow-elevation-2 z-20 overflow-visible">
            <CardContent className="p-0 overflow-visible">
              <div className="relative w-[calc(100%-2rem)] max-w-[264px] h-[260px] mx-auto mt-[31px]">
                {/* From Field with Suggestions */}
                <div className="absolute w-full h-[50px] top-0 left-0 z-30">
                  <InputWithSuggestions
                    value={searchForm.from}
                    onChange={(value) => {
                      setSearchForm(prev => ({ ...prev, from: value }));
                      setSearchPerformed(false);
                      setAvailableBuses([]);
                    }}
                    placeholder="From"
                    suggestions={locationSuggestions}
                    className="h-[52px] pl-16 bg-white-100 border-[#6373811a] w-full"
                  />
                  <MapPin className="absolute w-5 h-5 top-[14px] left-4 text-gray-500 pointer-events-none z-10" />
                </div>

                {/* To Field with Suggestions */}
                <div className="absolute w-full h-[50px] top-[70px] left-0 z-30">
                  <InputWithSuggestions
                    value={searchForm.to}
                    onChange={(value) => {
                      setSearchForm(prev => ({ ...prev, to: value }));
                      setSearchPerformed(false);
                      setAvailableBuses([]);
                    }}
                    placeholder="To"
                    suggestions={locationSuggestions}
                    className="h-[52px] pl-16 bg-white-100 border-[#6373811a] w-full"
                  />
                  <MapPin className="absolute w-5 h-5 top-[14px] left-4 text-red-500 pointer-events-none z-10" />
                </div>

                {/* Swap Direction Icon */}
                <button className="absolute w-8 h-8 top-[42px] right-4 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
                  <ArrowUpDown size={16} className="text-oxford-blue" />
                </button>

                {/* Date Field */}
                <div className="absolute w-full h-[50px] top-[140px] left-0 z-10">
                  <Input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={formatDateForInput(new Date())}
                    className={`h-[52px] pl-16 bg-white-100 border-[#6373811a] ${
                      dateError ? 'border-red-500' : ''
                    } w-full`}
                  />
                  <CalendarIcon className="absolute w-6 h-6 top-[13px] left-4 pointer-events-none z-10" />
                  {dateError && (
                    <div className="absolute top-[54px] left-0 text-red-500 text-xs z-10">
                      {dateError}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={!searchForm.from || !searchForm.to || !searchForm.date || !!dateError}
                  className="absolute w-full h-[50px] top-[210px] left-0 bg-oxford-blue rounded-sm hover:bg-oxford-blue/90 disabled:bg-gray-400 z-10"
                >
                  <span className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-white-100 text-base tracking-[0] leading-6 whitespace-nowrap">
                    Search Route
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Container with proper spacing */}
        <div className="relative w-[calc(100%-2rem)] max-w-[313px] left-4 sm:left-[43px] mt-4 flex flex-col space-y-4 z-10">
          {/* Quick Actions for Hybrid Workers - Reduced size with compact layout */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 w-full">
            <CardContent className="p-3 flex flex-col space-y-2">
              <h3 className="font-semibold text-green-800 text-sm">Hybrid Worker?</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Book multiple days at once and save! Perfect for flexible schedules.
              </p>
              <Button
                onClick={() => onNavigate('hybrid-booking')}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 mt-1"
              >
                Book Multiple Days
              </Button>
            </CardContent>
          </Card>

          {/* Available Buses Section - Only visible after search */}
          {searchPerformed && availableBuses.length > 0 && (
            <Card className="bg-pure-white w-full">
              <CardContent className="p-4">
                <h3 className="[font-family:'Lato',Helvetica] font-bold text-oxford-blue text-sm mb-3">
                  Available Buses
                </h3>
                <div className="space-y-2">
                  {availableBuses.map((bus) => (
                    <button
                      key={bus.id}
                      onClick={() => {
                        setSearchResults([bus]);
                        onNavigate('search-results');
                      }}
                      className="w-full p-3 rounded border border-gray-200 hover:border-oxford-blue hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-oxford-blue text-sm">
                          {bus.departureTime} - {bus.arrivalTime}
                        </div>
                        <div className="font-bold text-oxford-blue text-sm">
                          ₦{bus.price.toLocaleString('en-NG')}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        Duration: {bus.duration}
                      </div>
                      <div className="text-xs text-gray-500">
                        {bus.availableSeats} seats available
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accordion Sections - Now properly spaced below the banner */}
          <div className="w-full pb-4">
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem
                value="wallet"
                className="bg-pure-white rounded border-none"
              >
                <AccordionTrigger className="py-2.5 px-4 h-[37px]">
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-oxford-blue" />
                    <span className="[font-family:'Lato',Helvetica] font-medium text-oxford-blue text-xs tracking-[0] leading-4 whitespace-nowrap">
                      Wallet
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 pt-2 space-y-3">
                    <div className="bg-gradient-to-r from-oxford-blue to-prussian-blue rounded-lg p-4 text-white">
                      <div className="text-xs font-medium opacity-90 mb-1">Available Balance</div>
                      <div className="text-2xl font-bold">
                        ₦{userProfile.walletBalance.toLocaleString('en-NG')}
                      </div>
                    </div>
                    {showAddWallet ? (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="h-[40px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleAddWalletFunds}
                            disabled={!addAmount || parseFloat(addAmount) <= 0}
                            className="flex-1 h-[40px] bg-oxford-blue hover:bg-oxford-blue/90"
                          >
                            Add Funds
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAddWallet(false);
                              setAddAmount('');
                            }}
                            variant="outline"
                            className="flex-1 h-[40px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowAddWallet(true)}
                        className="w-full h-[40px] bg-oxford-blue hover:bg-oxford-blue/90 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        <span>Add Funds</span>
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="saved-routes"
                className="bg-pure-white rounded border-none"
              >
                <AccordionTrigger className="py-2.5 px-4 h-[37px]">
                  <span className="[font-family:'Lato',Helvetica] font-medium text-oxford-blue text-xs tracking-[0] leading-4 whitespace-nowrap">
                    Saved Routes
                  </span>
                </AccordionTrigger>
                <AccordionContent></AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="discover-routes"
                className="bg-pure-white rounded border-none"
              >
                <AccordionTrigger className="py-2.5 px-4 h-[37px]">
                  <span className="[font-family:'Lato',Helvetica] font-medium text-oxford-blue text-xs tracking-[0] leading-4 whitespace-nowrap">
                    Discover Our Routes (Mon-Fri)
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 pb-4 pt-2 space-y-1">
                    {routes.map((route, index) => (
                      <button
                        key={index}
                        onClick={() => handleRouteClick(route)}
                        className="w-full text-left p-2 rounded hover:bg-blue-50 transition-colors group"
                      >
                        <div className="[font-family:'Lato',Helvetica] font-medium text-prussian-blue text-xs tracking-[0] leading-4 group-hover:text-oxford-blue transition-colors">
                          {route.display}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to see available buses for next working day
                        </div>
                      </button>
                    ))}
                    <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                      * Service available Monday to Friday for working commuters
                    </div>
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      💡 Click any route to instantly search for tomorrow's buses!
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Bottom Navigation - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
          <BottomNavigation
            activeScreen="home"
            onNavigate={handleBottomNavigation}
            onHome={onHome}
          />
        </div>
      </div>
    </div>
  );
};