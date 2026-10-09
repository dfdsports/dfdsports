import React from 'react';
import { getCompanySettings } from '@/services/company';
import { getActivePoliciesByType } from '@/services/policies';
import { PolicyView } from '@/components/policy/PolicyView';

export const revalidate = 60;

export const metadata = {
  title: 'Privacy Policy | DFD Sports — Destination for Dreams',
  description:
    'Read the official privacy policy of DFD Sports. Learn how we handle your personal information, custom teamwear specifications, and secure order processing.',
};

export default async function PrivacyPolicyPage() {
  const [company, sections] = await Promise.all([
    getCompanySettings(),
    getActivePoliciesByType('privacy_policy'),
  ]);

  return (
    <PolicyView
      type="privacy_policy"
      title="PRIVACY"
      highlightWord="POLICY"
      eyebrow="LEGAL & TRANSPARENCY"
      description="At DFD Sports (Destination for Dreams), we value your trust. This Privacy Policy details our principles for handling your order details, measurements, and communications with integrity."
      sections={sections}
      company={company}
    />
  );
}
