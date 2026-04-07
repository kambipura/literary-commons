import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext({
  user: null,          // Our custom public.profiles record
  session: null,       // Supabase auth session
  role: null,          // Shortcut to user.role
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
  setRole: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [roleOverride, setRoleOverride] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch public.profiles based on auth.user ID
  const fetchProfile = async (authSession) => {
    if (!authSession?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const authUser = authSession.user;

    // See if profile exists
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist -> First login, provision as student
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authUser.id, 
          email: authUser.email,
          name: authUser.email.split('@')[0], // Extract prefix as initial name
          role: 'student' 
        }])
        .select()
        .single();
        
      if (insertError) {
        console.error('RLS Blocked Auto-Provisioning Profile:', insertError);
      } else {
        profile = newProfile;
      }
    } else if (error) {
      console.error('Profile fetch error:', error);
    }

    setUser(profile || null);
    setIsLoading(false);
  };

  useEffect(() => {
    // 1. Get initial session from active tab
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

    // 2. Listen for auth changes (login, logout, magic link clicks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        fetchProfile(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password = null) => {
    if (password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Password Login Error:', error.message);
        return false;
      }
      return true;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      console.error('Magic Link Error:', error.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
  };

  const updateUser = async (updates) => {
    if (!user) return;
    
    // Only updating state locally for UI immediacy, 
    // real update goes to Supabase
    setUser(prev => ({ ...prev, ...updates }));

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role: roleOverride || user?.role || null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      setRole: setRoleOverride,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
