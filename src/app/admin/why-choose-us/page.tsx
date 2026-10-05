import React from 'react';
import { getAllWhyChooseUs } from '@/services/whyChooseUs';
import { WhyChooseUsAdminClient } from '@/components/admin/WhyChooseUsAdminClient';

export const revalidate = 0;

export default async function AdminWhyChooseUsPage() {
  const items = await getAllWhyChooseUs();
  return <WhyChooseUsAdminClient items={items} />;
}
