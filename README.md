# DFD SPORTS (Destination For Dreams)

A modern, production-grade web application and Admin CMS for **DFD SPORTS** — premier sports equipment supplier and custom sublimated teamwear manufacturer in India.

Built with **Next.js 15+ (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Storage, Auth)**.

---

## 🏆 Key Features

### 1. Public Storefront
- **Dynamic Sports Hero**: Multi-slide banner with live stats, headline typography, and one-click WhatsApp action.
- **"Shop The Game" Categories**: Quick browsing across Football, Cricket, Badminton, Volleyball, Basketball, and fitness gear with category slug routing.
- **Custom Teamwear Showcase & Interactive Builder**:
  - Front and back 360° angle toggle for mockups.
  - Live color palette selection with instant preview.
  - Fabric selector with GSM ratings and breathability specs.
  - Size selectors (XS to 3XL) and customizer checklist (Player Name, Number, Badges, Collar style).
  - One-click inquiry generator directing custom specs straight to WhatsApp and Supabase.
- **Fabric Collection**: Technical breakdown of athletic fabrics (Micro Polyester Interlock, Dot Knit, Jacquard Honeycomb, Poly-Spandex).
- **Brands We Supply**: Showcase of authentic partner equipment brands.
- **Why Choose Us**: Value proposition cards highlighting authentic gear, fast turnaround, and bulk academy pricing.
- **Product Catalog & Detail Pages**:
  - Image gallery with full zoom preview.
  - Technical specification tables and feature lists.
  - Related items carousel.
  - Dual action: "Enquire on WhatsApp" + "Request Quotation Form".
- **Contact & Academy Inquiries**:
  - Lead capture form sending structured entries into `public.enquiries`.
  - Direct WhatsApp links with pre-filled message parameters.

### 2. Admin Content Management System (CMS)
Accessible at `/admin` (protected by Supabase Auth and Next.js middleware):
- **Dashboard Overview**: Key metrics (total products, active categories, partner brands, pending enquiries) and quick actions.
- **Company Settings**: Live update company name, full form, phone, WhatsApp number, email, address, Google Maps URL, and social media handles.
- **Hero Banners CMS**: Manage banner slides, headlines, CTAs, display ordering, and banner images with Supabase Storage upload.
- **Categories CMS**: Manage sports categories, slugs, descriptions, and category covers.
- **Products CMS**: Full product lifecycle management with multi-image upload, brand association, technical specs builder, sizes, and featured flags.
- **Brands CMS**: Manage equipment partner brands with logo uploads and descriptions.
- **Custom Teamwear & Jersey Templates CMS**: Manage 3D/2D jersey models, front/back mockups, color palettes, size runs, and customization options.
- **Fabric Collection CMS**: Add and manage performance fabrics, GSM specifications, and swatches.
- **Business Highlights CMS**: Manage confirmed factual metrics and statistics with anti-fake-stats guardrails.
- **Why Choose Us CMS**: Update competitive advantages displayed across the storefront.
- **Enquiries Lead Desk**: Real-time customer enquiry inbox with status tracking (`new`, `contacted`, `completed`, `archived`) and one-click WhatsApp reply.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+ (App Router, Turbopack)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom sports dark mode palette (`#080A0F` abyss, `#F5A623` amber gold, `#1E3A8A` athletic navy)
- **Fonts**: `Outfit` (Headings) and `Plus Jakarta Sans` (Body) via `next/font/google`
- **Icons**: `lucide-react` & custom SVG brand icons
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (Admin login guard with SSR cookie sessions)
- **Asset Storage**: Supabase Storage bucket (`dfd-sports`)

---

## 🚀 Getting Started

### 1. Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Database & Storage Setup
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy and execute the complete schema from [`supabase/schema.sql`](./supabase/schema.sql).
   - This creates all 10 tables, performance indexes, Row Level Security (RLS) policies, and configures the `dfd-sports` storage bucket.
3. In **Authentication -> Users**, create an admin user (e.g. `admin@dfdsports.com`) with a secure password.

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public storefront.  
Visit [http://localhost:3000/admin](http://localhost:3000/admin) to log into the Admin CMS.

### 4. Build & Production Check

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── (public pages)
│   │   │   ├── page.tsx               # Homepage with Hero, Categories, Products, Fabrics, Customizer
│   │   │   ├── about/page.tsx         # About DFD Sports & Mission
│   │   │   ├── collections/           # Product collections by category/brand
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── products/              # Product details & catalog
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── custom-jerseys/page.tsx# Interactive Jersey 360 Customizer
│   │   │   └── contact/page.tsx       # Contact, Map, Inquiry form
│   │   ├── admin/                     # Protected Admin CMS
│   │   │   ├── layout.tsx             # Admin layout with auth guard & sidebar
│   │   │   ├── page.tsx               # Admin overview dashboard
│   │   │   ├── login/page.tsx         # Supabase Auth admin login
│   │   │   ├── company/page.tsx       # Company settings form
│   │   │   ├── hero/page.tsx          # Hero slides CMS
│   │   │   ├── categories/page.tsx    # Categories CMS
│   │   │   ├── products/page.tsx      # Products CMS
│   │   │   ├── brands/page.tsx        # Brands CMS
│   │   │   ├── teamwear/page.tsx      # Custom jerseys CMS
│   │   │   ├── fabrics/page.tsx       # Fabrics CMS
│   │   │   ├── highlights/page.tsx    # Business stats CMS
│   │   │   ├── why-choose-us/page.tsx # Why Choose Us CMS
│   │   │   └── enquiries/page.tsx     # Leads & customer enquiries
│   │   └── api/
│   │       └── enquiries/route.ts     # Public enquiry submission endpoint
│   ├── components/
│   │   ├── admin/                     # Admin forms and list clients
│   │   ├── home/                      # Homepage sections
│   │   ├── layout/                    # Global Header & Footer
│   │   ├── teamwear/                  # 360 Jersey customizer component
│   │   └── ui/                        # Buttons, Spinners, Section headings, Empty states
│   ├── lib/
│   │   ├── supabase/                  # Supabase client, server, admin, auth helpers
│   │   └── whatsapp.ts                # WhatsApp URL formatting utility
│   ├── services/                      # Data layer fetching from Supabase
│   └── types/
│       └── database.ts                # TypeScript interfaces for all Supabase entities
├── supabase/
│   └── schema.sql                     # Complete PostgreSQL DDL, RLS & Storage config
└── package.json
```

---

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)**: Public visitors can only read active records (`is_active = true`) and submit enquiries. All modifications require an authenticated Supabase user session.
- **Server Side Rendering (SSR)**: High performance with dynamic fetching and cookie-based admin auth verification.
- **Fail-safe Fallbacks**: Public storefront gracefully displays default fallback values if database records are empty during initial setup.
