import { useQuery } from "@tanstack/react-query";
import { layerQueries } from "@/lib/supabase/queries";

// Layer data management hook
export function useLayers(sectionId: number) {
  // Get all layers for a section
  const {
    data: layers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["layers", sectionId],
    queryFn: () => layerQueries.getLayersForSection(sectionId),
    enabled: !!sectionId, // Only run if sectionId exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Get active layer for the section
  const {
    data: activeLayer,
    isLoading: isLoadingActiveLayer,
    error: activeLayerError,
    refetch: refetchActiveLayer,
  } = useQuery({
    queryKey: ["activeLayer", sectionId],
    queryFn: () => layerQueries.getActiveLayer(sectionId),
    enabled: !!sectionId,
    staleTime: 1 * 60 * 1000, // Consider active layer fresh for 1 minute
  });

  // Helper to get layer by index
  const getLayerByIndex = (layerIndex: number) => {
    return layers.find((layer) => layer.layer_index === layerIndex);
  };

  // Helper to check if a layer exists
  const hasLayer = (layerIndex: number): boolean => {
    return layers.some((layer) => layer.layer_index === layerIndex);
  };

  // Helper to get all layer indices
  const layerIndices = layers
    .map((layer) => layer.layer_index)
    .sort((a, b) => a - b);

  return {
    // Data
    layers,
    activeLayer,
    layerIndices,

    // Loading states
    isLoading,
    isLoadingActiveLayer,

    // Errors
    error,
    activeLayerError,

    // Actions
    refetch,
    refetchActiveLayer,

    // Helpers
    getLayerByIndex,
    hasLayer,
  };
}
