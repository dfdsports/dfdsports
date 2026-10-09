import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Preloader } from '@/components/ui/Preloader';

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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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
  alternates: {
    canonical: 'https://dfdsports.com',
  },
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
  verification: {
    google: 'ada9scEB1Mhb2YgS4Ywpso9ftoye_htPvkMFMj7w0U8',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DFD Sports',
  alternateName: 'Destination For Dreams',
  url: 'https://dfdsports.com',
  logo: 'https://dfdsports.com/logo.png',
  description:
    'Premier sports equipment supplier and custom sublimated teamwear manufacturer across India.',
  sameAs: [
    'https://www.instagram.com',
    'https://www.facebook.com',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DFD Sports',
  url: 'https://dfdsports.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://dfdsports.com/collections?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
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
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=rowan@400,500,600,700&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (sessionStorage.getItem('dfd_preloader_completed') === 'true' && !window.location.search.includes('preloader=1') && !window.location.search.includes('intro=1')) {
                  document.documentElement.classList.add('preloader-skipped');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[#080A0F] text-[#F3F4F6] font-sans antialiased selection:bg-[#F5A623] selection:text-[#080A0F]"
        suppressHydrationWarning
      >
        <Preloader />
        {children}
      </body>
    </html>
  );
}
