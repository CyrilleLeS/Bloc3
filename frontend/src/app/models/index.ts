// User
export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'hotelier' | 'admin';
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Hotel
export interface Address {
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

export interface Hotel {
  _id: string;
  name: string;
  description: string;
  address: Address;
  images: string[];
  amenities: string[];
  stars: number;
  rating: number;
  price?: number; // Prix indicatif "à partir de"
  totalReviews: number;
  owner: User | string;
  isActive: boolean;
  createdAt: string;
  rooms?: Room[];
}

// Room
export interface Capacity {
  adults: number;
  children: number;
}

export interface Room {
  _id: string;
  hotel: Hotel | string;
  name: string;
  description?: string;
  type: 'simple' | 'double' | 'twin' | 'suite' | 'familiale' | 'deluxe';
  price: number;
  capacity: Capacity;
  size?: number;
  bedType?: string;
  images: string[];
  amenities: string[];
  quantity: number;
  isAvailable: boolean;
  createdAt: string;
}

// Booking
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Booking {
  _id: string;
  user: User | string;
  hotel: Hotel | string;
  room: Room | string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: Capacity;
  roomPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  specialRequests?: string;
  guestInfo: GuestInfo;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface HotelsResponse extends ApiResponse<Hotel[]> {
  hotels: Hotel[];
}

export interface RoomsResponse extends ApiResponse<Room[]> {
  rooms: Room[];
}

export interface BookingsResponse extends ApiResponse<Booking[]> {
  bookings: Booking[];
}

export interface UsersResponse extends ApiResponse<User[]> {
  users: User[];
}

// Dashboard Stats
export interface DashboardStats {
  users: {
    total: number;
    clients: number;
    hoteliers: number;
    newThisMonth: number;
  };
  hotels: {
    total: number;
    active: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
  };
}