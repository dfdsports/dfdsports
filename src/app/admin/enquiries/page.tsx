import React from 'react';
import { getEnquiries } from '@/services/enquiries';
import { EnquiriesAdminClient } from '@/components/admin/EnquiriesAdminClient';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();
  return <EnquiriesAdminClient enquiries={enquiries} />;
}
