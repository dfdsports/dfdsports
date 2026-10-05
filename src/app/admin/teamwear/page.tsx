import React from 'react';
import { getAllTeamwear } from '@/services/teamwear';
import { TeamwearAdminClient } from '@/components/admin/TeamwearAdminClient';

export const revalidate = 0;

export default async function AdminTeamwearPage() {
  const items = await getAllTeamwear();
  return <TeamwearAdminClient items={items} />;
}
