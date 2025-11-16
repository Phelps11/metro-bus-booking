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
        {/* Status Bar */}
        {showStatusBar && (
        <div className="absolute w-full h-10 top-0 left-0 px-2 z-50">
          <div className="relative h-10 bg-[url(/fill-17.svg)] bg-[100%_100%]">
            {/* Network Signal - CSS bars */}
            <div className="absolute top-[18px] right-[76px] flex space-x-0.5">
              <div className="w-1 h-2 bg-white rounded-sm"></div>
              <div className="w-1 h-2.5 bg-white rounded-sm"></div>
              <div className="w-1 h-3 bg-white rounded-sm"></div>
              <div className="w-1 h-3.5 bg-white rounded-sm"></div>
            </div>
            
            {/* WiFi Icon - CSS curved lines */}
            <div className="absolute top-[18px] right-[53px] w-4 h-3">
              <div className="absolute inset-0">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-1 border-t-2 border-white rounded-t-full"></div>
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-1.5 border-t-2 border-white rounded-t-full"></div>
              </div>
            </div>
            
            {/* Battery Icon - CSS rectangle with fill */}
            <div className="absolute top-[18px] right-[24px] w-[25px] h-[11px]">
              <div className="relative w-full h-full">
                {/* Battery outline */}
                <div className="absolute top-0 left-0 w-[22px] h-[11px] border border-white rounded-sm bg-transparent"></div>
                {/* Battery fill (80% charged) */}
                <div className="absolute top-[1px] left-[1px] w-[17px] h-[9px] bg-white rounded-sm"></div>
                {/* Battery tip */}
                <div className="absolute top-[3px] right-0 w-[2px] h-[5px] bg-white rounded-r-sm"></div>
              </div>
            </div>
            
            <div className="absolute top-[13px] left-[24px] [font-family:'Satoshi-Italic',Helvetica] font-normal italic text-white text-[15px] tracking-[0.07px] leading-[normal]">
              9:41
            </div>
          </div>
        </div>
        )}

        {/* Main Content - Added proper padding bottom to prevent overlap */}
        <div className={`${showStatusBar ? 'pt-10' : 'pt-0'} ${showBottomNav ? 'pb-24' : 'pb-4'} relative z-10`}>
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