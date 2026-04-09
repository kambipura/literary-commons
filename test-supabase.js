import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mjqkqddsdpnbqlldusfr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  console.log('Checking allowed_emails table structure...');
  // Try to insert a dummy record to see if it fails on schema
  const testEmail = `test-${Date.now()}@example.com`;
  const { data, error } = await supabase
    .from('allowed_emails')
    .insert([{ email: testEmail, name: 'Test Name', register_number: '123' }])
    .select();

  if (error) {
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    if (error.message.includes('column "name" of relation "allowed_emails" does not exist')) {
        console.log('--- CONFIRMED: The column "name" is missing in the DB. ---');
    }
  } else {
    console.log('Success! Table has the correct columns.');
    console.log('Inserted:', data);
  }
}

checkTable();
