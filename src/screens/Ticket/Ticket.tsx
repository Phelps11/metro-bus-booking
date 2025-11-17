import React from 'react';
import { ArrowLeft, Download, Share, Car, User as DriverIcon } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Ticket as TicketType } from '../../types';
import { createDateFromString } from '../../utils/dateUtils';

interface TicketProps {
  ticket: TicketType;
  onBack: () => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const Ticket: React.FC<TicketProps> = ({ ticket, onBack, onHome, onNavigate }) => {
  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="ticket"
      onNavigate={onNavigate}
      onHome={onHome}
    >
      {/* Header - Using flexbox auto layout */}
      <div className="bg-oxford-blue flex flex-col relative min-h-[120px]">
        {/* Top section with navigation and title */}
        <div className="flex items-center justify-center pt-16 pb-4 relative">
          <button 
            onClick={onBack}
            className="absolute left-4 text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <h1 className="[font-family:'Lato',Helvetica] font-bold text-white text-xl">
            Your Ticket
          </h1>

          <div className="absolute right-4 flex space-x-2">
            <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Share size={20} />
            </button>
            <button className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Download size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content with proper spacing */}
      <div className="px-4 py-4 space-y-4">
        {/* Main Ticket */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* Ticket Header with auto layout */}
            <div className="bg-gradient-to-r from-oxford-blue to-prussian-blue p-6 text-white">
              <div className="flex flex-col items-center space-y-4">
                {/* Title only - status removed */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Metro Bus</h2>
                </div>

                {/* Bus Details Section with auto layout and proper spacing */}
                <div className="w-full bg-white/10 rounded-lg p-5 space-y-4">
                  {/* Header with icon and title - auto spaced */}
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Car size={20} />
                    <span className="font-semibold text-base tracking-wide">Bus Details</span>
                  </div>
                  
                  {/* Details grid with auto layout and consistent spacing */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-white/70 text-xs tracking-wide">Vehicle</div>
                      <div className="font-medium text-base tracking-wide">Toyota Hiace</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/70 text-xs tracking-wide">Colour</div>
                      <div className="font-medium text-base tracking-wide">White</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/70 text-xs tracking-wide">License Plate</div>
                      <div className="font-medium text-base tracking-widest font-mono">AKD 111 MB</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white/70 text-xs tracking-wide">Driver</div>
                      <div className="font-medium text-base flex items-center space-x-2">
                        <DriverIcon size={16} />
                        <span className="tracking-wide">Taye</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details with auto layout */}
            <div className="p-6 space-y-4">
              {/* Time and Date Section */}
              <div className="text-center">
                <div className="text-3xl font-bold text-oxford-blue mb-2">
                  {ticket.boardingTime}
                </div>
                <div className="text-lg text-gray-600">
                  {createDateFromString(ticket.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Trip Details */}
              <div className="border-t border-b border-dashed border-gray-300 py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route</span>
                  <span className="font-medium">{ticket.route}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Passenger</span>
                  <span className="font-medium">{ticket.passengerName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Boarding Point</span>
                  <span className="font-medium">{ticket.boardingPoint}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Deboarding Point</span>
                  <span className="font-medium">Lekki Phase 1</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Number</span>
                  <span className="font-medium font-mono">{ticket.ticketNumber}</span>
                </div>
              </div>

              {/* Barcode Section */}
              <div className="text-center py-4">
                <div className="inline-block bg-gray-100 p-4 rounded">
                  <div className="font-mono text-xs text-gray-600 mb-2">
                    Scan at boarding
                  </div>
                  {/* Simulated barcode */}
                  <div className="flex space-x-px justify-center">
                    {Array.from({ length: 40 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1 ${
                          Math.random() > 0.5 ? 'h-8 bg-black' : 'h-6 bg-black'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="font-mono text-xs mt-2 text-gray-600">
                    {ticket.barcode}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Please arrive at the boarding point 15 minutes early</li>
              <li>• Have this ticket ready for scanning</li>
              <li>• Contact support for any changes or cancellations</li>
              <li>• Keep your phone charged for ticket verification</li>
              <li>• Look for the white Toyota Hiace with license plate AKD 111 MB</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons with auto layout */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <Button variant="outline" className="py-3">
            Contact Support
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 py-3">
            Track Bus
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};