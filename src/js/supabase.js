import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://fylbwqnoncurnqedwolb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5bGJ3cW5vbmN1cm5xZWR3b2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjMyNzAsImV4cCI6MjEwNzM5OTI3MH0.7Ye44EJYaAIYlVUd3yEY6DimSawbMT8zcTWRnGiya6w'; 

export const supabase = createClient(supabaseUrl, supabaseKey);