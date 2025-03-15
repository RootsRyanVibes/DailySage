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
      categories: {
        Row: {
          id: string
          name: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string | null
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string | null
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      favorite_quotes: {
        Row: {
          id: string
          user_id: string | null
          quote_id: string | null
          collection_id: string | null
          note: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          quote_id?: string | null
          collection_id?: string | null
          note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          quote_id?: string | null
          collection_id?: string | null
          note?: string | null
          created_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          text: string
          author: string
          category_id: string | null
          source: string
          created_at: string | null
          times_shown: number | null
          likes: number | null
        }
        Insert: {
          id?: string
          text: string
          author: string
          category_id?: string | null
          source?: string
          created_at?: string | null
          times_shown?: number | null
          likes?: number | null
        }
        Update: {
          id?: string
          text?: string
          author?: string
          category_id?: string | null
          source?: string
          created_at?: string | null
          times_shown?: number | null
          likes?: number | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string | null
          notification_time: string
          category_ids: string[] | null
          notifications_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          notification_time?: string
          category_ids?: string[] | null
          notifications_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          notification_time?: string
          category_ids?: string[] | null
          notifications_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}