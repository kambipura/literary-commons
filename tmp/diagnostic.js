import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://mjqkqddsdpnbqlldusfr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc"
);

async function checkSchema() {
  console.log('Checking profiles table columns...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error.message);
  } else {
    console.log('Columns found:', Object.keys(data[0] || {}).join(', '));
  }

  console.log('Listing all allowed_emails...');
  const { data: allAllowed, error: allALlowedError } = await supabase
    .from('allowed_emails')
    .select('email, role');

  if (allALlowedError) {
    console.error('Error fetching all allowed_emails:', allALlowedError.message);
  } else {
    console.log('Whitelisted emails:', allAllowed.map(a => a.email).join(', '));
  }
}

checkSchema();
