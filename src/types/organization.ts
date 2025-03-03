// src/types/organization.ts
export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  tax_id: string;
  status: "pending" | "active" | "suspended";
  created_at: string;
  created_by: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "admin" | "manager" | "staff";
  created_at: string;
}

export interface SeatingMap {
  id: string;
  name: string;
  organization_id: string;
  venue_name: string;
  description?: string;
  rows: number;
  columns: number;
  map_data: unknown; // Este debería ser un JSON con la disposición de asientos
  created_at: string;
  created_by: string;
  status: "draft" | "pending_approval" | "approved" | "rejected";
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  location: string;
  address?: string;
  city: string;
  start_date: string;
  end_date?: string;
  image_url?: string;
  seating_map_id?: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "on_sale"
    | "sold_out"
    | "cancelled";
  created_at: string;
  created_by: string;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  max_per_order?: number;
  start_sale_date?: string;
  end_sale_date?: string;
}
