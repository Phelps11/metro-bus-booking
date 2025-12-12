export interface Route {
  id: string;
  from: string;
  to: string;
  duration: string;
  price: number;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  boardingPoint?: string;
  deboardingPoint?: string;
  totalStops?: number;
  stops?: string[];
}

export interface PassengerDetails {
  name: string;
  age: string;
  gender: string;
  email: string;
  phoneNumber: string;
  boardingPoint: string;
  deboardingPoint: string;
  subscribeToUpdates: boolean;
  receiveAlerts: boolean;
}

export interface BookingDetails {
  route: Route;
  passenger: PassengerDetails;
  boardingPoint: string;
  deboardingPoint: string;
  date: string;
  totalFare: number;
  isSubscription?: boolean;
  subscriptionData?: {
    durationWeeks: number;
    startDate: string;
    endDate: string;
  };
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  route: string;
  boardingTime: string;
  boardingPoint: string;
  deboardingPoint: string;
  date: string;
  status: 'confirmed' | 'delayed' | 'cancelled';
  delayMinutes?: number;
  barcode: string;
}

export interface UserProfile {
  fullName: string;
  phoneNumber: string;
  email: string;
  emergencyContact: string;
  preferredRoutes: string[];
  subscriptions: RouteSubscription[];
  walletBalance: number;
}

export interface RouteSubscription {
  id: string;
  route: string;
  duration: number; // weeks
  startDate: string;
  endDate: string;
  discount: number;
  isActive: boolean;
}