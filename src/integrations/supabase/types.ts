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
      account_members: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          owner_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          owner_id?: string
        }
        Relationships: []
      }
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
          account_id: string
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_luna: {
        Row: {
          account_id: string
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
          account_id: string
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
          account_id?: string
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
        Relationships: [
          {
            foreignKeyName: "contatos_luna_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
          account_id: string | null
          attempts: number | null
          campaign_id: string
          contact_id: string | null
          created_at: string
          error: string | null
          fail_reason: string | null
          id: string
          payload: Json | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          tg_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          attempts?: number | null
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          error?: string | null
          fail_reason?: string | null
          id?: string
          payload?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          tg_id?: string | null
          user_id?: string
        }
        Update: {
          account_id?: string | null
          attempts?: number | null
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          error?: string | null
          fail_reason?: string | null
          id?: string
          payload?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          tg_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disparo_items_campaign_fk"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "disparos"
            referencedColumns: ["id"]
          },
        ]
      }
      disparos: {
        Row: {
          account_id: string | null
          audio_url: string | null
          author: string | null
          content: string | null
          created_at: string
          created_by: string | null
          failed_count: number | null
          id: string
          interval_seconds: number
          media_url: string | null
          name: string | null
          queued_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string
          text_message: string | null
          total_targets: number | null
        }
        Insert: {
          account_id?: string | null
          audio_url?: string | null
          author?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          interval_seconds?: number
          media_url?: string | null
          name?: string | null
          queued_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          text_message?: string | null
          total_targets?: number | null
        }
        Update: {
          account_id?: string | null
          audio_url?: string | null
          author?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          id?: string
          interval_seconds?: number
          media_url?: string | null
          name?: string | null
          queued_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          text_message?: string | null
          total_targets?: number | null
        }
        Relationships: []
      }
      logsluna: {
        Row: {
          account_id: string
          created_at: string
          data_hora: string | null
          id: number
          mensagem: string | null
          user_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          data_hora?: string | null
          id?: number
          mensagem?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          data_hora?: string | null
          id?: number
          mensagem?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logsluna_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          account_id: string
          body: string | null
          conversation_id: string | null
          created_at: string | null
          direction: string | null
          id: string
        }
        Insert: {
          account_id: string
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
        }
        Update: {
          account_id?: string
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_account_fk"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_id: string
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
      ack_disparo_item: {
        Args: { _err?: string; _item_id: string; _ok: boolean }
        Returns: undefined
      }
      create_campaign_and_enqueue: {
        Args: {
          p_content: string
          p_media_url: string
          p_name: string
          p_scheduled_at: string
        }
        Returns: {
          campaign_id: string
          enqueued: number
        }[]
      }
      dequeue_disparo_item: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_id: string
          campaign_id: string
          contact_id: string
          item_id: string
          payload: Json
          tg_id: number
        }[]
      }
      is_account_member_or_owner: {
        Args: { account_id: string }
        Returns: boolean
      }
      is_member_of: {
        Args: { account_id: string }
        Returns: boolean
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
