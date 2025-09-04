"use client";

import { Section } from "@/types/board";

interface SectionGridProps {
  sections: Section[];
}

export default function SectionGrid({ sections }: SectionGridProps) {
  if (!sections.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">No sections available</div>
      </div>
    );
  }

  // Calculate grid bounds
  const minX = Math.min(...sections.map((s) => s.position_x));
  const maxX = Math.max(...sections.map((s) => s.position_x));
  const minY = Math.min(...sections.map((s) => s.position_y));
  const maxY = Math.max(...sections.map((s) => s.position_y));

  const gridWidth = maxX - minX + 1;
  const gridHeight = maxY - minY + 1;

  // Create a map for quick section lookup
  const sectionMap = new Map<string, Section>();
  sections.forEach((section) => {
    const key = `${section.position_x},${section.position_y}`;
    sectionMap.set(key, section);
  });

  const handleSectionClick = (section: Section) => {
    console.log(
      `Clicked section: ${section.name} at (${section.position_x}, ${section.position_y})`
    );
    // TODO: Navigate to section detail view
  };

  // Create grid of all positions (including empty ones)
  const gridCells = [];
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const x = minX + col;
      const y = minY + row;
      const key = `${x},${y}`;
      const section = sectionMap.get(key);
      gridCells.push({ key, section, x, y });
    }
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
        gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      {gridCells.map(({ key, section, x, y }) => (
        <div
          key={key}
          className={`outline outline-gray-300 ${
            section
              ? "bg-blue-100 hover:bg-blue-200 cursor-pointer transition-colors"
              : "bg-gray-50"
          }`}
          onClick={section ? () => handleSectionClick(section) : undefined}
        >
          {section && (
            <div className="flex flex-col items-center justify-center h-full p-1">
              <div className="text-xs font-semibold text-gray-800 text-center leading-tight"></div>
              {gridWidth <= 15 && <div className="text-xs text-gray-600"></div>}
              <div
                className={`${
                  gridWidth > 15 ? "mt-0.5 w-4 h-4" : "mt-1 w-6 h-6"
                } bg-white border border-gray-400 rounded`}
              >
                {/* Placeholder for section preview */}
                <div className="w-full h-full bg-gradient-to-br from-blue-300 to-purple-300 rounded" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
