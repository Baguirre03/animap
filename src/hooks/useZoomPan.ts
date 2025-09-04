import { useState, useRef, useCallback, useEffect } from "react";

interface ZoomPanState {
  zoom: number;
  pan: { x: number; y: number };
}

interface ZoomPanOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  initialPan?: { x: number; y: number };
}

export function useZoomPan(options: ZoomPanOptions = {}) {
  const {
    minZoom = 0.1,
    maxZoom = 5,
    initialZoom = 1,
    initialPan = { x: 0, y: 0 },
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState(initialPan);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Constrain pan to keep content within viewport bounds
  const constrainPan = useCallback(
    (newPan: { x: number; y: number }, currentZoom: number) => {
      if (currentZoom <= 1) return { x: 0, y: 0 };

      const container = containerRef.current;
      if (!container) return newPan;

      const viewportWidth = container.clientWidth;
      const viewportHeight = container.clientHeight;

      // Calculate content size when zoomed
      const contentWidth = viewportWidth * currentZoom;
      const contentHeight = viewportHeight * currentZoom;

      // Calculate max pan values to keep content within bounds
      const maxPanX = 0;
      const minPanX = viewportWidth - contentWidth;
      const maxPanY = 0;
      const minPanY = viewportHeight - contentHeight;

      return {
        x: Math.max(minPanX, Math.min(maxPanX, newPan.x)),
        y: Math.max(minPanY, Math.min(maxPanY, newPan.y)),
      };
    },
    []
  );

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Zoom factor
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * zoomFactor));

      // Calculate new pan to zoom towards mouse position
      const zoomChange = newZoom / zoom;
      const newPan = {
        x: mouseX - (mouseX - pan.x) * zoomChange,
        y: mouseY - (mouseY - pan.y) * zoomChange,
      };

      // Constrain pan to keep content within bounds
      const constrainedPan = constrainPan(newPan, newZoom);

      setZoom(newZoom);
      setPan(constrainedPan);
    },
    [zoom, pan, minZoom, maxZoom, constrainPan]
  );

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only allow panning when zoomed in above 100%
      if (zoom <= 1) return;

      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    },
    [pan, zoom]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || zoom <= 1) return;

      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      // Constrain pan to keep content within bounds
      const constrainedPan = constrainPan(newPan, zoom);
      setPan(constrainedPan);
    },
    [isDragging, dragStart, zoom, constrainPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile zoom/pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && zoom > 1) {
        // Single touch - start dragging (only when zoomed in)
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    },
    [pan, zoom]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging && zoom > 1) {
        // Single touch - drag (only when zoomed in)
        const touch = e.touches[0];
        const newPan = {
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        };

        // Constrain pan to keep content within bounds
        const constrainedPan = constrainPan(newPan, zoom);
        setPan(constrainedPan);
      }
    },
    [isDragging, dragStart, zoom, constrainPan]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPan(initialPan);
  }, [initialZoom, initialPan]);

  // Set specific zoom level
  const setZoomLevel = useCallback(
    (newZoom: number) => {
      setZoom(Math.max(minZoom, Math.min(maxZoom, newZoom)));
    },
    [minZoom, maxZoom]
  );

  // Get transform style for the zoomable content
  const getTransformStyle = useCallback(() => {
    return {
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "0 0",
      transition: isDragging ? "none" : "transform 0.1s ease-out",
    };
  }, [pan, zoom, isDragging]);

  // Get container props
  const getContainerProps = useCallback(() => {
    return {
      ref: containerRef,
      className: "cursor-grab active:cursor-grabbing",
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    };
  }, [
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return {
    // State
    zoom,
    pan,
    isDragging,

    // Actions
    resetView,
    setZoomLevel,

    // Helpers
    getTransformStyle,
    getContainerProps,
  };
}
