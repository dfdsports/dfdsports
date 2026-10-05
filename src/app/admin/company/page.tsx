import React from 'react';
import { getCompanySettings } from '@/services/company';
import { CompanyForm } from '@/components/admin/CompanyForm';

export const revalidate = 0;

export default async function AdminCompanyPage() {
  const company = await getCompanySettings();

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Company Details</h1>
        <p className="text-sm text-gray-400 mt-1">
          Central CMS for all business information. Changes reflect site-wide instantly.
        </p>
      </div>

      <CompanyForm initialData={company} />
    </div>
  );
}
