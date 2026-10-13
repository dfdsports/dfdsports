import fs from 'fs';
import path from 'path';
import { DualBannersSettings, DEFAULT_DUAL_BANNERS_SETTINGS } from '@/types/dualBanners';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'dual-banners.json');

export async function getDualBannersSettings(): Promise<DualBannersSettings> {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        left_banner: {
          ...DEFAULT_DUAL_BANNERS_SETTINGS.left_banner,
          ...(data.left_banner || {}),
        },
        right_banner: {
          ...DEFAULT_DUAL_BANNERS_SETTINGS.right_banner,
          ...(data.right_banner || {}),
        },
        is_active: data.is_active ?? true,
        updated_at: data.updated_at,
      };
    }
  } catch (err) {
    console.warn('Error reading dual banners settings:', err);
  }

  return DEFAULT_DUAL_BANNERS_SETTINGS;
}

export async function saveDualBannersSettings(
  settings: DualBannersSettings
): Promise<DualBannersSettings> {
  const updatedData: DualBannersSettings = {
    left_banner: {
      ...DEFAULT_DUAL_BANNERS_SETTINGS.left_banner,
      ...(settings.left_banner || {}),
    },
    right_banner: {
      ...DEFAULT_DUAL_BANNERS_SETTINGS.right_banner,
      ...(settings.right_banner || {}),
      link: settings.right_banner?.link || '/custom-jerseys',
    },
    is_active: settings.is_active ?? true,
    updated_at: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving dual banners settings:', err);
    throw new Error('Failed to save dual banner settings to file.');
  }

  return updatedData;
}
