// Project Detail Page - Individual project view
// Shows overview, AI analysis, and milestones

import { ProjectDetailContent } from './project-detail-content';

interface ProjectPageProps {
  params: { id: string };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return <ProjectDetailContent projectId={params?.id ?? ''} />;
}
