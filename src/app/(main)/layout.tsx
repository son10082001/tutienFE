'use client';

import { MainLayout } from '@/components/layout/landingpage-layout';

export default function MainLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
