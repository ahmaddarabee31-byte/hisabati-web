import { createClient } from "@supabase/supabase-js";



const supabaseUrl = "https://hmeiasmzufqdvydnicnx.supabase.co";

const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZWlhc216dWZxZHZ5ZG5pY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MjIzOTksImV4cCI6MjA5NjE5ODM5OX0.FQvp-6eiO846KCiuFrgftysX59cXoOOM5ng-YG1oeP4";



export const supabase = createClient(supabaseUrl, supabaseAnonKey);