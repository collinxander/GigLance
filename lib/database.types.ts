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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          skills: string[]
          portfolio_url: string | null
          location: string | null
          hourly_rate: number | null
          is_available: boolean
          visibility: 'public' | 'private' | 'connections'
          notification_preferences: {
            email: boolean
            new_messages: boolean
            application_updates: boolean
            gig_recommendations: boolean
          }
          social_links: {
            github: string | null
            linkedin: string | null
            twitter: string | null
            website: string | null
          }
          user_type: 'client' | 'creative' | null
          interests: string[]
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          skills?: string[]
          portfolio_url?: string | null
          location?: string | null
          hourly_rate?: number | null
          is_available?: boolean
          visibility?: 'public' | 'private' | 'connections'
          notification_preferences?: {
            email: boolean
            new_messages: boolean
            application_updates: boolean
            gig_recommendations: boolean
          }
          social_links?: {
            github: string | null
            linkedin: string | null
            twitter: string | null
            website: string | null
          }
          user_type?: 'client' | 'creative' | null
          interests?: string[]
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          skills?: string[]
          portfolio_url?: string | null
          location?: string | null
          hourly_rate?: number | null
          is_available?: boolean
          visibility?: 'public' | 'private' | 'connections'
          notification_preferences?: {
            email: boolean
            new_messages: boolean
            application_updates: boolean
            gig_recommendations: boolean
          }
          social_links?: {
            github: string | null
            linkedin: string | null
            twitter: string | null
            website: string | null
          }
          user_type?: 'client' | 'creative' | null
          interests?: string[]
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      interest_categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due'
          payment_method_id: string | null
          start_date: string
          end_date: string | null
          created_at: string
          updated_at: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'canceled' | 'past_due'
          payment_method_id?: string | null
          start_date: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due'
          payment_method_id?: string | null
          start_date?: string
          end_date?: string | null
          created_at?: string
          updated_at?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean | null
        }
      }
      gigs: {
        Row: {
          id: string
          title: string
          description: string
          budget: number
          category: string
          location: string
          skills: string[]
          timeline: string | null
          remote_ok: boolean
          status: 'open' | 'in_progress' | 'completed'
          client_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          budget: number
          category: string
          location: string
          skills?: string[]
          timeline?: string | null
          remote_ok?: boolean
          status?: 'open' | 'in_progress' | 'completed'
          client_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          budget?: number
          category?: string
          location?: string
          skills?: string[]
          timeline?: string | null
          remote_ok?: boolean
          status?: 'open' | 'in_progress' | 'completed'
          client_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_gigs: {
        Row: {
          id: string
          user_id: string
          gig_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gig_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gig_id?: string
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          gig_id: string
          creative_id: string
          cover_letter: string
          proposal_amount: number
          estimated_timeline: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gig_id: string
          creative_id: string
          cover_letter: string
          proposal_amount: number
          estimated_timeline?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gig_id?: string
          creative_id?: string
          cover_letter?: string
          proposal_amount?: number
          estimated_timeline?: string | null
          status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          client_id: string
          creative_id: string
          gig_id: string | null
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          creative_id: string
          gig_id?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          creative_id?: string
          gig_id?: string | null
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          status: 'sent' | 'delivered' | 'read'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          status?: 'sent' | 'delivered' | 'read'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          status?: 'sent' | 'delivered' | 'read'
          created_at?: string
          updated_at?: string
        }
      }
      file_attachments: {
        Row: {
          id: string
          message_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          created_at?: string
        }
      }
      message_notifications: {
        Row: {
          id: string
          user_id: string
          message_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
} 