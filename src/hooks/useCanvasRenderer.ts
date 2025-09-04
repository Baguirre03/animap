import { useRef, useCallback, useEffect } from "react";
import { Pixel } from "@/types/pixel";
import { GRID_SIZE } from "@/lib/utils/constants";

interface CanvasRendererOptions {
  pixelSize?: number;
  showGrid?: boolean;
  backgroundColor?: string;
  gridColor?: string;
}

// Canvas rendering optimization hook
export function useCanvasRenderer(options: CanvasRendererOptions = {}) {
  const {
    pixelSize = 10,
    showGrid = true,
    backgroundColor = "#f0f0f0",
    gridColor = "#ddd",
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size
    canvas.width = GRID_SIZE * pixelSize;
    canvas.height = GRID_SIZE * pixelSize;

    // Configure context for crisp pixels
    context.imageSmoothingEnabled = false;
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = context;
  }, [pixelSize, backgroundColor]);

  // Clear canvas for rerendering (internal use)
  const clearForRerender = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [backgroundColor]);

  // Draw grid lines
  const drawGrid = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas || !showGrid) return;

    context.strokeStyle = gridColor;
    context.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= GRID_SIZE; x++) {
      const xPos = x * pixelSize + 0.5; // +0.5 for crisp lines
      context.beginPath();
      context.moveTo(xPos, 0);
      context.lineTo(xPos, canvas.height);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= GRID_SIZE; y++) {
      const yPos = y * pixelSize + 0.5; // +0.5 for crisp lines
      context.beginPath();
      context.moveTo(0, yPos);
      context.lineTo(canvas.width, yPos);
      context.stroke();
    }
  }, [pixelSize, showGrid, gridColor]);

  // Draw a single pixel
  const drawPixel = useCallback(
    (x: number, y: number, color: string) => {
      const context = contextRef.current;
      if (!context) return;

      // Validate coordinates
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

      context.fillStyle = color;
      context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    },
    [pixelSize]
  );

  // Draw multiple pixels efficiently
  const drawPixels = useCallback(
    (pixels: Pixel[]) => {
      const context = contextRef.current;
      if (!context) return;

      // Group pixels by color for batch drawing
      const pixelsByColor: { [color: string]: Pixel[] } = {};

      pixels.forEach((pixel) => {
        if (!pixelsByColor[pixel.color]) {
          pixelsByColor[pixel.color] = [];
        }
        pixelsByColor[pixel.color].push(pixel);
      });

      // Draw pixels grouped by color
      Object.entries(pixelsByColor).forEach(([color, colorPixels]) => {
        context.fillStyle = color;
        colorPixels.forEach((pixel) => {
          if (
            pixel.x >= 0 &&
            pixel.x < GRID_SIZE &&
            pixel.y >= 0 &&
            pixel.y < GRID_SIZE
          ) {
            context.fillRect(
              pixel.x * pixelSize,
              pixel.y * pixelSize,
              pixelSize,
              pixelSize
            );
          }
        });
      });
    },
    [pixelSize]
  );

  // Render full scene (clear + pixels + grid)
  const renderScene = useCallback(
    (pixels: Pixel[]) => {
      clearForRerender();
      drawPixels(pixels);
      drawGrid();
    },
    [clearForRerender, drawPixels, drawGrid]
  );

  // Convert mouse coordinates to pixel coordinates
  const getPixelCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left) / pixelSize);
      const y = Math.floor((clientY - rect.top) / pixelSize);

      // Validate coordinates
      if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;

      return { x, y };
    },
    [pixelSize]
  );

  // Get canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    return {
      width: GRID_SIZE * pixelSize,
      height: GRID_SIZE * pixelSize,
      pixelSize,
      gridSize: GRID_SIZE,
    };
  }, [pixelSize]);

  return {
    // Refs
    canvasRef,

    // Drawing functions
    drawGrid,
    drawPixel,
    drawPixels,
    renderScene,

    // Utilities
    getPixelCoordinates,
    getCanvasDimensions,

    // Config
    pixelSize,
    showGrid,
  };
}
