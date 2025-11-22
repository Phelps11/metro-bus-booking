import React, { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showStatusBar?: boolean;
  activeScreen?: string;
  onNavigate?: (screen: string) => void;
  onHome?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
  showStatusBar = true,
  activeScreen = "home",
  onNavigate,
  onHome
}) => {
  return (
    <div className="bg-[#f0f1f3] flex flex-row justify-center w-full min-h-screen">
      <div className="bg-[#f0f1f3] overflow-x-hidden w-full max-w-md min-h-screen relative">
        {/* Main Content */}
        <div className={`${showBottomNav ? 'pb-24' : 'pb-4'} relative z-10`}>
          {children}
        </div>

        {/* Bottom Navigation - Fixed positioning with proper z-index */}
        {showBottomNav && (
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50">
            <BottomNavigation
              activeScreen={activeScreen}
              onNavigate={onNavigate}
              onHome={onHome}
            />
          </div>
        )}
      </div>
    </div>
  );
};