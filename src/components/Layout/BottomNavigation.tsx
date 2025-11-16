import React from 'react';
import { Home, Calendar, Compass, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  screen: string;
}

const navItems: NavItem[] = [
  { name: "Home", icon: Home, screen: "home" },
  { name: "My trips", icon: Calendar, screen: "trips" },
  { name: "Discover", icon: Compass, screen: "discover" },
  { name: "Profile", icon: User, screen: "profile" },
];

interface BottomNavigationProps {
  activeScreen?: string;
  onNavigate?: (screen: string) => void;
  onHome?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeScreen = "home", 
  onNavigate,
  onHome
}) => {
  const handleNavigation = (screen: string) => {
    if (screen === 'home' && onHome) {
      onHome();
    } else if (onNavigate) {
      onNavigate(screen);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[81px] z-50">
      {/* Background container with proper z-index */}
      <div className="absolute top-2.5 left-2.5 right-2.5 bottom-2.5">
        <div className="w-full h-[61px] bg-white rounded-[30px] shadow-[0px_4px_10px_#00000033]" />
      </div>

      {/* Navigation Items - positioned above background */}
      <div className="flex justify-around items-center absolute inset-x-2.5 top-4 bottom-4 z-10 bg-transparent">
        {navItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center relative z-20 h-full"
            onClick={() => handleNavigation(item.screen)}
          >
            <div className={`w-6 h-6 rounded-xl border-[0.5px] border-solid flex items-center justify-center ${
              activeScreen === item.screen 
                ? 'border-oxford-blue bg-oxford-blue' 
                : 'border-[#0d0d0d]'
            }`}>
              <item.icon
                size={14}
                className={activeScreen === item.screen ? 'text-white' : 'text-gray-700'}
              />
            </div>
            <div className={`mt-0.5 [font-family:'Gilroy-Medium',Helvetica] font-medium text-[10px] text-center tracking-[0] leading-tight whitespace-nowrap ${
              activeScreen === item.screen ? 'text-oxford-blue' : 'text-neutral-800'
            }`}>
              {item.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};