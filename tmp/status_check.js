import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://mjqkqddsdpnbqlldusfr.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcWtxZGRzZHBuYnFsbGR1c2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODMxMjMsImV4cCI6MjA5MTA1OTEyM30.K9fiXAt6TNXJR_L0IEhaiMe_OuPaTdBCJ34gAj0xBqc"
);

async function diagnose() {
  console.log('--- PROJECT STATUS DIAGNOSTIC (Hardcoded) ---');

  // 1. Check Profiles
  const { data: profiles } = await supabase.from('profiles').select('id, email, role, name');
  console.log('Profiles Found:', profiles?.length || 0);
  profiles?.forEach(p => console.log(`  - ${p.email} [${p.role}] [${p.name}] [ID: ${p.id}]`));

  // 2. Check Courses
  const { data: courses } = await supabase.from('courses').select('id, name, code, status');
  console.log('Courses:', courses?.length || 0);
  courses?.forEach(c => console.log(`  - ${c.name} (${c.code}) [ID: ${c.id}] [Status: ${c.status}]`));

  // 3. Check Sessions
  const { data: sessions } = await supabase.from('sessions').select('id, course_id, title, is_active, number');
  console.log('Sessions:', sessions?.length || 0);
  sessions?.forEach(s => console.log(`  - [${s.is_active ? 'ACTIVE' : 'inactive'}] "${s.title}" (Session ${s.number}) [Course ID: ${s.course_id}]`));

  // 4. Enrollments for key accounts
  const targetEmails = ['vinay@sjcc.edu.in', 'vinay.kambipura@gmail.com'];
  for (const email of targetEmails) {
    const profile = profiles?.find(p => p.email === email);
    if (profile) {
      const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', profile.id);
      console.log(`Enrollments for ${email}:`, enrollments?.length || 0);
      enrollments?.forEach(e => {
        const course = courses?.find(c => c.id === e.course_id);
        console.log(`  - Course: ${course?.name || 'Unknown'} (${e.course_id})`);
      });
    } else {
      console.log(`Profile for ${email} NOT found in DB.`);
    }
  }

  console.log('--- END DIAGNOSTIC ---');
}

diagnose();
