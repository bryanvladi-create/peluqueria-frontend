export interface SiteSettings {
  id: string;
  business_name: string;
  whatsapp_number: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  address_text: string | null;
  map_embed_url: string | null;
  show_testimonials: boolean;
  city: string | null;
  opening_hours: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  hero_eyebrow: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_image_position: string | null;
  updated_at: string;
}

export interface ServiceImage {
  id: string;
  image_url: string;
}

export interface Service {
  id: string;
  name: string;
  short_description: string | null;
  detailed_description: string | null;
  benefits: string[];
  is_active: boolean;
  images: ServiceImage[];
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePayload {
  name?: string;
  short_description?: string;
  detailed_description?: string;
  benefits?: string[];
  is_active?: boolean;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  service_id: string | null;
  service_name?: string | null;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
}

export interface Stats {
  services_active: number;
  services_inactive: number;
  gallery_total: number;
  promotions_active: number;
  promotions_inactive: number;
  testimonials_active: number;
  testimonials_section_on: boolean;
  appointments_pending: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: { id: string; username: string; email: string };
}