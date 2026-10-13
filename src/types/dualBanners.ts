export interface DualBannerItem {
  image_url: string;
  title?: string;
  subtitle?: string;
  link: string;
  category_id?: string;
  category_name?: string;
  product_id?: string;
  product_name?: string;
  badge?: string;
}

export interface DualBannersSettings {
  left_banner: DualBannerItem;
  right_banner: DualBannerItem;
  is_active: boolean;
  updated_at?: string;
}

export const DEFAULT_DUAL_BANNERS_SETTINGS: DualBannersSettings = {
  left_banner: {
    image_url: '',
    title: '',
    subtitle: '',
    link: '',
    category_id: '',
    category_name: '',
    product_id: '',
    product_name: '',
    badge: '',
  },
  right_banner: {
    image_url: '',
    title: '',
    subtitle: '',
    link: '/custom-jerseys',
    badge: '',
  },
  is_active: true,
};
