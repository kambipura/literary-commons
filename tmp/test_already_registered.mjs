import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://mjqkqddsdpnbqlldusfr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc"
);

async function testAlreadyRegistered() {
  const email = 'tester@sjcc.edu.in'; // We know this one is actually in the DB from earlier tests, maybe? Or we just create a new one twice.
  
  // Try to sign up a random safe email
  const randomEmail = `test_${Date.now()}@test.com`;
  
  // Wait, I can't sign up randomly without the whitelist.
  console.log("Will just test what GoTrue returns when email exists by trying to sign up 'admin@sjcc.edu.in'");
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@sjcc.edu.in',
    password: 'password123'
  });

  console.log("Response:", error?.message || "Success");
}

testAlreadyRegistered();
