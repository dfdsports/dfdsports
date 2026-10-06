import 'server-only';
import fs from 'fs';
import path from 'path';
import { FeaturedColorOption, FEATURED_BG_COLORS } from '@/lib/featuredColors';

export type { FeaturedColorOption };
export { FEATURED_BG_COLORS };

export interface FeaturedSettings {
  colorId: string;
  color: FeaturedColorOption;
  /** Per-card color override: productId → colorId from FEATURED_BG_COLORS */
  cardColors: Record<string, string>;
}

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'featured-settings.json');

export function getFeaturedSettings(): FeaturedSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const data = JSON.parse(content);
      const matched = FEATURED_BG_COLORS.find((c) => c.id === data.colorId);
      return {
        colorId: matched?.id ?? FEATURED_BG_COLORS[0].id,
        color: matched ?? FEATURED_BG_COLORS[0],
        cardColors: data.cardColors ?? {},
      };
    }
  } catch (err) {
    console.warn('Error reading featured settings:', err);
  }

  const fallback = FEATURED_BG_COLORS[0];
  return { colorId: fallback.id, color: fallback, cardColors: {} };
}

export function saveFeaturedSettings(
  colorId: string,
  cardColors: Record<string, string> = {}
): FeaturedSettings {
  const matched = FEATURED_BG_COLORS.find((c) => c.id === colorId) || FEATURED_BG_COLORS[0];
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify({ colorId: matched.id, cardColors }, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.warn('Error saving featured settings:', err);
  }
  return { colorId: matched.id, color: matched, cardColors };
}
