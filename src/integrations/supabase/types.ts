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
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          owner_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          owner_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          owner_id?: string
        }
        Relationships: []
      }
      backup_accounts_owner_fix: {
        Row: {
          created_at: string | null
          id: string | null
          name: string | null
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          name?: string | null
          owner_id?: string | null
        }
        Relationships: []
      }
      backup_auth_users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string | null
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean | null
          is_sso_user: boolean | null
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bans: {
        Row: {
          chat_id: number | null
          chat_title: string | null
          first_name: string | null
          id: string
          message_text: string | null
          reason: string | null
          ts: string | null
          user_id: number | null
          username: string | null
        }
        Insert: {
          chat_id?: number | null
          chat_title?: string | null
          first_name?: string | null
          id?: string
          message_text?: string | null
          reason?: string | null
          ts?: string | null
          user_id?: number | null
          username?: string | null
        }
        Update: {
          chat_id?: number | null
          chat_title?: string | null
          first_name?: string | null
          id?: string
          message_text?: string | null
          reason?: string | null
          ts?: string | null
          user_id?: number | null
          username?: string | null
        }
        Relationships: []
      }
      boas_vindas_settings: {
        Row: {
          account_id: string
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
          account_id: string
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
          account_id?: string
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
        Relationships: [
          {
            foreignKeyName: "boas_vindas_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contatos_bella: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_biatrovaoo: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_etianefelixvip: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_geral: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_geral_old: {
        Row: {
          account_id: string
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number
          first_name: string | null
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          source: string | null
          status: string
          tg_id: string | null
          user_id: number
          username: string | null
          welcome_opt_out: boolean
          welcomed_at: string | null
        }
        Insert: {
          account_id: string
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          source?: string | null
          status?: string
          tg_id?: string | null
          user_id: number
          username?: string | null
          welcome_opt_out?: boolean
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          source?: string | null
          status?: string
          tg_id?: string | null
          user_id?: number
          username?: string | null
          welcome_opt_out?: boolean
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
      contatos_giribeiro: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_luna: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_profalexia: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Relationships: []
      }
      contatos_yourqueenmel: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          id: string
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          owner_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          id?: string
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
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
        Relationships: []
      }
      disparo_items: {
        Row: {
          account_id: string | null
          attempts: number | null
          campaign_id: string
          contact_id: string | null
          created_at: string
          created_minute_epoch: number | null
          error: string | null
          fail_reason: string | null
          id: string
          media_url: string | null
          message: string | null
          payload: Json | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          tg_id: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          attempts?: number | null
          campaign_id: string
          contact_id?: string | null
          created_at?: string
          created_minute_epoch?: number | null
          error?: string | null
          fail_reason?: string | null
          id?: string
          media_url?: string | null
          message?: string | null
          payload?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          tg_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          attempts?: number | null
          campaign_id?: string
          contact_id?: string | null
          created_at?: string
          created_minute_epoch?: number | null
          error?: string | null
          fail_reason?: string | null
          id?: string
          media_url?: string | null
          message?: string | null
          payload?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          tg_id?: string | null
          type?: string | null
          updated_at?: string
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
      failed_inserts: {
        Row: {
          account_id: string | null
          created_at: string | null
          error: string | null
          id: string
          payload: Json
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          payload: Json
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "failed_inserts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      logsgeral: {
        Row: {
          account_id: string
          data_hora: string | null
          id: string
          mensagem: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          data_hora?: string | null
          id?: string
          mensagem?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          data_hora?: string | null
          id?: string
          mensagem?: string | null
          user_id?: string
        }
        Relationships: []
      }
      logsluna: {
        Row: {
          account_id: string | null
          created_at: string
          data_hora: string | null
          id: number
          mensagem: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          data_hora?: string | null
          id?: number
          mensagem?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
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
      produtos_modelos: {
        Row: {
          account_id: string
          created_at: string | null
          descricao: string | null
          id: string
          link: string | null
          nome: string
          preco: number
          status: string | null
          tipo: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome: string
          preco: number
          status?: string | null
          tipo: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          link?: string | null
          nome?: string
          preco?: number
          status?: string | null
          tipo?: string
        }
        Relationships: []
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
      telegram_sessions: {
        Row: {
          account_id: string | null
          api_hash: string
          api_id: string
          created_at: string | null
          error: string | null
          id: string
          owner_id: string
          phone_code_hash: string | null
          phone_number: string
          session_string: string | null
          status: string | null
          twofa_password: string | null
          updated_at: string | null
          verification_code: string | null
        }
        Insert: {
          account_id?: string | null
          api_hash: string
          api_id: string
          created_at?: string | null
          error?: string | null
          id?: string
          owner_id: string
          phone_code_hash?: string | null
          phone_number: string
          session_string?: string | null
          status?: string | null
          twofa_password?: string | null
          updated_at?: string | null
          verification_code?: string | null
        }
        Update: {
          account_id?: string | null
          api_hash?: string
          api_id?: string
          created_at?: string | null
          error?: string | null
          id?: string
          owner_id?: string
          phone_code_hash?: string | null
          phone_number?: string
          session_string?: string | null
          status?: string | null
          twofa_password?: string | null
          updated_at?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_sessions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      welcome_flow_steps: {
        Row: {
          account_id: string
          created_at: string | null
          delay_after_sec: number
          flow_id: string
          id: string
          kind: string
          media_path: string | null
          media_url: string | null
          order_index: number
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          delay_after_sec?: number
          flow_id: string
          id?: string
          kind: string
          media_path?: string | null
          media_url?: string | null
          order_index: number
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          delay_after_sec?: number
          flow_id?: string
          id?: string
          kind?: string
          media_path?: string | null
          media_url?: string | null
          order_index?: number
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welcome_flow_steps_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welcome_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "welcome_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      welcome_flow_steps_backup_20251119: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_backup_before_finalize: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_backup_final: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_backup_pre_fk_fix: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_orphan_backup: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_orphan_backup_after_try: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_orphan_rows_backup_final: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flow_steps_selected_backup: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: []
      }
      welcome_flows: {
        Row: {
          account_id: string
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          owner_id: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          account_id: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          account_id?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "welcome_flows_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      _backup_sync_wfs_owner_from_account: {
        Row: {
          dummy: number | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          account_id: string | null
          chat_id: number | null
          created_at: string | null
          date_first_seen: string | null
          fail_count: number | null
          first_name: string | null
          invalid_at: string | null
          invalid_reason: string | null
          is_bot: string | null
          is_premium: string | null
          language_code: string | null
          last_name: string | null
          mensagem: string | null
          name: string | null
          source: string | null
          status: string | null
          tg_id: string | null
          user_id: number | null
          username: string | null
          welcome_opt_out: boolean | null
          welcomed_at: string | null
        }
        Insert: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
          welcomed_at?: string | null
        }
        Update: {
          account_id?: string | null
          chat_id?: number | null
          created_at?: string | null
          date_first_seen?: string | null
          fail_count?: number | null
          first_name?: string | null
          invalid_at?: string | null
          invalid_reason?: string | null
          is_bot?: string | null
          is_premium?: string | null
          language_code?: string | null
          last_name?: string | null
          mensagem?: string | null
          name?: string | null
          source?: string | null
          status?: string | null
          tg_id?: string | null
          user_id?: number | null
          username?: string | null
          welcome_opt_out?: boolean | null
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
      dashboard_mensagens_semana: {
        Row: {
          account_id: string | null
          messages: number | null
          ord: number | null
          weekday: string | null
        }
        Relationships: []
      }
      dashboard_total_mensagens: {
        Row: {
          account_id: string | null
          total_messages: number | null
        }
        Relationships: []
      }
      flow_steps: {
        Row: {
          account_id: string | null
          created_at: string | null
          delay_after_sec: number | null
          flow_id: string | null
          id: string | null
          kind: string | null
          media_path: string | null
          media_url: string | null
          order_index: number | null
          owner_id: string | null
          parse_mode: string | null
          text_content: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          delay_after_sec?: number | null
          flow_id?: string | null
          id?: string | null
          kind?: string | null
          media_path?: string | null
          media_url?: string | null
          order_index?: number | null
          owner_id?: string | null
          parse_mode?: string | null
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "welcome_flow_steps_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welcome_flow_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "welcome_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      view_new_contacts_today: {
        Row: {
          day: string | null
          new_contacts: number | null
        }
        Relationships: []
      }
      view_profiles_connection_status: {
        Row: {
          account_created_at: string | null
          account_id: string | null
          account_name: string | null
          account_owner_id: string | null
          connected_sessions: number | null
          display_name: string | null
          email: string | null
          last_connected_at: string | null
          profile_created_at: string | null
          profile_id: string | null
          session_owner_ids: string[] | null
          session_statuses: string[] | null
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
    }
    Functions: {
      ack_disparo_item: {
        Args: { _err?: string; _item_id: string; _ok: boolean }
        Returns: undefined
      }
      check_account_membership: {
        Args: { _account_id: string }
        Returns: boolean
      }
      check_connected_by_email: {
        Args: { email_arg: string }
        Returns: {
          account_id: string
          account_name: string
          phone_number: string
          profile_email: string
          profile_id: string
          session_id: string
          status: string
        }[]
      }
      claim_disparo_items: {
        Args: { p_campaign: string; p_limit?: number }
        Returns: {
          id: string
          media_url: string
          msg_type: string
          payload: Json
          text: string
          tg_id: number
        }[]
      }
      cleanup_failed_disparos: { Args: never; Returns: undefined }
      cleanup_inactive_contacts: { Args: never; Returns: undefined }
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
      current_account_id: { Args: never; Returns: string }
      dequeue_disparo_item: {
        Args: never
        Returns: {
          account_id: string
          campaign_id: string
          contact_id: string
          item_id: string
          payload: Json
          tg_id: number
        }[]
      }
      get_contacts_table_name: {
        Args: { p_account_id: string }
        Returns: string
      }
      get_dashboard_metrics: {
        Args: never
        Returns: {
          contacts_today: number
          messages_month: number
          total_contacts: number
        }[]
      }
      get_messages_by_day: {
        Args: { p_account_id: string; p_month: number; p_year: number }
        Returns: {
          dia: string
          mensagens_recebidas: number
        }[]
      }
      get_new_contacts: {
        Args: { p_account_id: string; p_month: number; p_year: number }
        Returns: number
      }
      get_or_create_profile: {
        Args: { _display_name?: string; _email: string; _user_id: string }
        Returns: string
      }
      get_total_contacts: { Args: { p_account_id: string }; Returns: number }
      is_account_member_or_owner: {
        Args: { account_id: string }
        Returns: boolean
      }
      is_member_of: { Args: { account_id: string }; Returns: boolean }
      profile_has_connected_telegram: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      whoami: { Args: never; Returns: Json }
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
