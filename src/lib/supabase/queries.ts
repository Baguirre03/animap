import { supabase } from './client'
import { Pixel, PlacePixelRequest } from '@/types/pixel'

// Pixel queries
export const pixelQueries = {
  // Get all pixels for a layer
  getPixelsForLayer: async (layerId: number): Promise<Pixel[]> => {
    const { data, error } = await supabase
      .from('pixels')
      .select('*')
      .eq('layer_id', layerId)
    
    if (error) throw error
    return data as Pixel[]
  },

  // Place/update a pixel
  placePixel: async (request: PlacePixelRequest): Promise<Pixel[]> => {
    const { data, error } = await supabase
      .from('pixels')
      .upsert({ 
        layer_id: request.layerId, 
        x: request.x, 
        y: request.y, 
        color: request.color, 
        updated_by: request.updatedBy,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data as Pixel[]
  }
}

// Section queries
export const sectionQueries = {
  // Get all sections
  getSections: async () => {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('position_x', { ascending: true })
      .order('position_y', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Layer queries
export const layerQueries = {
  // Get layers for a section
  getLayersForSection: async (sectionId: number) => {
    const { data, error } = await supabase
      .from('layers')
      .select('*')
      .eq('section_id', sectionId)
      .order('layer_index', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get active layer for a section
  getActiveLayer: async (sectionId: number) => {
    const { data, error } = await supabase
      .from('layers')
      .select('*')
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    return data
  }
}
