/**
 * Firebase-based Sidequest Management Hook
 * 
 * Provides hooks for loading sidequests from Firebase instead of local components
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Sidequest, SidequestProgress } from '@shared/schema';

/**
 * Hook to fetch all active sidequests from Firebase
 */
export function useSidequests(tier?: string) {
  return useQuery<Sidequest[]>({
    queryKey: ['sidequests', tier],
    queryFn: async () => {
      const params = tier ? `?tier=${tier}` : '';
      const response = await fetch(`/api/sidequests${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sidequests');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific sidequest by ID
 */
export function useSidequest(sidequestId: string) {
  return useQuery<Sidequest>({
    queryKey: ['sidequest', sidequestId],
    queryFn: async () => {
      const response = await fetch(`/api/sidequests/${sidequestId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sidequest');
      }
      
      return response.json();
    },
    enabled: !!sidequestId,
  });
}

/**
 * Hook to save/update a sidequest in Firebase
 */
export function useSaveSidequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sidequestId, data }: { sidequestId: string; data: Partial<Sidequest> }) => {
      const response = await fetch(`/api/sidequests/${sidequestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save sidequest');
      }
      
      return response.json();
    },
    onSuccess: (_, { sidequestId }) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sidequests'] });
      queryClient.invalidateQueries({ queryKey: ['sidequest', sidequestId] });
    },
  });
}

/**
 * Hook to save sidequest progress
 */
export function useSaveSidequestProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sidequestId, data }: { sidequestId: string; data: Partial<SidequestProgress> }) => {
      const response = await fetch(`/api/sidequests/${sidequestId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      return response.json();
    },
    onSuccess: (_, { sidequestId, data }) => {
      // Invalidate progress queries
      if (data.hauntId && data.sessionId) {
        queryClient.invalidateQueries({ 
          queryKey: ['sidequest-progress', sidequestId, data.hauntId, data.sessionId] 
        });
      }
    },
  });
}

/**
 * Hook to fetch sidequest progress
 */
export function useSidequestProgress(sidequestId: string, hauntId: string, sessionId: string) {
  return useQuery<SidequestProgress>({
    queryKey: ['sidequest-progress', sidequestId, hauntId, sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sidequests/${sidequestId}/progress/${hauntId}/${sessionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No progress found yet
        }
        throw new Error('Failed to fetch progress');
      }
      
      return response.json();
    },
    enabled: !!(sidequestId && hauntId && sessionId),
  });
}

/**
 * Sidequest utilities
 */
export const SidequestUtils = {
  /**
   * Filter sidequests by subscription tier
   */
  filterByTier(sidequests: Sidequest[], userTier: string): Sidequest[] {
    const tierHierarchy = { 'Basic': 0, 'Pro': 1, 'Premium': 2 };
    const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
    
    return sidequests.filter(sidequest => {
      const sidequestTierLevel = tierHierarchy[sidequest.requiredTier as keyof typeof tierHierarchy] || 0;
      return sidequestTierLevel <= userTierLevel;
    });
  },

  /**
   * Generate a unique session ID for progress tracking
   */
  generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Calculate completion percentage from progress data
   */
  calculateCompletion(progress: SidequestProgress): number {
    if (progress.completed) return 100;
    
    // Extract completion metrics from progress data
    const data = progress.data || {};
    if (data.totalSteps && data.currentStep) {
      return Math.round((data.currentStep / data.totalSteps) * 100);
    }
    
    if (data.score && data.maxScore) {
      return Math.round((data.score / data.maxScore) * 100);
    }
    
    return 0;
  },

  /**
   * Format time spent in human-readable format
   */
  formatTimeSpent(timeInMs: number): string {
    const minutes = Math.floor(timeInMs / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
};