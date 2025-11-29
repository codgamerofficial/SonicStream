import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ileywkgxavikqrjtpurt.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZXl3a2d4YXZpa3FyanRwdXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTY1NTgsImV4cCI6MjA3OTg5MjU1OH0.uqPEF78u_cZTM-uPDvRUi8H7vG-3SICv55dtQDJhdIY';

export const supabase = createClient(supabaseUrl, supabaseKey);