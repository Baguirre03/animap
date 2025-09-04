// API response types
export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

export interface ApiError {
  message: string
  code?: string
  details?: string
}

// Supabase specific response types
export interface SupabaseResponse<T> {
  data: T | null
  error: {
    message: string
    details: string
    hint: string
    code: string
  } | null
}

// Realtime payload types
export interface RealtimePayload<T = unknown> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T | null
  old: T | null
  schema: string
  table: string
}
