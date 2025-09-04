import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToLayerUpdates, unsubscribe } from "@/lib/supabase/realtime";
import { useLayers } from "./useLayers";
import { Layer } from "@/types/board";

// Active layer state hook
export function useActiveLayer(sectionId: number) {
  const queryClient = useQueryClient();
  const { activeLayer, isLoadingActiveLayer, refetchActiveLayer } =
    useLayers(sectionId);

  // Local state for current active layer (for immediate UI updates)
  const [currentActiveLayer, setCurrentActiveLayer] = useState<Layer | null>(
    null
  );

  // Sync local state with server state
  useEffect(() => {
    if (activeLayer) {
      setCurrentActiveLayer(activeLayer);
    }
  }, [activeLayer]);

  // Subscribe to real-time layer updates
  useEffect(() => {
    if (!sectionId) return;

    console.log(`Subscribing to layer updates for section ${sectionId}`);

    const channel = subscribeToLayerUpdates(sectionId, (updatedLayer) => {
      console.log("Received layer update:", updatedLayer);

      // If this is the active layer update, sync local state
      if (updatedLayer.is_active) {
        setCurrentActiveLayer(updatedLayer);

        // Update the active layer cache
        queryClient.setQueryData(["activeLayer", sectionId], updatedLayer);
      }

      // Update the layers cache
      queryClient.setQueryData(
        ["layers", sectionId],
        (oldLayers: Layer[] = []) => {
          const updatedLayers = [...oldLayers];
          const existingIndex = updatedLayers.findIndex(
            (l) => l.id === updatedLayer.id
          );

          if (existingIndex >= 0) {
            updatedLayers[existingIndex] = updatedLayer;
          } else {
            updatedLayers.push(updatedLayer);
          }

          return updatedLayers;
        }
      );
    });

    return () => {
      console.log(`Unsubscribing from layer updates for section ${sectionId}`);
      unsubscribe(channel);
    };
  }, [sectionId, queryClient]);

  // Helper to get the current active layer ID
  const activeLayerId = currentActiveLayer?.id || activeLayer?.id;

  // Helper to get the current active layer index
  const activeLayerIndex =
    currentActiveLayer?.layer_index || activeLayer?.layer_index;

  // Helper to check if a specific layer is active
  const isLayerActive = (layerIndex: number): boolean => {
    return activeLayerIndex === layerIndex;
  };

  return {
    // Data
    activeLayer: currentActiveLayer || activeLayer,
    activeLayerId,
    activeLayerIndex,

    // Loading state
    isLoading: isLoadingActiveLayer,

    // Actions
    refetchActiveLayer,

    // Helpers
    isLayerActive,
  };
}
