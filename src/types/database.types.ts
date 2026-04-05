export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      borrow_requests: {
        Row: {
          borrower_id: string
          created_at: string
          end_date: string | null
          id: string
          message: string | null
          owner_id: string
          start_date: string | null
          status: Database['public']['Enums']['request_status']
          test_run_id: string | null
          tool_id: string
          updated_at: string
        }
        Insert: {
          borrower_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          owner_id: string
          start_date?: string | null
          status?: Database['public']['Enums']['request_status']
          test_run_id?: string | null
          tool_id: string
          updated_at?: string
        }
        Update: {
          borrower_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          owner_id?: string
          start_date?: string | null
          status?: Database['public']['Enums']['request_status']
          test_run_id?: string | null
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
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
          {
            foreignKeyName: 'borrow_requests_tool_id_fkey'
            columns: ['tool_id']
            isOneToOne: false
            referencedRelation: 'tools'
            referencedColumns: ['id']
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_admins: {
        Row: {
          community_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'community_admins_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_admins_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      community_creation_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_reason: string | null
          description: string | null
          id: string
          requested_by: string
          requested_name: string
          resulting_community_id: string | null
          status: Database['public']['Enums']['community_request_status']
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description?: string | null
          id?: string
          requested_by: string
          requested_name: string
          resulting_community_id?: string | null
          status?: Database['public']['Enums']['community_request_status']
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_reason?: string | null
          description?: string | null
          id?: string
          requested_by?: string
          requested_name?: string
          resulting_community_id?: string | null
          status?: Database['public']['Enums']['community_request_status']
        }
        Relationships: [
          {
            foreignKeyName: 'community_creation_requests_decided_by_fkey'
            columns: ['decided_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_creation_requests_requested_by_fkey'
            columns: ['requested_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_creation_requests_resulting_community_id_fkey'
            columns: ['resulting_community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
        ]
      }
      community_join_requests: {
        Row: {
          community_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          message: string | null
          profile_id: string
          status: Database['public']['Enums']['community_request_status']
        }
        Insert: {
          community_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          message?: string | null
          profile_id: string
          status?: Database['public']['Enums']['community_request_status']
        }
        Update: {
          community_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          message?: string | null
          profile_id?: string
          status?: Database['public']['Enums']['community_request_status']
        }
        Relationships: [
          {
            foreignKeyName: 'community_join_requests_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_join_requests_decided_by_fkey'
            columns: ['decided_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'community_join_requests_profile_id_fkey'
            columns: ['profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          joined_at: string
          profile_id: string
        }
        Insert: {
          community_id: string
          joined_at?: string
          profile_id: string
        }
        Update: {
          community_id?: string
          joined_at?: string
          profile_id?: string
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
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          type: Database['public']['Enums']['feedback_type']
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          type: Database['public']['Enums']['feedback_type']
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          type?: Database['public']['Enums']['feedback_type']
          user_id?: string | null
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
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          gdpr_erasure_requested_at: string | null
          id: string
          is_suspended: boolean
          last_active_at: string
          latitude: number | null
          location: string | null
          longitude: number | null
          pickup_address: string | null
          search_radius: number
          test_run_id: string | null
          updated_at: string
          warning_count: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          gdpr_erasure_requested_at?: string | null
          id: string
          is_suspended?: boolean
          last_active_at?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          pickup_address?: string | null
          search_radius?: number
          test_run_id?: string | null
          updated_at?: string
          warning_count?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          gdpr_erasure_requested_at?: string | null
          id?: string
          is_suspended?: boolean
          last_active_at?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          pickup_address?: string | null
          search_radius?: number
          test_run_id?: string | null
          updated_at?: string
          warning_count?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          ratee_id: string
          rater_id: string
          request_id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id: string
          rater_id: string
          request_id: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          ratee_id?: string
          rater_id?: string
          request_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: 'ratings_ratee_id_fkey'
            columns: ['ratee_id']
            isOneToOne: false
            referencedRelation: 'profiles'
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
            foreignKeyName: 'ratings_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'borrow_requests'
            referencedColumns: ['id']
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: Database['public']['Enums']['report_reason']
          reported_tool_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved: boolean
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: Database['public']['Enums']['report_reason']
          reported_tool_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved?: boolean
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: Database['public']['Enums']['report_reason']
          reported_tool_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reported_tool_id_fkey'
            columns: ['reported_tool_id']
            isOneToOne: false
            referencedRelation: 'tools'
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
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      tools: {
        Row: {
          availability: Database['public']['Enums']['tool_availability']
          category: string
          community_id: string | null
          condition: Database['public']['Enums']['tool_condition']
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          owner_id: string
          search_vector: unknown
          test_run_id: string | null
          updated_at: string
        }
        Insert: {
          availability?: Database['public']['Enums']['tool_availability']
          category: string
          community_id?: string | null
          condition?: Database['public']['Enums']['tool_condition']
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          owner_id: string
          search_vector?: unknown
          test_run_id?: string | null
          updated_at?: string
        }
        Update: {
          availability?: Database['public']['Enums']['tool_availability']
          category?: string
          community_id?: string | null
          condition?: Database['public']['Enums']['tool_condition']
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          owner_id?: string
          search_vector?: unknown
          test_run_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tools_community_id_fkey'
            columns: ['community_id']
            isOneToOne: false
            referencedRelation: 'communities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tools_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      usage_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      haversine_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      tools_within_radius:
        | {
            Args: {
              p_category?: string
              p_lat: number
              p_limit?: number
              p_lng: number
              p_offset?: number
              p_radius_km?: number
              p_search?: string
              p_user_id?: string
            }
            Returns: {
              availability: string
              category: string
              community_id: string
              condition: string
              created_at: string
              description: string
              distance_km: number
              id: string
              image_url: string
              name: string
              owner_id: string
              test_run_id: string
              updated_at: string
            }[]
          }
        | {
            Args: {
              p_category?: string
              p_lat: number
              p_limit?: number
              p_lng: number
              p_offset?: number
              p_radius_km?: number
              p_search?: string
            }
            Returns: {
              availability: string
              category: string
              condition: string
              created_at: string
              description: string
              distance_km: number
              id: string
              image_url: string
              name: string
              owner_id: string
              test_run_id: string
              updated_at: string
            }[]
          }
    }
    Enums: {
      community_request_status: 'pending' | 'approved' | 'denied' | 'cancelled'
      feedback_type: 'feedback' | 'bug' | 'suggestion'
      report_reason: 'inappropriate' | 'spam' | 'broken_item' | 'no_show' | 'other'
      request_status: 'pending' | 'approved' | 'denied' | 'cancelled' | 'returned' | 'overdue'
      tool_availability: 'available' | 'on_loan' | 'unavailable'
      tool_condition: 'good' | 'fair' | 'worn'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      community_request_status: ['pending', 'approved', 'denied', 'cancelled'],
      feedback_type: ['feedback', 'bug', 'suggestion'],
      report_reason: ['inappropriate', 'spam', 'broken_item', 'no_show', 'other'],
      request_status: ['pending', 'approved', 'denied', 'cancelled', 'returned', 'overdue'],
      tool_availability: ['available', 'on_loan', 'unavailable'],
      tool_condition: ['good', 'fair', 'worn'],
    },
  },
} as const

// ────────────────────────────────────────────────────────────────
// Convenience type aliases
// ────────────────────────────────────────────────────────────────
export type ToolCondition = Database['public']['Enums']['tool_condition']
export type ToolAvailability = Database['public']['Enums']['tool_availability']
export type RequestStatus = Database['public']['Enums']['request_status']
export type ReportReason = Database['public']['Enums']['report_reason']
export type CommunityRequestStatus = Database['public']['Enums']['community_request_status']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tool = Database['public']['Tables']['tools']['Row']
export type BorrowRequest = Database['public']['Tables']['borrow_requests']['Row']
export type Rating = Database['public']['Tables']['ratings']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type Community = Database['public']['Tables']['communities']['Row']
export type CommunityMember = Database['public']['Tables']['community_members']['Row']
export type CommunityAdmin = Database['public']['Tables']['community_admins']['Row']
export type CommunityJoinRequest = Database['public']['Tables']['community_join_requests']['Row']
export type CommunityCreationRequest =
  Database['public']['Tables']['community_creation_requests']['Row']

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
