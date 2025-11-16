import React from 'react';
import { ArrowLeft, Download, Share, Clock, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Ticket } from '../../types';

interface HybridTicketsProps {
  tickets: Ticket[];
  onBack: () => void;
  onHome?: () => void;
  onNavigate?: (screen: string) => void;
}

export const HybridTickets: React.FC<HybridTicketsProps> = ({ tickets, onBack, onHome, onNavigate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'delayed': return 'text-orange-600 bg-orange-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string, delayMinutes?: number) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'delayed': return `Delayed by ${delayMinutes} mins`;
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const upcomingTickets = tickets.filter(ticket => new Date(ticket.date) >= new Date());
  const pastTickets = tickets.filter(ticket => new Date(ticket.date) < new Date());

  return (
    <MobileLayout
      showBottomNav={true}
      activeScreen="hybrid-tickets"
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
            Your Hybrid Tickets
          </h1>
        </div>

        <div className="absolute top-16 right-4 flex space-x-2">
          <button className="text-white p-2">
            <Share size={20} />
          </button>
          <button className="text-white p-2">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="text-purple-600" size={24} />
              <div>
                <h3 className="font-semibold text-purple-800">Hybrid Booking Complete!</h3>
                <p className="text-sm text-purple-700">
                  {tickets.length} tickets generated for your selected working days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tickets */}
        {upcomingTickets.length > 0 && (
          <>
            <h3 className="font-semibold text-oxford-blue">Upcoming Trips</h3>
            {upcomingTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-oxford-blue to-prussian-blue p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg">Metro Bus</h4>
                        <div className="text-sm opacity-90">Hybrid Ticket</div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        <Clock size={14} className="mr-1" />
                        {getStatusText(ticket.status, ticket.delayMinutes)}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold text-oxford-blue">
                          {ticket.boardingTime}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(ticket.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm text-gray-600">
                          {ticket.ticketNumber}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route</span>
                        <span className="font-medium">{ticket.route}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boarding</span>
                        <span className="font-medium">{ticket.boardingPoint}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Destination</span>
                        <span className="font-medium">{ticket.deboardingPoint}</span>
                      </div>
                    </div>

                    {/* Mini Barcode */}
                    <div className="text-center py-2">
                      <div className="inline-block bg-gray-100 p-2 rounded">
                        <div className="flex space-x-px">
                          {Array.from({ length: 20 }, (_, i) => (
                            <div
                              key={i}
                              className={`w-0.5 ${
                                Math.random() > 0.5 ? 'h-4 bg-black' : 'h-3 bg-black'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* Past Tickets */}
        {pastTickets.length > 0 && (
          <>
            <h3 className="font-semibold text-gray-600 mt-6">Past Trips</h3>
            {pastTickets.map((ticket) => (
              <Card key={ticket.id} className="bg-gray-50 shadow-sm opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-700">{ticket.route}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(ticket.date).toLocaleDateString()} • {ticket.boardingTime}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* Important Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Each ticket is valid for the specific date shown</li>
              <li>• Arrive at boarding point 15 minutes early</li>
              <li>• Have your ticket ready for scanning</li>
              <li>• Contact support for changes or cancellations</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <Button variant="outline" className="py-3">
            Contact Support
          </Button>
          <Button 
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 py-3"
          >
            Book More Days
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};