// lib/supabase.ts
// Supabase client setup (for server-side operations)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client (bypasses RLS - use carefully, only for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Export type for authentication
export type AuthUser = {
  id: string;
  email: string;
  tenant_id: string;
  user_role: string;
};
