import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sectionQueries } from "@/lib/supabase/queries";
import { Section } from "@/types/board";

// Section data management hook
export function useSections() {
  // Track current active section
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

  // Get all sections
  const {
    data: sections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sections"],
    // queryFn: () => sectionQueries.getSections(),
    queryFn: () => {
      // For development: create 100 mock sections if database is empty
      const mockSections: Section[] = [];
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          mockSections.push({
            id: y * 10 + x + 1,
            name: `Section ${x}-${y}`,
            position_x: x,
            position_y: y,
            created_at: new Date().toISOString(),
          });
        }
      }

      // // Try real query first, fallback to mock data if it fails
      // return sectionQueries.getSections().catch(() => {
      //   console.log("Using mock sections data for development");
      //   return mockSections;
      // });
      return mockSections;
    },
    staleTime: 10 * 60 * 1000, // Consider sections fresh for 10 minutes
  });

  // Get current section data
  const currentSection =
    sections.find((section) => section.id === currentSectionId) || null;

  // Switch to a different section
  const switchToSection = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      setCurrentSectionId(sectionId);
    }
  };

  // Auto-select first section if none selected
  if (!currentSectionId && sections.length > 0) {
    setCurrentSectionId(sections[0].id);
  }

  // Helper to get section by position
  const getSectionByPosition = (x: number, y: number): Section | undefined => {
    return sections.find(
      (section) => section.position_x === x && section.position_y === y
    );
  };

  // Get sections in grid format for navigation
  const getSectionsGrid = () => {
    const grid: { [key: string]: Section } = {};
    sections.forEach((section) => {
      const key = `${section.position_x},${section.position_y}`;
      grid[key] = section;
    });
    return grid;
  };

  return {
    // Data
    sections,
    currentSection,
    currentSectionId,

    // Loading state
    isLoading,
    error,

    // Actions
    switchToSection,
    refetch,

    // Helpers
    getSectionByPosition,
    getSectionsGrid,
  };
}
