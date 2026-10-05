import React from 'react';
import { getAllHighlights } from '@/services/highlights';
import { HighlightsAdminClient } from '@/components/admin/HighlightsAdminClient';

export const revalidate = 0;

export default async function AdminHighlightsPage() {
  const highlights = await getAllHighlights();
  return <HighlightsAdminClient highlights={highlights} />;
}
