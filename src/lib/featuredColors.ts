// Pure data — no Node.js imports, safe for both server and client bundles.
export interface FeaturedColorOption {
  id: string;
  name: string;
  description: string;
  sectionBg: string;
  stageBg: string;
  cardBg: string;
  swatch: string;
}

export const FEATURED_BG_COLORS: FeaturedColorOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Black',
    description: 'Classic midnight dark luxury',
    sectionBg: '#06080C',
    stageBg: '#0E121B',
    cardBg: '#141923',
    swatch: '#06080C',
  },
  {
    id: 'navy',
    name: 'Midnight Navy',
    description: 'Elite royal navy sports tone',
    sectionBg: '#060B17',
    stageBg: '#0C1527',
    cardBg: '#121E36',
    swatch: '#060B17',
  },
  {
    id: 'carbon',
    name: 'Carbon Amber',
    description: 'Warm gold-accented carbon tone',
    sectionBg: '#120E08',
    stageBg: '#1D170D',
    cardBg: '#282013',
    swatch: '#120E08',
  },
  {
    id: 'plum',
    name: 'Royal Velvet',
    description: 'Distinctive dark violet atmosphere',
    sectionBg: '#110717',
    stageBg: '#1C0D26',
    cardBg: '#271335',
    swatch: '#110717',
  },
  {
    id: 'emerald',
    name: 'Emerald Shadow',
    description: 'Pitch forest green deep shadow',
    sectionBg: '#06130D',
    stageBg: '#0C2016',
    cardBg: '#122D20',
    swatch: '#06130D',
  },
  {
    id: 'crimson',
    name: 'Crimson Shadow',
    description: 'Intense red sports energy glow',
    sectionBg: '#140608',
    stageBg: '#210C0F',
    cardBg: '#2E1217',
    swatch: '#140608',
  },
  {
    id: 'graphite',
    name: 'Slate Graphite',
    description: 'Contemporary steel charcoal',
    sectionBg: '#0C0E14',
    stageBg: '#141720',
    cardBg: '#1C212D',
    swatch: '#0C0E14',
  },
];
