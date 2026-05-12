import { Metadata } from 'next';
import { AutonomousAgentDashboard } from '@/components/autonomous-agent/autonomous-agent-dashboard';

export const metadata: Metadata = {
  title: 'Autonomous Agent | ENTARC',
  description: 'AI-driven portfolio management and social signal intelligence on Arc Network',
};

export default function AutonomousAgentPage() {
  return <AutonomousAgentDashboard />;
}
