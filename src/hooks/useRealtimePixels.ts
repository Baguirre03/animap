import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToPixelUpdates, unsubscribe } from "@/lib/supabase/realtime";
import { Pixel } from "@/types/pixel";

// Real-time pixel updates hook
export function useRealtimePixels(layerId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!layerId) return;

    console.log(`Subscribing to real-time updates for layer ${layerId}`);

    // Subscribe to pixel updates for this layer
    const channel = subscribeToPixelUpdates(layerId, (updatedPixel: Pixel) => {
      console.log("Received pixel update:", updatedPixel);

      // Update the pixels cache with the new pixel data
      queryClient.setQueryData(
        ["pixels", layerId],
        (oldPixels: Pixel[] = []) => {
          const updatedPixels = [...oldPixels];

          // Find existing pixel at the same coordinates
          const existingIndex = updatedPixels.findIndex(
            (p) => p.x === updatedPixel.x && p.y === updatedPixel.y
          );

          if (existingIndex >= 0) {
            // Update existing pixel
            updatedPixels[existingIndex] = updatedPixel;
          } else {
            // Add new pixel
            updatedPixels.push(updatedPixel);
          }

          return updatedPixels;
        }
      );
    });

    // Cleanup subscription when component unmounts or layerId changes
    return () => {
      console.log(`Unsubscribing from real-time updates for layer ${layerId}`);
      unsubscribe(channel);
    };
  }, [layerId, queryClient]);

  // This hook doesn't return anything - it just manages the subscription
  return null;
}
