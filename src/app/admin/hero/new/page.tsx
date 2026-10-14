import { redirect } from 'next/navigation';

export default function NewHeroSlidePage() {
  redirect('/admin/hero?action=new');
}
