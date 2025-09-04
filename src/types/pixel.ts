// Pixel-related types
export interface Pixel {
  id: number
  layer_id: number
  x: number
  y: number
  color: string
  updated_at: string
  updated_by: string | null
}

export interface PlacePixelRequest {
  layerId: number
  x: number
  y: number
  color: string
  updatedBy: string
}

export interface PixelCoordinates {
  x: number
  y: number
}

export interface PixelUpdate {
  color: string
  updatedBy: string
}
