import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostic() {
  console.log('--- Database Diagnostic ---');
  
  // 1. Check Profiles
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles ? profiles.length : 0, 'found');
  if (profiles) profiles.forEach(p => console.log(`- ${p.email}: ${p.role}`));
  
  // 2. Check Courses
  const { data: courses, error: cError } = await supabase.from('courses').select('*');
  console.log('Courses:', courses ? courses.length : 0, 'found');
  if (courses) courses.forEach(c => console.log(`- [${c.id}] ${c.name}`));
  
  // 3. Check Sessions
  const { data: sessions, error: sError } = await supabase.from('sessions').select('*');
  console.log('Sessions:', sessions ? sessions.length : 0, 'found');
  if (sessions) sessions.forEach(s => console.log(`- Session ${s.number}: ${s.title} (Active: ${s.is_active})`));
  
  if (pError || cError || sError) {
    console.error('Errors found during diagnostics:', pError?.message || cError?.message || sError?.message);
  }
}

diagnostic();
