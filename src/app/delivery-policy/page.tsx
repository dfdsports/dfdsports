import React from 'react';
import { getCompanySettings } from '@/services/company';
import { getActivePoliciesByType } from '@/services/policies';
import { PolicyView } from '@/components/policy/PolicyView';

export const revalidate = 60;

export const metadata = {
  title: 'Delivery Policy | DFD Sports — Destination for Dreams',
  description:
    'Read our pan-India delivery policy, manufacturing lead times for custom sublimation jerseys, shipping fees, package tracking, and transit inspection guidelines.',
};

export default async function DeliveryPolicyPage() {
  const [company, sections] = await Promise.all([
    getCompanySettings(),
    getActivePoliciesByType('delivery_policy'),
  ]);

  return (
    <PolicyView
      type="delivery_policy"
      title="DELIVERY"
      highlightWord="POLICY"
      eyebrow="SHIPPING & LOGISTICS"
      description="Clear, reliable pan-India delivery guidelines for certified sports equipment and customized teamwear apparel by DFD Sports."
      sections={sections}
      company={company}
    />
  );
}
