/**
 * Use the same Supabase client as the rest of WebApp-Vis.
 * (dashvis standalone used nullable client + isSupabaseConfigured; here the app always configures env at build.)
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as appSupabase } from '../../lib/supabase';

export const isSupabaseConfigured = true;
export const supabase: SupabaseClient = appSupabase;
