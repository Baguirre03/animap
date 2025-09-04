import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pixelQueries } from "@/lib/supabase/queries";
import { Pixel, PlacePixelRequest } from "@/types/pixel";

// Place/update pixels hook with TanStack Query integration
export function usePixelOperations(layerId: number) {
  const queryClient = useQueryClient();

  // Get all pixels for a layer
  const {
    data: pixels = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pixels", layerId],
    queryFn: () => pixelQueries.getPixelsForLayer(layerId),
    enabled: !!layerId, // Only run if layerId exists
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
  });

  // Mutation for placing/updating pixels
  const placeMutation = useMutation({
    mutationFn: (request: PlacePixelRequest) =>
      pixelQueries.placePixel(request),
    onSuccess: (newPixels) => {
      // Update the pixels cache with the new data
      queryClient.setQueryData(
        ["pixels", layerId],
        (oldPixels: Pixel[] = []) => {
          const updatedPixels = [...oldPixels];

          newPixels.forEach((newPixel) => {
            const existingIndex = updatedPixels.findIndex(
              (p) => p.x === newPixel.x && p.y === newPixel.y
            );

            if (existingIndex >= 0) {
              updatedPixels[existingIndex] = newPixel;
            } else {
              updatedPixels.push(newPixel);
            }
          });

          return updatedPixels;
        }
      );

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["pixels", layerId] });
    },
    onError: (error) => {
      console.error("Failed to place pixel:", error);
    },
  });

  // Helper function to place a pixel
  const placePixel = (
    x: number,
    y: number,
    color: string,
    updatedBy: string
  ) => {
    return placeMutation.mutate({
      layerId,
      x,
      y,
      color,
      updatedBy,
    });
  };

  // Helper function to get a specific pixel
  const getPixel = (x: number, y: number): Pixel | undefined => {
    return pixels.find((p) => p.x === x && p.y === y);
  };

  // Helper function to check if coordinates have a pixel
  const hasPixel = (x: number, y: number): boolean => {
    return pixels.some((p) => p.x === x && p.y === y);
  };

  return {
    // Data
    pixels,
    isLoading,
    error,

    // Actions
    placePixel,
    refetch,

    // Helpers
    getPixel,
    hasPixel,

    // Mutation state
    isPlacing: placeMutation.isPending,
    placeError: placeMutation.error,
  };
}
