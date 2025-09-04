"use client";

import { createContext, useContext } from "react";
import { supabase } from "@/lib/supabase/client";

// Create context for Supabase client
const SupabaseContext = createContext(supabase);

// Hook to use Supabase client anywhere in the app
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};

// Supabase provider to make client available throughout the app
export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
