// src/types/index.ts

// Auth Types
export interface UserMetadata {
  first_name: string;
  last_name: string;
  phone?: string;
  role: "customer" | "organizer" | "admin";
  organization_id?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

// Profile Types
export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role: "customer" | "organizer" | "admin";
  created_at: string;
  updated_at?: string;
  organization_id?: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  tax_id?: string;
  status: "pending" | "active" | "suspended";
  created_at: string;
  updated_at?: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "staff" | "scanner";
  created_at: string;
}

// Event Types
export interface Event {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  location: string;
  address?: string;
  city: string;
  start_date: string;
  end_date?: string;
  image_url?: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "on_sale"
    | "sold_out"
    | "cancelled";
  created_at: string;
  updated_at?: string;
  organizations?: Organization;
}

// Ticket Types
export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  status: "active" | "inactive" | "sold_out";
  created_at: string;
  updated_at?: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  ticket_type_id: string;
  ticket_number: string;
  seat_number?: string;
  status: "valid" | "used" | "cancelled";
  created_at: string;
  updated_at?: string;
  ticket_types?: TicketType;
  orders?: Order;
  events?: Event;
}

// Order Types
export interface Order {
  id: string;
  user_id: string;
  event_id: string;
  order_number: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  subtotal: number;
  tax?: number;
  total: number;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at?: string;
  events?: Event;
  tickets?: Ticket[];
}

// Seating Map Types
export interface SeatingMap {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  venue_name: string;
  map_data: any; // This will contain the JSON structure for the seating map
  status: "draft" | "pending_approval" | "approved";
  created_at: string;
  updated_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface OrganizerRegisterFormData extends RegisterFormData {
  organizationName: string;
  organizationEmail: string;
  organizationPhone?: string;
  taxId?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
