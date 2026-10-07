import React from 'react';
import { getAdminUser } from '@/lib/supabase/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased w-full">
      <AdminSidebar userEmail={user.email} />

      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0">
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
