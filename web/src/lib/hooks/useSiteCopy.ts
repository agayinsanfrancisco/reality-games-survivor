/**
 * Hook to fetch and use site copy from the CMS
 */

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SiteCopyResponse {
  data: Record<string, string>;
  cached: boolean;
}

/**
 * Fetch all site copy
 */
export function useSiteCopy() {
  return useQuery({
    queryKey: ['site-copy'],
    queryFn: async (): Promise<Record<string, string>> => {
      const response = await fetch(`${API_URL}/api/site-copy`);
      if (!response.ok) {
        throw new Error('Failed to fetch site copy');
      }
      const data: SiteCopyResponse = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (cache time)
  });
}

/**
 * Fetch site copy for a specific page
 */
export function useSiteCopyByPage(page: string) {
  return useQuery({
    queryKey: ['site-copy', 'page', page],
    queryFn: async (): Promise<Record<string, string>> => {
      const response = await fetch(`${API_URL}/api/site-copy/page/${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch site copy');
      }
      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Helper hook to get a specific copy value with fallback
 */
export function useCopy(key: string, fallback: string = ''): string {
  const { data: copy } = useSiteCopy();
  return copy?.[key] || fallback;
}

/**
 * Get copy value synchronously from cached data
 * Useful when you need the value outside of React components
 */
let cachedCopy: Record<string, string> = {};

export function setCachedCopy(data: Record<string, string>) {
  cachedCopy = data;
}

export function getCopy(key: string, fallback: string = ''): string {
  return cachedCopy[key] || fallback;
}
