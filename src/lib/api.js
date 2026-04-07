import { supabase } from './supabase';
import * as mock from '../data/mock';

/**
 * Centered API Service with Graceful Fallbacks.
 * Each method tries to fetch from Supabase, but returns Mock data if:
 * 1. Supabase returns an error (like RLS blocking due to our Mock Auth Bypass)
 * 2. No data is found/returned.
 */

// Helper to convert snake_case (DB) to camelCase (UI) for Courses
const mapCourse = (c) => ({
  id: c.id,
  name: c.name,
  code: c.code,
  semester: c.semester,
  university: c.university,
  professorId: c.professor_id,
  featuredChainId: c.featured_chain_id,
  status: c.status
});

// Helper to convert snake_case (DB) to camelCase (UI) for Sessions
const mapSession = (s) => ({
  id: s.id,
  courseId: s.course_id,
  number: s.number,
  title: s.title,
  promptType: s.prompt_type,
  theySayPrompt: s.they_say_prompt,
  isActive: s.is_active,
  createdAt: s.created_at
});

// Helper to convert snake_case (DB) to camelCase (UI) for Reflections
const mapReflection = (r) => ({
  id: r.id,
  userId: r.user_id,
  sessionId: r.session_id,
  title: r.title,
  content: r.content,
  theySaySource: r.they_say_source,
  privacy: r.privacy,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  authorName: r.profiles?.name || r.author?.name // Handle join
});

const mapComment = (c) => ({
  id: c.id,
  reflectionId: c.reflection_id,
  userId: c.user_id,
  type: c.type,
  content: c.content,
  createdAt: c.created_at
});

const mapReaction = (rx) => ({
  id: rx.id,
  reflectionId: rx.reflection_id,
  userId: rx.user_id,
  type: rx.type,
  createdAt: rx.created_at
});

const mapChain = (chain) => ({
  id: chain.id,
  sessionId: chain.session_id,
  title: chain.title,
  reflectionIds: chain.reflection_ids,
  createdAt: chain.created_at
});

const mapNote = (n) => ({
  id: n.id,
  userId: n.user_id,
  title: n.title,
  content: n.content,
  type: n.type,
  metadata: n.metadata,
  isArchived: n.is_archived,
  createdAt: n.created_at,
  updatedAt: n.updated_at
});

export const api = {
  /**
   * COURSES
   */
  async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error || !data || data.length === 0) {
        console.warn('api.getCourses: Falling back to mock data.', error?.message);
        return mock.allCourses;
      }

      return data.map(mapCourse);
    } catch (err) {
      return mock.allCourses;
    }
  },

  async getCourseById(id) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn(`api.getCourseById(${id}): Falling back to mock data.`, error?.message);
        return mock.allCourses.find(c => c.id === id) || mock.course;
      }

      return mapCourse(data);
    } catch (err) {
      return mock.allCourses.find(c => c.id === id) || mock.course;
    }
  },

  /**
   * SESSIONS
   */
  async getSessions(courseId) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('number', { ascending: true });

      if (error || !data || data.length === 0) {
        // console.warn(`api.getSessions(${courseId}): Falling back to mock data.`, error?.message);
        return mock.sessions.filter(s => s.courseId === courseId);
      }

      return data.map(mapSession);
    } catch (err) {
      return mock.sessions.filter(s => s.courseId === courseId);
    }
  },

  async getCurrentSession(courseId) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        const mockCourseSessions = mock.sessions.filter(s => s.courseId === courseId);
        return mockCourseSessions.find(s => s.isActive) || mockCourseSessions[mockCourseSessions.length - 1];
      }

      return mapSession(data);
    } catch (err) {
       const mockCourseSessions = mock.sessions.filter(s => s.courseId === courseId);
       return mockCourseSessions.find(s => s.isActive) || mockCourseSessions[mockCourseSessions.length - 1];
    }
  },

  /**
   * REFLECTIONS & INTERACTIONS
   */
  async getReflections(filters = {}) {
    try {
      let query = supabase.from('reflections').select('*, profiles(name)');
      
      if (filters.sessionId && filters.sessionId !== 'all') {
        query = query.eq('session_id', filters.sessionId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('api.getReflections: Falling back to mock data.', error?.message);
        let fallback = mock.reflections;
        if (filters.sessionId && filters.sessionId !== 'all') {
          fallback = fallback.filter(r => r.sessionId === filters.sessionId);
        }
        if (filters.status) {
          fallback = fallback.filter(r => r.status === filters.status);
        }
        if (filters.userId) {
          fallback = fallback.filter(r => r.userId === filters.userId);
        }
        return fallback;
      }

      return data.map(mapReflection);
    } catch (err) {
      return mock.reflections;
    }
  },

  async getComments(reflectionId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('reflection_id', reflectionId);

      if (error || !data) {
        return mock.comments.filter(c => c.reflectionId === reflectionId);
      }

      return data.map(mapComment);
    } catch (err) {
      return mock.comments.filter(c => c.reflectionId === reflectionId);
    }
  },

  async getReactions(reflectionId) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('reflection_id', reflectionId);

      if (error || !data) {
        return mock.reactions.filter(r => r.reflectionId === reflectionId);
      }

      return data.map(mapReaction);
    } catch (err) {
      return mock.reactions.filter(r => r.reflectionId === reflectionId);
    }
  },

  async getResponseChains(sessionId = null) {
    try {
      let query = supabase.from('response_chains').select('*');
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query;

      if (error || !data) {
        let fallback = mock.responseChains;
        if (sessionId) fallback = fallback.filter(c => c.sessionId === sessionId);
        return fallback;
      }

      return data.map(mapChain);
    } catch (err) {
      return mock.responseChains;
    }
  },

  async getReflectionById(id) {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*, profiles(name)')
        .eq('id', id)
        .single();

      if (error || !data) {
        return mock.reflections.find(r => r.id === id);
      }

      return mapReflection(data);
    } catch (err) {
      return mock.reflections.find(r => r.id === id);
    }
  },

  /**
   * PERSONAL WORKSPACE
   */
  async getNotes(userId) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error || !data) {
        console.warn(`api.getNotes(${userId}): Falling back to mock data.`, error?.message);
        return mock.getUserNotes(userId);
      }

      return data.map(mapNote);
    } catch (err) {
      return mock.getUserNotes(userId);
    }
  },

  async getNoteById(id) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return mock.notes.find(n => n.id === id);
      }

      return mapNote(data);
    } catch (err) {
      return mock.notes.find(n => n.id === id);
    }
  },

  async createNote(userId, noteData) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: userId,
          title: noteData.title,
          content: noteData.content,
          type: noteData.type,
          url: noteData.metadata?.url, // Map discrete fields
          tags: noteData.metadata?.tags,
          is_archived: noteData.isArchived || false
        }])
        .select()
        .single();

      if (error) throw error;
      return mapNote(data);
    } catch (err) {
      console.warn('api.createNote: Live save failed.', err.message);
      throw err;
    }
  },

  async updateNote(id, noteData) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content: noteData.content,
          type: noteData.type,
          url: noteData.metadata?.url, // Map discrete fields
          tags: noteData.metadata?.tags,
          is_archived: noteData.isArchived,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapNote(data);
    } catch (err) {
      console.warn(`api.updateNote(${id}): Live update failed.`, err.message);
      throw err;
    }
  },

  async createReflection(reflectionData) {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert([{
          user_id: reflectionData.userId,
          session_id: reflectionData.sessionId,
          title: reflectionData.title,
          content: reflectionData.content,
          they_say_source: reflectionData.theySaySource,
          privacy: reflectionData.privacy,
          status: reflectionData.status || 'published'
        }])
        .select('*, profiles(name)')
        .single();

      if (error) throw error;
      return mapReflection(data);
    } catch (err) {
      console.error('api.createReflection Failed:', err.message);
      throw err;
    }
  },

  async createCourse(courseData) {
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .insert([{
          name: courseData.name,
          code: courseData.code,
          semester: courseData.semester,
          university: courseData.university || 'Literary Commons University',
          professor_id: courseData.professorId, // Legacy field for safety
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to new course_staff table
      await supabase.from('course_staff').insert([{
        course_id: course.id,
        professor_id: courseData.professorId,
        role: 'professor'
      }]);

      return mapCourse(course);
    } catch (err) {
      console.warn('api.createCourse: Failed.', err.message);
      throw err;
    }
  },

  async getStaffProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['professor', 'admin']);
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('api.getStaffProfiles failed:', err.message);
      return [];
    }
  },

  async updateCourseStaff(courseId, staffIds) {
    try {
      // Clear existing and re-insert (Simple sync)
      await supabase.from('course_staff').delete().eq('course_id', courseId);
      
      const newStaff = staffIds.map(id => ({
        course_id: courseId,
        professor_id: id,
        role: 'professor'
      }));

      const { error } = await supabase.from('course_staff').insert(newStaff);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('api.updateCourseStaff failed:', err.message);
      throw err;
    }
  },

  async getSessions(courseId) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('course_id', courseId)
        .order('number', { ascending: true });

      if (error) throw error;
      return data.map(s => ({
        id: s.id,
        courseId: s.course_id,
        number: s.number,
        title: s.title,
        promptType: s.prompt_type,
        theySayPrompt: s.they_say_prompt,
        isActive: s.is_active,
        createdAt: s.created_at
      }));
    } catch (err) {
      console.warn(`api.getSessions(${courseId}) failed:`, err.message);
      return [];
    }
  },

  async createSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          course_id: sessionData.courseId,
          number: sessionData.number,
          title: sessionData.title,
          prompt_type: sessionData.promptType,
          they_say_prompt: sessionData.theySayPrompt,
          is_active: sessionData.isActive
        }])
        .select()
        .single();

      if (error) throw error;
      // If active, ensure others are inactive
      if (sessionData.isActive) {
        await supabase
          .from('sessions')
          .update({ is_active: false })
          .eq('course_id', sessionData.courseId)
          .neq('id', data.id);
      }
      return data;
    } catch (err) {
      console.warn('api.createSession failed:', err.message);
      throw err;
    }
  },

  async updateSession(id, updates) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update({
          title: updates.title,
          prompt_type: updates.promptType,
          they_say_prompt: updates.theySayPrompt,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If set to active, deactivate all other sessions in the same course
      if (updates.isActive) {
        await supabase
          .from('sessions')
          .update({ is_active: false })
          .eq('course_id', data.course_id)
          .neq('id', id);
      }
      return data;
    } catch (err) {
      console.warn(`api.updateSession(${id}) failed:`, err.message);
      throw err;
    }
  },

  async getEnrolledStudentsWithStats(courseId) {
    try {
      // Complex join/aggregation
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          enrollments!inner(course_id),
          reflections(count),
          comments(count),
          reactions(count)
        `)
        .eq('enrollments.course_id', courseId);
      
      if (error) throw error;
      return data.map(profile => ({
        ...profile,
        reflectionsCount: profile.reflections[0]?.count || 0,
        commentsCount: profile.comments[0]?.count || 0,
        reactionsCount: profile.reactions[0]?.count || 0
      }));
    } catch (err) {
      console.warn(`api.getEnrolledStudentsWithStats(${courseId}) failed:`, err.message);
      return [];
    }
  },

  async getEnrolledStudents(courseId) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, profiles(*)')
        .eq('course_id', courseId);
      
      if (error) throw error;
      return data.map(e => ({
        ...e.profiles,
        enrolledAt: e.enrolled_at
      }));
    } catch (err) {
      console.warn(`api.getEnrolledStudents(${courseId}) failed:`, err.message);
      return [];
    }
  },

  async getMyEnrollments(userId) {
    try {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('student_id', userId);
      
      if (error) throw error;
      if (!data) return [];

      return data.map(e => ({
        ...mapCourse(e.courses),
        role: e.role,
        enrolledAt: e.enrolled_at
      }));
    } catch (err) {
      console.warn(`api.getMyEnrollments(${userId}) failed:`, err.message);
      return [];
    }
  },

  async getEssay(userId) {
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        sections: data.sections || [],
        status: data.status,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.warn(`api.getEssay(${userId}) failed:`, err.message);
      return null;
    }
  },

  async saveEssay(essayData) {
    try {
      const payload = {
        user_id: essayData.userId,
        title: essayData.title,
        sections: essayData.sections,
        status: essayData.status || 'draft',
        updated_at: new Date().toISOString()
      };
      
      // If we have an ID that looks like a UUID (not a mock blk- or note-), pass it
      if (essayData.id && essayData.id.length > 20) {
        payload.id = essayData.id;
      }

      const { data, error } = await supabase
        .from('essays')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('api.saveEssay failed:', err.message);
      throw err;
    }
  },

  async enrollStudents(courseId, emails) {
    try {
      // In this version, we lookup existing profiles by email first.
      // If profile doesn't exist, we skip (Real app would send invite).
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('email', emails);

      if (pError) throw pError;
      if (!profiles || profiles.length === 0) return false;

      const enrollments = profiles.map(p => ({
        course_id: courseId,
        student_id: p.id,
        role: 'student'
      }));

      const { error } = await supabase
        .from('enrollments')
        .upsert(enrollments, { onConflict: ['course_id', 'student_id'] });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('api.enrollStudents failed:', err.message);
      throw err;
    }
  },

  async createComment(commentData) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          reflection_id: commentData.reflectionId,
          user_id: commentData.userId,
          type: commentData.type,
          content: commentData.content
        }])
        .select()
        .single();

      if (error) throw error;
      return mapComment(data);
    } catch (err) {
      console.warn('api.createComment: Failed.', err.message);
      return { id: `comm-${Date.now()}`, ...commentData, createdAt: new Date().toISOString() };
    }
  },

  async createReaction(reactionData) {
    try {
      const { data, error } = await supabase
        .from('reactions')
        .insert([{
          reflection_id: reactionData.reflectionId,
          user_id: reactionData.userId,
          type: reactionData.type
        }])
        .select()
        .single();

      if (error) throw error;
      return mapReaction(data);
    } catch (err) {
      console.warn('api.createReaction: Failed.', err.message);
      return { id: `rx-${Date.now()}`, ...reactionData, createdAt: new Date().toISOString() };
    }
  },

  async updateReflection(id, updates) {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .update({
          title: updates.title,
          content: updates.content,
          status: updates.status,
          privacy: updates.privacy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapReflection(data);
    } catch (err) {
      console.error(`api.updateReflection(${id}) Failed:`, err.message);
      throw err;
    }
  },

  async getAnnotations(filters = {}) {
    try {
      let query = supabase.from('annotations').select('*');
      if (filters.reflectionId) query = query.eq('reflection_id', filters.reflectionId);
      if (filters.essayId) query = query.eq('essay_id', filters.essayId);
      
      const { data, error } = await query;
      if (error || !data) return [];
      return data;
    } catch (err) {
      return [];
    }
  },

  async createAnnotation(annotationData) {
    try {
      const { data, error } = await supabase
        .from('annotations')
        .insert([{
          reflection_id: annotationData.reflectionId,
          essay_id: annotationData.essayId,
          professor_id: annotationData.professorId,
          paragraph_index: annotationData.paragraphIndex,
          move_type: annotationData.moveType,
          selected_text: annotationData.selectedText,
          comment: annotationData.comment
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('api.createAnnotation: Failed.', err.message);
      return { id: `ann-${Date.now()}`, ...annotationData, createdAt: new Date().toISOString() };
    }
  },

  async getProfile(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return mock.users[id] || { id, name: 'Unknown', role: 'student' };
      }
      
      return data;
    } catch (err) {
      return mock.users[id] || { id, name: 'Unknown', role: 'student' };
    }
  }
};
