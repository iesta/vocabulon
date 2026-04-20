import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eempmhfxsmrpzkvabplp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbXBtaGZ4c21ycHprdmFicGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDE0OTYsImV4cCI6MjA5MDcxNzQ5Nn0.TP1qRrY7qbki0IpBMOaC8KtRcail75CQkSOxMEEfMTI';

console.log('Supabase init with hardcoded key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);