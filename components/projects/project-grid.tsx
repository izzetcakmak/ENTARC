'use client';

// ProjectGrid Component - Grid layout for project cards
// Displays filtered and sorted project list

import { useEntarcStore } from '@/store/use-entarc-store';
import { ProjectCard } from './project-card';
import { CardSkeleton } from '@/components/shared/app-skeleton';
import { StateBlock } from '@/components/shared/state-block';
import { useEffect, useState } from 'react';

export function ProjectGrid() {
  const getFilteredProjects = useEntarcStore((state) => state.getFilteredProjects);
  const setFilters = useEntarcStore((state) => state.setFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const projects = getFilteredProjects();

  if ((projects?.length ?? 0) === 0) {
    return (
      <StateBlock
        type="no-results"
        title="No Projects Found"
        message="Try adjusting your filters to see more projects"
        action={{
          label: 'Clear Filters',
          onClick: () =>
            setFilters({
              minTrustScore: 0,
              sentimentType: 'all',
              activityLevel: 'all',
              category: 'all',
            }),
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project?.id ?? ''} project={project} />
      ))}
    </div>
  );
}
