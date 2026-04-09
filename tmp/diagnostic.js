import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
  const email = 'vinay@sjcc.edu.in'; // Or the email the user is using
  console.log(`Diagnosing for email: ${email}`);

  // 1. Find User ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .single();
  
  if (!profile) {
    console.log('User profile not found');
    return;
  }
  const userId = profile.id;
  console.log(`User ID: ${userId}, Base Role: ${profile.role}`);

  // 2. Check Enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', userId);
  
  console.log(`Enrollments: ${enrollments?.length || 0}`);
  enrollments?.forEach(e => console.log(` - Enrolled in Course: ${e.course_id}`));

  // 3. Check All Active Sessions
  const { data: activeSessions } = await supabase
    .from('sessions')
    .select('id, title, course_id, number')
    .eq('is_active', true);
  
  console.log(`Active Sessions in DB: ${activeSessions?.length || 0}`);
  activeSessions?.forEach(s => {
    const isEnrolled = enrollments?.some(e => e.course_id === s.course_id);
    console.log(` - Session: "${s.title}" (ID: ${s.id}) in Course ${s.course_id} [Enrolled: ${isEnrolled}]`);
  });

  // 4. Check User's Reflections for these sessions
  if (activeSessions) {
    const sessionIds = activeSessions.map(s => s.id);
    const { data: refs } = await supabase
      .from('reflections')
      .select('id, session_id, status, title')
      .eq('user_id', userId)
      .in('session_id', sessionIds);
    
    console.log(`Reflections for active sessions: ${refs?.length || 0}`);
    refs?.forEach(r => console.log(` - Reflection: "${r.title}" (ID: ${r.id}) for Session ${r.session_id} [Status: ${r.status}]`));
  }
}

diagnose();
