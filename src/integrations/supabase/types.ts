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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      boas_vindas_settings: {
        Row: {
          audio1_path: string | null
          audio2_path: string | null
          delay_after_audio1_sec: number | null
          delay_after_text_sec: number | null
          delay_before_final_sec: number | null
          enabled: boolean
          final_message: string | null
          first_message: string | null
          id: string
          include_save_contact_tip: boolean
          mode: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          audio1_path?: string | null
          audio2_path?: string | null
          delay_after_audio1_sec?: number | null
          delay_after_text_sec?: number | null
          delay_before_final_sec?: number | null
          enabled?: boolean
          final_message?: string | null
          first_message?: string | null
          id?: string
          include_save_contact_tip?: boolean
          mode?: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          audio1_path?: string | null
          audio2_path?: string | null
          delay_after_audio1_sec?: number | null
          delay_after_text_sec?: number | null
          delay_before_final_sec?: number | null
          enabled?: boolean
          final_message?: string | null
          first_message?: string | null
          id?: string
          include_save_contact_tip?: boolean
          mode?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      contatos_luna: {
        Row: {
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          first_name: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          source: string | null
          user_id: number
          username: string | null
          welcomed_at: string | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          first_name?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          source?: string | null
          user_id: number
          username?: string | null
          welcomed_at?: string | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          first_name?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          source?: string | null
          user_id?: number
          username?: string | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          contact_id: string | null
          created_at: string | null
          id: string
          status: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      disparo_items: {
        Row: {
          created_at: string
          disparo_id: string
          error: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disparo_id: string
          error?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disparo_id?: string
          error?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disparo_items_disparo_id_fkey"
            columns: ["disparo_id"]
            isOneToOne: false
            referencedRelation: "disparos"
            referencedColumns: ["id"]
          },
        ]
      }
      disparos: {
        Row: {
          audio_url: string | null
          author: string | null
          created_at: string
          id: string
          interval_seconds: number
          status: string
          text_message: string | null
        }
        Insert: {
          audio_url?: string | null
          author?: string | null
          created_at?: string
          id?: string
          interval_seconds?: number
          status?: string
          text_message?: string | null
        }
        Update: {
          audio_url?: string | null
          author?: string | null
          created_at?: string
          id?: string
          interval_seconds?: number
          status?: string
          text_message?: string | null
        }
        Relationships: []
      }
      logsluna: {
        Row: {
          created_at: string
          data_hora: string | null
          id: number
          mensagem: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data_hora?: string | null
          id?: number
          mensagem?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data_hora?: string | null
          id?: number
          mensagem?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          id: string
        }
        Insert: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
        }
        Update: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      welcome_flow_steps: {
        Row: {
          created_at: string | null
          delay_after_sec: number
          flow_id: string
          id: string
          kind: string
          media_path: string | null
          media_url: string | null
          order_index: number
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          created_at?: string | null
          delay_after_sec?: number
          flow_id: string
          id?: string
          kind: string
          media_path?: string | null
          media_url?: string | null
          order_index: number
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          created_at?: string | null
          delay_after_sec?: number
          flow_id?: string
          id?: string
          kind?: string
          media_path?: string | null
          media_url?: string | null
          order_index?: number
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welcome_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "welcome_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      welcome_flows: {
        Row: {
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string | null
          workspace_id?: string
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
