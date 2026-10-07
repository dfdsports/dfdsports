import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCompanySettings } from '@/services/company';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Shirt,
  ShieldCheck,
  MapPin,
  Target,
  Users,
  Medal,
  CheckCircle2,
  Layers,
  Dumbbell,
  Grid,
  Building2,
  GraduationCap,
  User,
  Compass,
  Zap,
} from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'About Us | DFD — Destination for Dreams',
  description:
    'Learn about DFD (Destination for Dreams) — quality sports products, custom jerseys, medals, and gear for athletes, schools, clubs, and academies across India.',
};

export default async function AboutPage() {
  const company = await getCompanySettings();

  const offerings = [
    {
      num: '01',
      title: 'Sports Equipment',
      description:
        'Quality sports equipment sourced from leading and trusted brands for top performance.',
      icon: Dumbbell,
    },
    {
      num: '02',
      title: 'Customised Jerseys',
      description:
        'Custom jersey solutions engineered for teams, clubs, schools, and sporting groups.',
      icon: Shirt,
    },
    {
      num: '03',
      title: 'Medals',
      description:
        'Medals and recognition products for tournaments and sporting milestones.',
      icon: Medal,
    },
    {
      num: '04',
      title: 'Sports Accessories',
      description:
        'Essential sports accessories for athletes, teams, and sports enthusiasts.',
      icon: Zap,
    },
    {
      num: '05',
      title: 'Sports Mats',
      description:
        'Quality sports mats suitable for diverse training and sporting requirements.',
      icon: Grid,
    },
    {
      num: '06',
      title: 'Custom Sports Solutions',
      description:
        'Customised solutions for schools, clubs, academies, tournaments, and sporting events.',
      icon: Layers,
    },
  ];

  const whoWeServe = [
    {
      title: 'Athletes',
      description: 'Individual competitors and aspiring champions pushing their athletic limits.',
      icon: User,
    },
    {
      title: 'Students',
      description: 'Young talents developing their sporting passion across schools and colleges.',
      icon: GraduationCap,
    },
    {
      title: 'Schools',
      description: 'Educational institutions requiring bulk physical education and sports equipment.',
      icon: Building2,
    },
    {
      title: 'Clubs & Academies',
      description: 'Training hubs and competitive teams needing match uniforms and practice gear.',
      icon: Users,
    },
    {
      title: 'Tournaments & Events',
      description: 'Organizers requiring custom jerseys, medals, mats, and complete event supplies.',
      icon: Trophy,
    },
  ];

  const stats = [
    {
      value: '100+',
      label: 'Satisfied Regular Customers',
    },
    {
      value: '2025',
      label: 'Established (January)',
    },
    {
      value: 'PAN INDIA',
      label: 'Service Coverage',
    },
    {
      value: 'KOZHIKODE',
      label: 'Based in Kerala, India',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0F] text-white selection:bg-[#F5A623] selection:text-[#080A0F]">
      <Header company={company} />

      <main className="flex-1 w-full space-y-16 sm:space-y-24">
        {/* =========================================================================
            1. HERO — "BUILT AROUND THE DREAM"
           ========================================================================= */}
        <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
          {/* Subtle Background Image Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/about/hero_athletes.jpg"
              alt="DFD Sports"
              fill
              priority
              className="object-cover object-center opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080A0F]/80 via-[#080A0F]/90 to-[#080A0F]" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30">
              
              <span className="text-[11px] sm:text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
                DESTINATION FOR DREAMS
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              More Than Sports.{' '}
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B]">
                We Support The Dream Behind It.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
              DFD – Destination for Dreams is a sports initiative founded by three young sports enthusiasts with a simple vision: to make quality sports products accessible at the right price and help people turn their sporting dreams into reality.
            </p>
          </div>
        </section>

        {/* =========================================================================
            2. BRAND STORY & STATEMENT
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Box */}
            <div className="lg:col-span-5 p-7 sm:p-8 rounded-3xl bg-[#0E121B] border border-white/10 shadow-xl space-y-4">
              <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
                OUR STORY
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white leading-tight">
                A Journey Built Around Sport
              </h2>
              <div className="pt-3 border-t border-white/10">
                <p className="text-[11px] uppercase font-bold tracking-wider text-gray-400 mb-1">
                  Brand Statement
                </p>
                <p className="text-base sm:text-lg font-black text-[#F5A623] leading-snug">
                  &ldquo;Empowering Dreams, Inspiring Champions&rdquo;
                </p>
              </div>
            </div>

            {/* Right Story Copy */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                What started as a new journey in the sports industry has grown into a trusted choice for <strong className="text-white font-bold">100+ satisfied regular customers</strong>. Over the past two years, we have built strong relationships with athletes, students, schools, clubs and sports enthusiasts by focusing on what matters most — <span className="text-[#F5A623] font-semibold">quality, reliability and customer satisfaction.</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                At DFD, we provide a wide range of quality sports equipment, customised jerseys, medals, sports accessories and sports mats, sourced from leading and trusted brands.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. DFD AT A GLANCE (Verified Statistics)
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/10 hover:border-amber-400/40 transition-all text-center sm:text-left flex flex-col justify-between"
              >
                <span className="text-2xl sm:text-4xl font-black text-[#F5A623] mb-1">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. WHAT WE OFFER
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623] mb-2">
              WHAT WE OFFER
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Everything You Need To Keep The Game Moving
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offerings.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="p-6 rounded-2xl bg-[#0E121B] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#F5A623]">
                        {item.num}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#F5A623]/20 flex items-center justify-center text-gray-400 group-hover:text-[#F5A623] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2 group-hover:text-[#F5A623] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            5. OUR PURPOSE
           ========================================================================= */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#121624] via-[#0E121B] to-[#121624] border border-white/10 text-center space-y-4 shadow-xl">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
              OUR AIM
            </p>
            <blockquote className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white leading-snug">
              &ldquo;Quality sports products. <br />
              <span className="text-[#F5A623]">Fair and affordable prices.</span> <br />
              No compromise on reliability.&rdquo;
            </blockquote>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed pt-2">
              To provide quality sports products at fair and affordable prices, without compromising on performance or reliability.
            </p>
          </div>
        </section>

        {/* =========================================================================
            6. WHO WE SERVE
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623] mb-2">
              COMMUNITY
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Supporting Every Sporting Journey
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {whoWeServe.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0E121B] border border-white/10 flex flex-col justify-between hover:border-amber-400/30 transition-all"
                >
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623] mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-white mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            7. PAN-INDIA SERVICE
           ========================================================================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-7 sm:p-10 rounded-3xl bg-[#0E121B] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
                SERVING ACROSS INDIA
              </p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                From Kozhikode To Sporting Communities Across India
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Today, DFD is expanding its services across India, taking our products and customised sports solutions to customers beyond our local community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-center sm:text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Based In</p>
                <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                  Kozhikode, Kerala
                </p>
              </div>
              <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-center sm:text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Service Coverage</p>
                <p className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Compass className="w-3.5 h-3.5 text-[#F5A623]" />
                  All Over India
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. OUR BELIEF
           ========================================================================= */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/about/sports_gear.jpg"
              alt="DFD Sports Belief"
              fill
              className="object-cover object-center opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#080A0F] via-[#080A0F]/90 to-[#080A0F]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623]">
              OUR BELIEF
            </p>
            <blockquote className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              &ldquo;Every player has a dream. <br />
              Every team has a goal. <br />
              <span className="text-[#F5A623]">
                Every sporting journey deserves the right support.
              </span>&rdquo;
            </blockquote>
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 pt-1">
              DFD — Destination for Dreams
            </p>
          </div>
        </section>

        {/* =========================================================================
            9. COMPANY INFORMATION
           ========================================================================= */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-[#0E121B] border border-white/10">
            <p className="text-xs uppercase font-bold tracking-[0.2em] text-[#F5A623] mb-6 text-center">
              COMPANY INFORMATION
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Brand Name
                </span>
                <span className="font-bold text-white text-sm">DFD</span>
                <span className="text-gray-400 block text-[11px]">Destination for Dreams</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  CEO
                </span>
                <span className="font-bold text-white text-sm">Rithwik Sundar A K</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Established
                </span>
                <span className="font-bold text-white text-sm">January 2025</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Location
                </span>
                <span className="font-bold text-white text-sm">Kozhikode, Kerala, India</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Service Area
                </span>
                <span className="font-bold text-white text-sm">All Over India</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-0.5 uppercase tracking-wider text-[10px]">
                  Tagline
                </span>
                <span className="font-semibold text-white text-xs">Quality. Fair Prices. Trust.</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CTA
           ========================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-3xl bg-gradient-to-r from-[#141926] via-[#0E121B] to-[#141926] border border-white/10 p-8 sm:p-12 text-center space-y-5 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Your Dream. Your Sport. <br />
              <span className="text-[#F5A623]">Our Support.</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
              Whether you&apos;re an athlete, school, club, academy or tournament organiser, DFD is here to support your sporting journey with quality products and customised solutions.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/collections"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F5A623] hover:bg-[#E5981A] text-[#080A0F] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#F5A623]/20"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <WhatsAppButton
                phoneNumber={company?.whatsapp_number}
                type="general"
                variant="outline"
                size="md"
                className="rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Get In Touch
              </WhatsAppButton>
            </div>
          </div>
        </section>
      </main>

      <Footer company={company} />
    </div>
  );
}
