import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjqkqddsdpnbqlldusfr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConfig() {
  console.log('Checking Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching from profiles:', error.message);
  } else {
    console.log('Success! Profiles table exists. Data array length:', data.length);
  }
}
checkConfig();
