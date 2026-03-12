// Main Layout - Authenticated app shell
// Contains sidebar and header for main app pages

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MainLayoutClient } from './main-layout-client';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <MainLayoutClient>{children}</MainLayoutClient>;
}
