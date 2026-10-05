import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DFD SPORTS | Destination For Dreams — Custom Teamwear & Sports Equipment',
    template: '%s | DFD Sports',
  },
  description:
    'DFD Sports (Destination For Dreams) is a premier sports equipment supplier and custom sublimated teamwear manufacturer. Official supplier to sports academies, clubs, schools, and professional athletes across India.',
  keywords: [
    'DFD Sports',
    'Destination For Dreams',
    'Custom Sports Jerseys India',
    'Custom Football Kit Manufacturer',
    'Cricket Teamwear Equipment',
    'Badminton Gear',
    'Sports Equipment Wholesale India',
    'Sublimation Jersey Printing',
    'Academy Sports Uniforms',
  ],
  authors: [{ name: 'DFD SPORTS' }],
  creator: 'DFD SPORTS',
  metadataBase: new URL('https://dfdsports.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dfdsports.com',
    title: 'DFD SPORTS | Destination For Dreams',
    description:
      'Custom sublimated teamwear and premium sports equipment supplier for academies, clubs, and athletes.',
    siteName: 'DFD SPORTS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DFD SPORTS | Destination For Dreams',
    description:
      'Engineered for victory. Custom teamwear and high-performance equipment across India.',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jakarta.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#080A0F] text-[#F3F4F6] font-sans antialiased selection:bg-[#F5A623] selection:text-[#080A0F]">
        {children}
      </body>
    </html>
  );
}
