import { ROUTES } from '@/lib/routes';
import { redirect } from 'next/navigation';

// Prevent static generation and force dynamic rendering
export const dynamic = 'force-dynamic';

export default function RootPage() {
  redirect(ROUTES.HOME);
}
