'use client';

// ENTARC MVP - Zustand Store
// Central state management for the application

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  Project,
  PortfolioPosition,
  ProjectFilters,
  SortOption,
  DashboardMetrics,
  Milestone,
} from '@/lib/types';
import { mockProjects, mockPortfolioPositions } from '@/lib/mock-data';

// ============================================
// STORE TYPES
// ============================================

interface EntarcState {
  // Data
  projects: Project[];
  portfolio: PortfolioPosition[];
  
  // Filters & Sorting
  filters: ProjectFilters;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  
  // Streaming Simulation
  isStreamingActive: boolean;
  streamingInterval: NodeJS.Timeout | null;
  
  // UI State
  selectedProjectId: string | null;
  isLoading: boolean;
  
  // Actions
  setFilters: (filters: Partial<ProjectFilters>) => void;
  setSortBy: (sort: SortOption) => void;
  toggleSortOrder: () => void;
  setSelectedProject: (id: string | null) => void;
  
  // Streaming Actions
  startStreaming: () => void;
  stopStreaming: () => void;
  tickStreaming: () => void;
  
  // Milestone Actions
  completeMilestone: (projectId: string, milestoneId: string) => void;
  
  // Portfolio Actions
  updateExitStrategy: (positionId: string, strategy: PortfolioPosition['exitStrategy']) => void;
  
  // Computed/Derived
  getFilteredProjects: () => Project[];
  getProjectById: (id: string) => Project | undefined;
  getPortfolioForProject: (projectId: string) => PortfolioPosition | undefined;
  getDashboardMetrics: () => DashboardMetrics;
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultFilters: ProjectFilters = {
  minTrustScore: 0,
  sentimentType: 'all',
  activityLevel: 'all',
  category: 'all',
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useEntarcStore = create<EntarcState>()(
  subscribeWithSelector((set, get) => ({
    // Initial Data
    projects: mockProjects,
    portfolio: mockPortfolioPositions,
    
    // Initial Filter State
    filters: defaultFilters,
    sortBy: 'trustScore',
    sortOrder: 'desc',
    
    // Initial Streaming State
    isStreamingActive: false,
    streamingInterval: null,
    
    // Initial UI State
    selectedProjectId: null,
    isLoading: false,
    
    // ============================================
    // FILTER ACTIONS
    // ============================================
    
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },
    
    setSortBy: (sort) => {
      set({ sortBy: sort });
    },
    
    toggleSortOrder: () => {
      set((state) => ({
        sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
      }));
    },
    
    setSelectedProject: (id) => {
      set({ selectedProjectId: id });
    },
    
    // ============================================
    // STREAMING SIMULATION ACTIONS
    // ============================================
    
    startStreaming: () => {
      const { streamingInterval } = get();
      if (streamingInterval) return; // Already running
      
      const interval = setInterval(() => {
        get().tickStreaming();
      }, 1000); // Tick every second
      
      set({
        isStreamingActive: true,
        streamingInterval: interval,
      });
    },
    
    stopStreaming: () => {
      const { streamingInterval } = get();
      if (streamingInterval) {
        clearInterval(streamingInterval);
      }
      set({
        isStreamingActive: false,
        streamingInterval: null,
      });
    },
    
    tickStreaming: () => {
      set((state) => ({
        projects: state.projects.map((project) => ({
          ...project,
          milestones: (project?.milestones ?? []).map((milestone) => {
            // Only tick active milestones
            if (milestone?.status !== 'active') return milestone;
            
            const lockedAmount = milestone?.lockedAmount ?? 0;
            const releasedAmount = milestone?.releasedAmount ?? 0;
            const amount = milestone?.amount ?? 0;
            
            // Increment released amount (1% of locked per tick, max 100 per tick)
            const increment = Math.min(lockedAmount * 0.01, 100);
            const newReleased = Math.min(releasedAmount + increment, amount);
            const newLocked = amount - newReleased;
            const newCompletion = (newReleased / amount) * 100;
            
            return {
              ...milestone,
              releasedAmount: Math.round(newReleased * 100) / 100,
              lockedAmount: Math.round(newLocked * 100) / 100,
              completionPercent: Math.round(newCompletion * 10) / 10,
            };
          }),
        })),
      }));
    },
    
    // ============================================
    // MILESTONE ACTIONS
    // ============================================
    
    completeMilestone: (projectId, milestoneId) => {
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project?.id !== projectId) return project;
          
          return {
            ...project,
            milestones: (project?.milestones ?? []).map((milestone) => {
              if (milestone?.id !== milestoneId) return milestone;
              
              const amount = milestone?.amount ?? 0;
              
              // Complete the milestone - release all funds
              return {
                ...milestone,
                status: 'completed' as const,
                completionPercent: 100,
                releasedAmount: amount,
                lockedAmount: 0,
              };
            }),
          };
        }),
      }));
    },
    
    // ============================================
    // PORTFOLIO ACTIONS
    // ============================================
    
    updateExitStrategy: (positionId, strategy) => {
      set((state) => ({
        portfolio: state.portfolio.map((pos) =>
          pos?.id === positionId ? { ...pos, exitStrategy: strategy } : pos
        ),
      }));
    },
    
    // ============================================
    // COMPUTED / SELECTORS
    // ============================================
    
    getFilteredProjects: () => {
      const { projects, filters, sortBy, sortOrder } = get();
      
      let filtered = [...(projects ?? [])];
      
      // Apply filters
      if ((filters?.minTrustScore ?? 0) > 0) {
        filtered = filtered.filter((p) => (p?.trustScore ?? 0) >= (filters?.minTrustScore ?? 0));
      }
      
      if (filters?.sentimentType && filters.sentimentType !== 'all') {
        filtered = filtered.filter(
          (p) => p?.social?.sentimentLabel === filters.sentimentType
        );
      }
      
      if (filters?.activityLevel && filters.activityLevel !== 'all') {
        filtered = filtered.filter((p) => {
          const commits = p?.github?.commitsLast30Days ?? 0;
          switch (filters.activityLevel) {
            case 'low':
              return commits < 80;
            case 'medium':
              return commits >= 80 && commits < 150;
            case 'high':
              return commits >= 150;
            default:
              return true;
          }
        });
      }
      
      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter((p) => p?.category === filters.category);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'trustScore':
            comparison = (a?.trustScore ?? 0) - (b?.trustScore ?? 0);
            break;
          case 'activity':
            comparison = (a?.github?.commitsLast30Days ?? 0) - (b?.github?.commitsLast30Days ?? 0);
            break;
          case 'valuation':
            comparison = (a?.funding?.valuation ?? 0) - (b?.funding?.valuation ?? 0);
            break;
          case 'roi':
            comparison = (a?.performance?.roiPercent ?? 0) - (b?.performance?.roiPercent ?? 0);
            break;
          default:
            comparison = 0;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
      
      return filtered;
    },
    
    getProjectById: (id) => {
      const { projects } = get();
      return (projects ?? []).find((p) => p?.id === id);
    },
    
    getPortfolioForProject: (projectId) => {
      const { portfolio } = get();
      return (portfolio ?? []).find((p) => p?.projectId === projectId);
    },
    
    getDashboardMetrics: (): DashboardMetrics => {
      const { projects, portfolio } = get();
      
      // Calculate TVL (sum of all invested amounts)
      const tvl = (portfolio ?? []).reduce((sum, pos) => sum + (pos?.investedAmount ?? 0), 0);
      
      // Count active projects
      const activeProjects = (portfolio ?? []).filter((p) => p?.status === 'active').length;
      
      // Calculate weighted average ROI
      const totalInvested = (portfolio ?? []).reduce((sum, pos) => sum + (pos?.investedAmount ?? 0), 0);
      const weightedROI = totalInvested > 0
        ? (portfolio ?? []).reduce(
            (sum, pos) => sum + (pos?.roi ?? 0) * (pos?.investedAmount ?? 0),
            0
          ) / totalInvested
        : 0;
      
      // Calculate total released and locked from all milestones
      let totalReleased = 0;
      let totalLocked = 0;
      
      (projects ?? []).forEach((project) => {
        (project?.milestones ?? []).forEach((m) => {
          totalReleased += m?.releasedAmount ?? 0;
          totalLocked += m?.lockedAmount ?? 0;
        });
      });
      
      return {
        tvl,
        activeProjects,
        averageROI: Math.round(weightedROI * 10) / 10,
        totalReleased: Math.round(totalReleased),
        totalLocked: Math.round(totalLocked),
      };
    },
  }))
);
