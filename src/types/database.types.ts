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
      profiles: {
        Row: {
          id: string
          display_name: string
          location: string | null
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
          updated_at?: string
          test_run_id?: string | null
        }
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
        Update: never
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
      }
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tool = Database['public']['Tables']['tools']['Row']
export type BorrowRequest = Database['public']['Tables']['borrow_requests']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

// Profile without pickup_address (safe to use in client components)
export type PublicProfile = Omit<Profile, 'pickup_address'>

// Tool with owner profile joined
export type ToolWithOwner = Tool & { owner: PublicProfile }

// Request with tool and participants joined
export type RequestWithDetails = BorrowRequest & {
  tool: Tool
  borrower: PublicProfile
  owner: PublicProfile
}
