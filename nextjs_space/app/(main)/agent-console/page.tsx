import { Metadata } from 'next';
import { AgentConsole } from '@/components/agent-console/agent-console';

export const metadata: Metadata = {
  title: 'Agent Console | ENTARC',
  description: 'Gemini due diligence, spending policy and autonomous USDC settlement on Arc',
};

export default function AgentConsolePage() {
  return <AgentConsole />;
}
