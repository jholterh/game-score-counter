export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      game_participants: {
        Row: {
          created_at: string | null
          final_rank: number | null
          game_id: string
          gave_up_at_round: number | null
          id: string
          is_active: boolean
          is_winner: boolean | null
          joined_at_round: number
          player_name: string
          player_order: number
          total_score: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          final_rank?: number | null
          game_id: string
          gave_up_at_round?: number | null
          id?: string
          is_active?: boolean
          is_winner?: boolean | null
          joined_at_round?: number
          player_name: string
          player_order: number
          total_score?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          final_rank?: number | null
          game_id?: string
          gave_up_at_round?: number | null
          id?: string
          is_active?: boolean
          is_winner?: boolean | null
          joined_at_round?: number
          player_name?: string
          player_order?: number
          total_score?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          ai_analysis: string | null
          ai_theme: string | null
          created_at: string | null
          created_by: string | null
          finished_at: string | null
          high_score_wins: boolean
          id: string
          is_dual_scoring: boolean
          is_finished: boolean
          language: string
          started_at: string | null
          total_rounds: number
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: string | null
          ai_theme?: string | null
          created_at?: string | null
          created_by?: string | null
          finished_at?: string | null
          high_score_wins?: boolean
          id?: string
          is_dual_scoring?: boolean
          is_finished?: boolean
          language?: string
          started_at?: string | null
          total_rounds: number
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: string | null
          ai_theme?: string | null
          created_at?: string | null
          created_by?: string | null
          finished_at?: string | null
          high_score_wins?: boolean
          id?: string
          is_dual_scoring?: boolean
          is_finished?: boolean
          language?: string
          started_at?: string | null
          total_rounds?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      round_scores: {
        Row: {
          created_at: string | null
          cumulative_score: number
          game_id: string
          id: string
          participant_id: string
          prediction: number | null
          round_number: number
          score: number
        }
        Insert: {
          created_at?: string | null
          cumulative_score: number
          game_id: string
          id?: string
          participant_id: string
          prediction?: number | null
          round_number: number
          score: number
        }
        Update: {
          created_at?: string | null
          cumulative_score?: number
          game_id?: string
          id?: string
          participant_id?: string
          prediction?: number | null
          round_number?: number
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "round_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_scores_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "game_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          favorite_narrator: string | null
          id: string
          preferred_dual_scoring: boolean | null
          preferred_high_score_wins: boolean | null
          preferred_language: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          favorite_narrator?: string | null
          id?: string
          preferred_dual_scoring?: boolean | null
          preferred_high_score_wins?: boolean | null
          preferred_language?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          favorite_narrator?: string | null
          id?: string
          preferred_dual_scoring?: boolean | null
          preferred_high_score_wins?: boolean | null
          preferred_language?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          average_score_per_game: number | null
          favorite_game_mode: string | null
          highest_game_score: number | null
          id: string
          last_played_at: string | null
          lowest_game_score: number | null
          total_games_played: number
          total_games_won: number
          total_rounds_played: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_score_per_game?: number | null
          favorite_game_mode?: string | null
          highest_game_score?: number | null
          id?: string
          last_played_at?: string | null
          lowest_game_score?: number | null
          total_games_played?: number
          total_games_won?: number
          total_rounds_played?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_score_per_game?: number | null
          favorite_game_mode?: string | null
          highest_game_score?: number | null
          id?: string
          last_played_at?: string | null
          lowest_game_score?: number | null
          total_games_played?: number
          total_games_won?: number
          total_rounds_played?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_game_statistics: {
        Row: {
          avg_score: number | null
          dual_scoring_games: number | null
          high_score_games: number | null
          max_score: number | null
          min_score: number | null
          total_games: number | null
          user_id: string | null
          wins: number | null
        }
        Relationships: []
      }
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
