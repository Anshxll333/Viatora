export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          passport_number: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          passport_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          passport_number?: string | null
          created_at?: string
        }
      }
      destinations: {
        Row: {
          id: string
          slug: string | null
          city: string
          country: string
          country_code: string
          latitude: number | null
          longitude: number | null
          description: string | null
          stamp: string | null
          tint: string | null
          created_at: string
        }
        Insert: {
          id: string
          slug?: string | null
          city: string
          country: string
          country_code: string
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          stamp?: string | null
          tint?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string | null
          city?: string
          country?: string
          country_code?: string
          latitude?: number | null
          longitude?: number | null
          description?: string | null
          stamp?: string | null
          tint?: string | null
          created_at?: string
        }
      }
      user_stamps: {
        Row: {
          id: string
          user_id: string
          destination_id: string
          visited_at: string | null
          unlocked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          destination_id: string
          visited_at?: string | null
          unlocked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          destination_id?: string
          visited_at?: string | null
          unlocked_at?: string | null
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          destination_id: string
          title: string | null
          content: string | null
          visited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          destination_id: string
          title?: string | null
          content?: string | null
          visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          destination_id?: string
          title?: string | null
          content?: string | null
          visited_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memory_photos: {
        Row: {
          id: string
          memory_id: string
          photo_url: string
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          photo_url: string
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          photo_url?: string
          created_at?: string
        }
      }
    }
  }
}
