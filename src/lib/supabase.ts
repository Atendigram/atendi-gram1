import { createClient } from "@supabase/supabase-js";

// 🔑 Substitua pelos dados do meu Supabase (Project Settings → API)
const supabaseUrl = "https://sjafivptbizdrzkozonv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWZpdnB0Yml6ZHJ6a296b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzY1NjUsImV4cCI6MjA3MjM1MjU2NX0.GxUFl9wsRSmQdcCc0xBAfOYpw4BpSToBSaW2gP63Rig";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);