"use client";

import { useSections } from "@/hooks/useSections";
import { useZoomPan } from "@/hooks/useZoomPan";
import SectionGrid from "@/components/board/SectionGrid";

export default function Home() {
  const { sections, isLoading } = useSections();
  const { zoom, resetView, getTransformStyle, getContainerProps } = useZoomPan({
    minZoom: 1.0, // Can't zoom out below 100%
    maxZoom: 10.0, // Can zoom in up to 1000%
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading sections...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-100 overflow-hidden">
      {/* Controls - only show when zoomed in */}
      {zoom > 1 && (
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={resetView}
            className="px-3 py-2 bg-white rounded shadow hover:bg-gray-50 text-sm"
          >
            Reset View
          </button>
          <div className="px-3 py-2 bg-white rounded shadow text-sm">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      )}

      {/* Main container */}
      <div
        {...getContainerProps()}
        className="w-full h-full"
        style={{ cursor: zoom > 1 ? "grab" : "default" }}
      >
        {/* Sections grid */}
        <div style={getTransformStyle()}>
          <SectionGrid sections={sections} />
        </div>
      </div>
    </div>
  );
}
