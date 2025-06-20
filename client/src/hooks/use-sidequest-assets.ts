/**
 * Sidequest Assets Hook
 * 
 * Provides access to Firebase-hosted sidequest assets with fallback to local assets.
 * Automatically handles the transition from local to Firebase-hosted assets.
 */

import { useQuery } from '@tanstack/react-query';

interface SidequestAssets {
  [assetName: string]: string;
}

interface SidequestAssetsResponse {
  assets: SidequestAssets;
}

/**
 * Hook to get all sidequest assets from Firebase Storage
 */
export function useAllSidequestAssets() {
  return useQuery<{ [sidequestName: string]: SidequestAssets }>({
    queryKey: ['/api/sidequests/assets'],
    queryFn: async () => {
      const response = await fetch('/api/sidequests/assets');
      if (!response.ok) {
        throw new Error('Failed to fetch sidequest assets');
      }
      const data: SidequestAssetsResponse = await response.json();
      return data.assets;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get assets for a specific sidequest
 */
export function useSidequestAssets(sidequestName: string) {
  return useQuery<SidequestAssets>({
    queryKey: ['/api/sidequests', sidequestName, 'assets'],
    queryFn: async () => {
      const response = await fetch(`/api/sidequests/${sidequestName}/assets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch assets for ${sidequestName}`);
      }
      const data: SidequestAssetsResponse = await response.json();
      return data.assets;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!sidequestName,
  });
}

/**
 * Get asset URL from Firebase Storage
 * 
 * @param sidequestName - Name of the sidequest (e.g., "wack-a-chupacabra")
 * @param assetName - Name of the asset file without extension (e.g., "wack-bg")
 */
export function useSidequestAsset(
  sidequestName: string, 
  assetName: string
): string | undefined {
  const { data: assets, isLoading, error } = useSidequestAssets(sidequestName);
  
  // Return Firebase URL if available
  if (!isLoading && !error && assets && assets[assetName]) {
    return assets[assetName];
  }
  
  // Return undefined if not loaded yet or not found
  return undefined;
}

/**
 * Asset helper utilities
 */
export const SidequestAssetHelper = {
  /**
   * Extract asset name from filename (removes extension)
   */
  getAssetName: (filename: string) => 
    filename.replace(/\.[^/.]+$/, ''),
    
  /**
   * Get asset URL from Firebase Storage
   */
  getAsset: (
    assets: SidequestAssets | undefined, 
    assetName: string
  ): string | undefined => {
    if (assets && assets[assetName]) {
      return assets[assetName];
    }
    return undefined;
  }
};