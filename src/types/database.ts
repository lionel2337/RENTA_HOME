export interface User {
  uid: string;
  name: string;
  firstName: string;
  email: string;
  avatarUrl: string;
  city: string;
  address: string;
  phone: string;
  role: 'tenant' | 'landlord';
  privacyAccepted: boolean;
}

export interface Listing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  price: number;
  category: 'villas' | 'chalets' | 'appartements' | 'chambres' | 'hotels' | 'motels';
  city: string;
  neighborhood: string;
  imageUrls: string[];
  amenities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  propertyCode: string; // Code de liaison
  rating: number;
  reviewsCount: number;
}

export interface Tenancy {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  tenantMatricule: string;
  startDate: string;
  endDate: string;
  paymentStatus: 'paid' | 'late' | 'pending';
  monthlyRent: number;
}

export interface Request {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  type: 'visit' | 'rental';
  status: 'pending' | 'approved' | 'rejected';
  suggestedDate?: string;
  message: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  tenantId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AiReminder {
  id: string;
  tenancyId: string;
  landlordId: string;
  tenantId: string;
  suggestedMessage: string;
  status: 'draft' | 'approved' | 'modified';
  dueDate: string;
}
