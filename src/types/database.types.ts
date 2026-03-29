// Auto-generated Supabase TypeScript types.
// Regenerate after schema changes:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ToolCondition = 'good' | 'fair' | 'worn'
export type ToolAvailability = 'available' | 'on_loan' | 'unavailable'
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled' | 'returned' | 'overdue'
export type ReportReason = 'inappropriate' | 'spam' | 'broken_item' | 'no_show' | 'other'

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          profile_id: string
          joined_at: string
        }
        Insert: {
          community_id: string
          profile_id: string
          joined_at?: string
        }
        Update: {
          community_id?: string
          profile_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'community_members_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_members_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      admins: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          message: string
          created_at?: string
        }
        Update: {
          type?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          location: string | null
          latitude: number | null
          longitude: number | null
          search_radius: number
          pickup_address: string | null
          bio: string | null
          avatar_url: string | null
          is_suspended: boolean
          warning_count: number
          gdpr_erasure_requested_at: string | null
          last_active_at: string
          created_at: string
          updated_at: string
          test_run_id: string | null
        }
        Insert: {
          id: string
          display_name: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          search_radius?: number
          pickup_address?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_suspended?: boolean
          warning_count?: number
          gdpr_erasure_requested_at?: string | null
          last_active_at?: string
          created_at?: string
          updated_at?: string
          test_run_id?: string | null
        }
        Update: {
          display_name?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          search_radius?: number
          pickup_address?: string | null
          bio?: string | null
          avatar_url?: string | null
          is_suspended?: boolean
          warning_count?: number
          gdpr_erasure_requested_at?: string | null
          last_active_at?: string
          updated_at?: string
          test_run_id?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          category: string
          condition: ToolCondition
          image_url: string | null
          availability: ToolAvailability
          community_id: string | null
          created_at: string
          updated_at: string
          test_run_id: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          category: string
          condition?: ToolCondition
          image_url?: string | null
          availability?: ToolAvailability
          community_id?: string | null
          created_at?: string
          updated_at?: string
          test_run_id?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          category?: string
          condition?: ToolCondition
          image_url?: string | null
          availability?: ToolAvailability
          community_id?: string | null
          updated_at?: string
          test_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tools_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tools_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
        ]
      }
      borrow_requests: {
        Row: {
          id: string
          tool_id: string
          borrower_id: string
          owner_id: string
          status: RequestStatus
          message: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
          test_run_id: string | null
        }
        Insert: {
          id?: string
          tool_id: string
          borrower_id: string
          owner_id: string
          status?: RequestStatus
          message?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
          test_run_id?: string | null
        }
        Update: {
          status?: RequestStatus
          message?: string | null
          start_date?: string | null
          end_date?: string | null
          updated_at?: string
          test_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'borrow_requests_tool_id_fkey'
            columns: ['tool_id']
            isOneToOne: false
            referencedRelation: 'tools'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'borrow_requests_borrower_id_fkey'
            columns: ['borrower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'borrow_requests_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ratings: {
        Row: {
          id: string
          request_id: string
          rater_id: string
          ratee_id: string
          score: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          rater_id: string
          ratee_id: string
          score: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          score?: number
          comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'ratings_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'borrow_requests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ratings_rater_id_fkey'
            columns: ['rater_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ratings_ratee_id_fkey'
            columns: ['ratee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_tool_id: string | null
          reason: ReportReason
          details: string | null
          resolved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          reported_tool_id?: string | null
          reason: ReportReason
          details?: string | null
          resolved?: boolean
          created_at?: string
        }
        Update: {
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey'
            columns: ['reported_user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reports_reported_tool_id_fkey'
            columns: ['reported_tool_id']
            isOneToOne: false
            referencedRelation: 'tools'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tool_condition: ToolCondition
      tool_availability: ToolAvailability
      request_status: RequestStatus
      report_reason: ReportReason
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tool = Database['public']['Tables']['tools']['Row']
export type BorrowRequest = Database['public']['Tables']['borrow_requests']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Community = Database['public']['Tables']['communities']['Row']
export type CommunityMember = Database['public']['Tables']['community_members']['Row']

// Profile without pickup_address (safe to use in client components)
export type PublicProfile = Omit<Profile, 'pickup_address'>

// Community with member count (used in admin lists)
export type CommunityWithMemberCount = Community & { member_count: number }

// Tool with owner profile joined
export type ToolWithOwner = Tool & { owner: PublicProfile }

// Tool with owner and community joined
export type ToolWithOwnerAndCommunity = Tool & {
  owner: PublicProfile
  community: { id: string; name: string } | null
}

// Request with tool and participants joined
export type RequestWithDetails = BorrowRequest & {
  tool: Tool
  borrower: PublicProfile
  owner: PublicProfile
}
