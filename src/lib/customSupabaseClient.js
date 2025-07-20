import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://olxzaplsnvncgsbayyfy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9seHphcGxzbnZuY2dzYmF5eWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTgxMzcsImV4cCI6MjA2ODM5NDEzN30.ZyH7VQxmP0ii_BYe42-7AUK0QOFLWHm6NVf9KiiNZ0I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);