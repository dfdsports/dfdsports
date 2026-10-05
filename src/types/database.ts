export interface CompanySettings {
  id: string;
  company_name: string;
  full_name: string;
  tagline: string | null;
  short_description: string | null;
  about_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email: string | null;
  address: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  twitter_url: string | null;
  business_hours: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string | null;
  heading: string;
  highlight_text: string | null;
  description: string | null;
  primary_cta_text: string | null;
  primary_cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  image_url: string | null;
  mobile_image_url: string | null;
  badge_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand_id: string | null;
  short_description: string | null;
  long_description: string | null;
  image_url: string | null;
  images: string[];
  specifications: Record<string, string>;
  sizes: string[];
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Category | null;
  brand?: Brand | null;
}

export interface Teamwear {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  gallery_images: string[];
  colors: string[];
  sizes: string[];
  fabric_options: string[];
  customization_options: string[];
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Fabric {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  specifications: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WhyChooseUs {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Highlight {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Enquiry {
  id: string;
  enquiry_type: 'product' | 'custom_jersey' | 'general';
  name: string;
  phone: string;
  email: string | null;
  product_name: string | null;
  product_id: string | null;
  quantity: string | null;
  size_or_requirement: string | null;
  customization_details: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'completed' | 'archived';
  created_at: string;
  updated_at?: string;
}
