import { redirect } from 'next/navigation';

export default function NewBrandPage() {
  redirect('/admin/brands?action=new');
}
