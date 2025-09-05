"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Section } from "@/types/board";

interface SectionGridProps {
  sections: Section[];
}

const CANVAS_SIZE = 1000; // Square canvas like r/place
const PIXEL_SIZE = 1; // Each pixel is 1x1 (will be scaled for viewing)
const SCALE = 4; // How much to scale pixels for visibility

export default function SectionGrid({ sections }: SectionGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(SCALE);

  // Create pixel data array - simple 2D array like r/place
  const pixelData = useRef(new Uint8Array(CANVAS_SIZE * CANVAS_SIZE));

  // Initialize with white background (like r/place starts)
  useEffect(() => {
    pixelData.current.fill(255); // Fill with white (255)
  }, []);

  // Convert sections to pixels
  useEffect(() => {
    if (!sections.length) return;

    // Reset to white
    pixelData.current.fill(255);

    // Draw sections as colored pixels
    sections.forEach((section) => {
      const x = section.position_x;
      const y = section.position_y;

      if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
        const index = y * CANVAS_SIZE + x;
        pixelData.current[index] = 100; // Gray color for sections
      }
    });

    drawCanvas();
  }, [sections]);

  // Main canvas drawing function
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size based on scale
    const displaySize = CANVAS_SIZE * scale;
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Create ImageData for efficient pixel manipulation
    const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);

    // Convert our pixel data to RGBA
    for (let i = 0; i < CANVAS_SIZE * CANVAS_SIZE; i++) {
      const pixelValue = pixelData.current[i];
      const rgbaIndex = i * 4;

      if (pixelValue === 255) {
        // White pixel (empty)
        imageData.data[rgbaIndex] = 255; // R
        imageData.data[rgbaIndex + 1] = 255; // G
        imageData.data[rgbaIndex + 2] = 255; // B
        imageData.data[rgbaIndex + 3] = 255; // A
      } else {
        // Section pixel (blue like your theme)
        imageData.data[rgbaIndex] = 59; // R
        imageData.data[rgbaIndex + 1] = 130; // G
        imageData.data[rgbaIndex + 2] = 246; // B
        imageData.data[rgbaIndex + 3] = 255; // A
      }
    }

    // Draw the pixel data to a temporary canvas at 1:1 scale
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = CANVAS_SIZE;
    tempCanvas.height = CANVAS_SIZE;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.putImageData(imageData, 0, 0);

    // Scale up to display canvas using nearest-neighbor (pixelated scaling)
    ctx.imageSmoothingEnabled = false; // Keeps pixels crisp
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      CANVAS_SIZE,
      CANVAS_SIZE,
      0,
      0,
      displaySize,
      displaySize
    );
  }, [scale]);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(1, Math.min(20, prev * delta)));
  }, []);

  // Handle pixel clicking
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / scale);
      const y = Math.floor((e.clientY - rect.top) / scale);

      if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
        console.log(`Clicked pixel at (${x}, ${y})`);

        // Find if there's a section at this position
        const section = sections.find(
          (s) => s.position_x === x && s.position_y === y
        );
        if (section) {
          console.log(`Section: ${section.name}`);
        }
      }
    },
    [scale, sections]
  );

  // Redraw when scale changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (!sections.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">No sections available</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100 overflow-auto">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-400 cursor-crosshair"
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        />

        {/* Simple zoom indicator */}
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-sm">
          Zoom: {scale}x
        </div>
      </div>
    </div>
  );
}
