import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://mjqkqddsdpnbqlldusfr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc"
);

async function testDB() {
  const { error } = await supabase.from('pending_enrollments').select('*').limit(1);
  if (error) {
    console.error("Query Error:", error.message, error.code);
  } else {
    console.log("Success: Table exists!");
  }
}

testDB();
