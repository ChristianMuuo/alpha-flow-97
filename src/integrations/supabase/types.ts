export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          website: string | null;
          country: string | null;
          trading_style: string | null;
          tier: string | null;
          referral_code: string | null;
          referred_by: string | null;
          xp: number;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          country?: string | null;
          trading_style?: string | null;
          tier?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          xp?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          country?: string | null;
          trading_style?: string | null;
          tier?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          xp?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_name: string;
          product_type: string;
          price: number;
          paystack_reference: string | null;
          status: string;
          download_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          product_name: string;
          product_type: string;
          price: number;
          paystack_reference?: string | null;
          status?: string;
          download_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          product_name?: string;
          product_type?: string;
          price?: number;
          paystack_reference?: string | null;
          status?: string;
          download_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          category: string;
          description: string | null;
          file_url: string;
          cover_url: string | null;
          user_id: string | null;
          downloads: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          category: string;
          description?: string | null;
          file_url: string;
          cover_url?: string | null;
          user_id?: string | null;
          downloads?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          category?: string;
          description?: string | null;
          file_url?: string;
          cover_url?: string | null;
          user_id?: string | null;
          downloads?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      trade_journal: {
        Row: {
          id: string;
          user_id: string;
          pair: string;
          direction: "buy" | "sell";
          entry_price: number | null;
          exit_price: number | null;
          sl: number | null;
          tp: number | null;
          pips: number | null;
          result: number | null;
          notes: string | null;
          mood: string | null;
          screenshot_url: string | null;
          trade_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pair: string;
          direction: "buy" | "sell";
          entry_price?: number | null;
          exit_price?: number | null;
          sl?: number | null;
          tp?: number | null;
          pips?: number | null;
          result?: number | null;
          notes?: string | null;
          mood?: string | null;
          screenshot_url?: string | null;
          trade_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pair?: string;
          direction?: "buy" | "sell";
          entry_price?: number | null;
          exit_price?: number | null;
          sl?: number | null;
          tp?: number | null;
          pips?: number | null;
          result?: number | null;
          notes?: string | null;
          mood?: string | null;
          screenshot_url?: string | null;
          trade_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ea_reviews: {
        Row: {
          id: string;
          user_id: string;
          ea_id: string;
          ea_type: string;
          rating: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ea_id: string;
          ea_type?: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ea_id?: string;
          ea_type?: string;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          item_type: string;
          item_name: string | null;
          item_meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          item_type: string;
          item_name?: string | null;
          item_meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          item_type?: string;
          item_name?: string | null;
          item_meta?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          book_title: string | null;
          scroll_percent: number;
          last_page: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          book_title?: string | null;
          scroll_percent?: number;
          last_page?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          book_title?: string | null;
          scroll_percent?: number;
          last_page?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      book_notes: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          note_text: string;
          page_number: number | null;
          highlight_color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          note_text: string;
          page_number?: number | null;
          highlight_color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          note_text?: string;
          page_number?: number | null;
          highlight_color?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          reading_streak: number;
          last_read_at: string | null;
          total_xp: number;
          level: number;
          badges: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reading_streak?: number;
          last_read_at?: string | null;
          total_xp?: number;
          level?: number;
          badges?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reading_streak?: number;
          last_read_at?: string | null;
          total_xp?: number;
          level?: number;
          badges?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_runs: {
        Row: {
          id: string;
          user_id: string | null;
          agent_name: string;
          model: string;
          prompt_preview: string | null;
          input_payload: Json;
          output_payload: Json | null;
          status: "pending" | "completed" | "failed" | "blocked_by_guardrail";
          latency_ms: number | null;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cost_estimate: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          agent_name: string;
          model: string;
          prompt_preview?: string | null;
          input_payload?: Json;
          output_payload?: Json | null;
          status?: "pending" | "completed" | "failed" | "blocked_by_guardrail";
          latency_ms?: number | null;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost_estimate?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          agent_name?: string;
          model?: string;
          prompt_preview?: string | null;
          input_payload?: Json;
          output_payload?: Json | null;
          status?: "pending" | "completed" | "failed" | "blocked_by_guardrail";
          latency_ms?: number | null;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost_estimate?: number;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      agent_traces: {
        Row: {
          id: string;
          run_id: string;
          tool_name: string;
          tool_input: Json;
          tool_output: Json | null;
          duration_ms: number | null;
          status: "success" | "error" | "denied";
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          tool_name: string;
          tool_input?: Json;
          tool_output?: Json | null;
          duration_ms?: number | null;
          status?: "success" | "error" | "denied";
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          tool_name?: string;
          tool_input?: Json;
          tool_output?: Json | null;
          duration_ms?: number | null;
          status?: "success" | "error" | "denied";
          created_at?: string;
        };
        Relationships: [];
      };
      agent_memories: {
        Row: {
          id: string;
          user_id: string;
          memory_type: "preference" | "trade_pattern" | "coaching_insight" | "risk_rule" | "knowledge_chunk";
          content: string;
          embedding: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          memory_type: "preference" | "trade_pattern" | "coaching_insight" | "risk_rule" | "knowledge_chunk";
          content: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          memory_type?: "preference" | "trade_pattern" | "coaching_insight" | "risk_rule" | "knowledge_chunk";
          content?: string;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      agent_feedback: {
        Row: {
          id: string;
          run_id: string | null;
          user_id: string;
          feedback_type: "helpful" | "wrong" | "unclear" | "hallucination";
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id?: string | null;
          user_id: string;
          feedback_type: "helpful" | "wrong" | "unclear" | "hallucination";
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string | null;
          user_id?: string;
          feedback_type?: "helpful" | "wrong" | "unclear" | "hallucination";
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;
