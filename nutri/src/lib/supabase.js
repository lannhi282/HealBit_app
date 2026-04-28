// Import the Supabase client library
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Configuration
 * These are the connection details for the Supabase project
 * The URL and anon key are used to initialize the Supabase client
 */
const supabaseUrl = "https://ltylnrptzgitibnxijnl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eWxucnB0emdpdGlibnhpam5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzM3MDgsImV4cCI6MjA5MTgwOTcwOH0.Nod-iv3Ji9QvltfP0g9TbqCqidD7DvsqMkTqaz8RzCU";

/**
 * Initialize Supabase Client
 * Creates a new Supabase client instance that will be used throughout the application
 * This client is exported and used in other files for database operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
