// User & Authentication
export interface User {
  id: string;
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'landlord' | 'manager' | 'agent' | 'tenant' | 'technician' | 'admin';
  profile_photo?: string;
  company_name?: string;
  created_at: string;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterData {
  phone_number: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  password: string;
  password_confirm: string;
  company_name?: string;
}

// Organization
export interface Organization {
  id: string;
  name: string;
  owner: User;
  subscription_plan: string;
  member_count: number;
  created_at: string;
}

// Property
export type PropertyType = 'apartment_block' | 'estate' | 'commercial' | 'mixed_use' | 'single_unit' | 'townhouse';

export interface Property {
  id: string;
  organization: string;
  name: string;
  property_type: PropertyType;
  description?: string;
  address: string;
  city: string;
  county: string;
  country: string;
  postal_code?: string;
  total_units: number;
  year_built?: number;
  amenities: string[];
  bank_account?: string;
  mpesa_paybill?: string;
  mpesa_till?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields from API
  units_count?: number;
  occupied_units?: number;
  vacancy_rate?: number;
  photos?: any[];
  units?: Unit[];
}

// Unit
export type UnitType = 'bedsitter' | '1_bedroom' | '2_bedroom' | '3_bedroom' | '4_bedroom' | 'shop' | 'office' | 'warehouse' | 'studio' | 'penthouse';
export type UnitStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance' | 'airbnb';

export interface Unit {
  id: string;
  property: string;
  property_name?: string;
  unit_number: string;
  unit_type: UnitType;
  floor: number;
  size_sqm?: number;
  description?: string;
  monthly_rent: number;
  deposit_amount: number;
  status: UnitStatus;
  is_furnished: boolean;
  amenities: string[];
  airbnb_enabled: boolean;
  airbnb_daily_rate?: number;
  airbnb_cleaning_fee?: number;
  is_available?: boolean;
  photos?: any[];
  created_at: string;
  updated_at: string;
}

// API Response
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Dashboard
export interface DashboardMetrics {
  total_units: number;
  occupied_units: number;
  occupancy_rate: number;
  expected_rent: number;
  collected_rent: number;
  collection_rate: number;
  outstanding_rent: number;
  open_tickets: number;
  active_bookings: number;
}
