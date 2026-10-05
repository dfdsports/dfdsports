import React from 'react';
import { getAdminUser } from '@/lib/supabase/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import '../../app/globals.css';

export const metadata = {
  title: 'DFD Sports Admin CMS',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  // No user — render children as-is (login page handles its own UI)
  // proxy.ts already redirects unauthenticated requests away from protected routes
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#080A0F] text-white flex">
      <AdminSidebar userEmail={user.email} />

      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

