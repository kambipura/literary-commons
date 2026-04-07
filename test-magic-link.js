import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://mjqkqddsdpnbqlldusfr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  const email = `test+${Date.now()}@example.com`;
  console.log('Trying sign up with password for:', email);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });
  
  if (error) {
    fs.writeFileSync('error_output.json', JSON.stringify(error, null, 2));
    console.error('Sign up error');
  } else {
    fs.writeFileSync('error_output.json', JSON.stringify({ success: true, data }, null, 2));
    console.log('Sign up success', data);
  }
}
testAuth();
