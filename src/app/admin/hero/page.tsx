import React from 'react';
import { getAllHeroSlides } from '@/services/hero';
import { HeroAdminClient } from '@/components/admin/HeroAdminClient';

export const revalidate = 0;

export default async function AdminHeroPage() {
  const slides = await getAllHeroSlides();
  return <HeroAdminClient slides={slides} />;
}
