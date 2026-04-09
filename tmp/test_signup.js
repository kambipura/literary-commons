import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://mjqkqddsdpnbqlldusfr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc"
);

async function testSignup() {
  console.log("Adding dummy user to allowed_emails via SQL is impossible from here, so we will try signing up an UN-whitelisted user to see if it throws the expected Trigger error or something else.");
  
  const { data, error } = await supabase.auth.signUp({
    email: 'unwhitelisted_test_user@sjcc.edu.in',
    password: 'password123'
  });

  if (error) {
    console.error("Signup Failed:", error.message);
  } else {
    console.log("Signup Succeeded:", data);
  }
}

testSignup();
