// src/types/index.ts

export interface Organization {
  id: string;
  name: string;
  cif: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: "pending" | "approved" | "rejected";
  logo_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending" | "suspended";
  invited_at: string;
  joined_at?: string;
}
