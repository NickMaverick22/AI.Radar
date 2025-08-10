export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_weights: {
        Row: {
          category: string
          updated_at: string | null
          updated_by: string | null
          weight_json: Json
        }
        Insert: {
          category: string
          updated_at?: string | null
          updated_by?: string | null
          weight_json: Json
        }
        Update: {
          category?: string
          updated_at?: string | null
          updated_by?: string | null
          weight_json?: Json
        }
        Relationships: []
      }
      ranking_daily: {
        Row: {
          as_of_date: string
          category: string
          delta_vs_yesterday_int: number | null
          rank_int: number
          score_float: number
          tool_id: string
        }
        Insert: {
          as_of_date: string
          category: string
          delta_vs_yesterday_int?: number | null
          rank_int: number
          score_float: number
          tool_id: string
        }
        Update: {
          as_of_date?: string
          category?: string
          delta_vs_yesterday_int?: number | null
          rank_int?: number
          score_float?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_daily_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_signals_raw: {
        Row: {
          as_of_date: string
          category: string
          signal_key: string
          signal_value_float: number
          tool_id: string
        }
        Insert: {
          as_of_date: string
          category: string
          signal_key: string
          signal_value_float: number
          tool_id: string
        }
        Update: {
          as_of_date?: string
          category?: string
          signal_key?: string
          signal_value_float?: number
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_signals_raw_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      releases: {
        Row: {
          changelog_hash: string | null
          id: string
          notes_md: string | null
          release_date: string | null
          source_url: string | null
          tool_id: string | null
          version: string | null
        }
        Insert: {
          changelog_hash?: string | null
          id?: string
          notes_md?: string | null
          release_date?: string | null
          source_url?: string | null
          tool_id?: string | null
          version?: string | null
        }
        Update: {
          changelog_hash?: string | null
          id?: string
          notes_md?: string | null
          release_date?: string | null
          source_url?: string | null
          tool_id?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "releases_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          credibility_score: number | null
          domain: string | null
          id: string
          last_crawled_at: string | null
          source_type: string | null
          tool_id: string | null
          url: string | null
        }
        Insert: {
          credibility_score?: number | null
          domain?: string | null
          id?: string
          last_crawled_at?: string | null
          source_type?: string | null
          tool_id?: string | null
          url?: string | null
        }
        Update: {
          credibility_score?: number | null
          domain?: string | null
          id?: string
          last_crawled_at?: string | null
          source_type?: string | null
          tool_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sources_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_categories: {
        Row: {
          category: string
          confidence: number | null
          tool_id: string
        }
        Insert: {
          category: string
          confidence?: number | null
          tool_id: string
        }
        Update: {
          category?: string
          confidence?: number | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string | null
          description: string | null
          homepage_url: string | null
          id: string
          is_oss: boolean | null
          name: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          homepage_url?: string | null
          id?: string
          is_oss?: boolean | null
          name: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          homepage_url?: string | null
          id?: string
          is_oss?: boolean | null
          name?: string
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      update_log: {
        Row: {
          finished_at: string | null
          id: number
          info: Json | null
          job: string
          status: string
        }
        Insert: {
          finished_at?: string | null
          id?: number
          info?: Json | null
          job: string
          status: string
        }
        Update: {
          finished_at?: string | null
          id?: number
          info?: Json | null
          job?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
