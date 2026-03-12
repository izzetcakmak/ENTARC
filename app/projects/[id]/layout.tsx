// Project Detail Layout - Wrapper for project pages
// Provides authentication check

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MainLayoutClient } from '@/app/(main)/main-layout-client';

export default async function ProjectLayout({
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
