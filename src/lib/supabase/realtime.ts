import { supabase } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Pixel } from '@/types/pixel'

type PixelPayload = Pixel

type LayerPayload = {
  id: number
  section_id: number
  layer_index: number
  is_active: boolean
  created_at: string
}

// Subscribe to pixel updates for a specific layer
export const subscribeToPixelUpdates = (
  layerId: number, 
  onUpdate: (payload: PixelPayload) => void
) => {
  const channel = supabase
    .channel(`pixels:layer_id=eq.${layerId}`)
    .on(
      'postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'pixels',
        filter: `layer_id=eq.${layerId}`
      }, 
      (payload) => {
        console.log('Pixel update:', payload)
        if (payload.new) {
          onUpdate(payload.new as PixelPayload)
        }
      }
    )
    .subscribe()

  return channel
}

// Subscribe to layer changes for a section
export const subscribeToLayerUpdates = (
  sectionId: number,
  onUpdate: (payload: LayerPayload) => void
) => {
  const channel = supabase
    .channel(`layers:section_id=eq.${sectionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'layers',
        filter: `section_id=eq.${sectionId}`
      },
      (payload) => {
        console.log('Layer update:', payload)
        if (payload.new) {
          onUpdate(payload.new as LayerPayload)
        }
      }
    )
    .subscribe()

  return channel
}

// Unsubscribe from a channel
export const unsubscribe = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel)
}
