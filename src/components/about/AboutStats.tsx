import React from 'react';
import { Users, Calendar, MapPin, Award } from 'lucide-react';

export interface StatItem {
  value: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
}

interface AboutStatsProps {
  stats?: StatItem[];
}

const defaultStats: StatItem[] = [
  {
    value: '100+',
    label: 'Satisfied Teams & Clients',
    description: 'Schools, clubs, and academies partnering with DFD',
    icon: Users,
  },
  {
    value: '2025',
    label: 'Founded in Kozhikode',
    description: 'Established with a passion for grassroots sports',
    icon: Calendar,
  },
  {
    value: 'Pan-India',
    label: 'Service & Delivery',
    description: 'Supplying equipment and kits across every state',
    icon: MapPin,
  },
  {
    value: '100%',
    label: 'Quality & Authenticity',
    description: 'Tested performance gear and zero-fade sublimation',
    icon: Award,
  },
];

export function AboutStats({ stats = defaultStats }: AboutStatsProps) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon || Award;
          return (
            <div
              key={idx}
              className="group p-5 sm:p-7 rounded-none bg-[#0E121B] hover:shadow-md transition-all duration-300 flex flex-col justify-between shadow-xs"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 rounded-none bg-[#FF001E]/10 flex items-center justify-center text-[#FF001E] group-hover:bg-[#FF001E] group-hover:text-white transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#E8192C] mb-1"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  {item.value}
                </span>
                <h3
                  className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-1"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  {item.label}
                </h3>
                {item.description && (
                  <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed hidden sm:block">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AboutStats;
