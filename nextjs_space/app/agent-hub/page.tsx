export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AgentHubContent } from '@/components/agent-hub/agent-hub-content';

export default async function AgentHubPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return <AgentHubContent />;
}
