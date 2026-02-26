import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDeviceInfo } from './useDeviceInfo';
import {
  viewItinerary as viewItineraryService,
  viewUserItineraries as viewUserItinerariesService,
  createItinerary as createItineraryService,
  updateItinerary as updateItineraryService,
  deleteItinerary as deleteItineraryService,
  cancelItinerary as cancelItineraryService,
  markItineraryAsDone as markItineraryAsDoneService,
  Itinerary,
  CreateItineraryData,
  UpdateItineraryData,
} from '@/services/itineraryService';

// Query keys for cache management
const itineraryKeys = {
  all: ['itineraries'] as const,
  lists: () => [...itineraryKeys.all, 'list'] as const,
  list: () => [...itineraryKeys.lists()] as const,
  details: () => [...itineraryKeys.all, 'detail'] as const,
  detail: (id: string) => [...itineraryKeys.details(), id] as const,
};

/**
 * Hook to fetch all user itineraries
 */
export function useGetUserItineraries() {
  const deviceInfo = useDeviceInfo();

  return useQuery({
    queryKey: itineraryKeys.list(),
    queryFn: async () => await viewUserItinerariesService(deviceInfo),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    enabled: deviceInfo.isLoaded,
  });
}

/**
 * Hook to fetch a single itinerary by ID
 */
export function useGetItinerary(itineraryID: string | null) {
  const deviceInfo = useDeviceInfo();

  return useQuery({
    queryKey: itineraryKeys.detail(itineraryID || ''),
    queryFn: async () => await viewItineraryService(itineraryID!, deviceInfo),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: deviceInfo.isLoaded && !!itineraryID,
  });
}

/**
 * Hook to create a new itinerary
 */
export function useCreateItinerary() {
  const deviceInfo = useDeviceInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryData: CreateItineraryData) =>
      await createItineraryService(itineraryData, deviceInfo),
    onSuccess: () => {
      // Invalidate and refetch user itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}

/**
 * Hook to update an itinerary
 */
export function useUpdateItinerary() {
  const deviceInfo = useDeviceInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itineraryID, updateData }: { itineraryID: string; updateData: UpdateItineraryData }) =>
      await updateItineraryService(itineraryID, updateData, deviceInfo),
    onSuccess: (data) => {
      // Update the specific itinerary in cache
      queryClient.setQueryData(itineraryKeys.detail(data._id), data);
      // Refetch the user itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}

/**
 * Hook to delete an itinerary
 */
export function useDeleteItinerary() {
  const deviceInfo = useDeviceInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryID: string) => await deleteItineraryService(itineraryID, deviceInfo),
    onSuccess: (data) => {
      // Remove the deleted itinerary from cache
      queryClient.removeQueries({ queryKey: itineraryKeys.detail(data._id) });
      // Refetch the user itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}

/**
 * Hook to cancel an itinerary
 */
export function useCancelItinerary() {
  const deviceInfo = useDeviceInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryID: string) => await cancelItineraryService(itineraryID, deviceInfo),
    onSuccess: (data) => {
      // Update the specific itinerary in cache
      queryClient.setQueryData(itineraryKeys.detail(data._id), data);
      // Refetch the user itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}

/**
 * Hook to mark an itinerary as done
 */
export function useMarkItineraryAsDone() {
  const deviceInfo = useDeviceInfo();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itineraryID: string) => await markItineraryAsDoneService(itineraryID, deviceInfo),
    onSuccess: (data) => {
      // Update the specific itinerary in cache
      queryClient.setQueryData(itineraryKeys.detail(data._id), data);
      // Refetch the user itineraries list
      queryClient.invalidateQueries({ queryKey: itineraryKeys.list() });
    },
  });
}
