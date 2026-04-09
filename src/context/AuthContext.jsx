import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext({
  user: null,          // Our custom public.profiles record
  session: null,       // Supabase auth session
  role: null,          // Shortcut to user.role
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
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

    try {
      console.log('AuthContext: Fetching profile for', authUser.email, authUser.id);
      
      // 1. Check if profile exists
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('AuthContext: DB Profile lookup error:', profileError);
      }

      // 2. Fetch whitelist metadata (case-insensitive)
      // Note: RLS on allowed_emails now allows self-lookup via auth.jwt()
      const { data: inviteData, error: inviteError } = await supabase
        .from('allowed_emails')
        .select('name, register_number, role')
        .ilike('email', authUser.email)
        .maybeSingle();
      
      if (inviteError) {
        console.error('AuthContext: Whitelist lookup error (Check RLS):', inviteError);
      } else {
        console.log('AuthContext: Whitelist data found:', inviteData);
      }

      const initialRole = inviteData?.role || 'student';
      const initialName = inviteData?.name || authUser.email.split('@')[0];
      const initialRegNo = inviteData?.register_number || null;

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist -> First login, provision
        console.log('AuthContext: PROVISIONING new profile for', authUser.email, 'with role:', initialRole);
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: authUser.id, 
            email: authUser.email,
            name: initialName,
            register_number: initialRegNo,
            role: initialRole 
          }])
          .select()
          .single();
          
        if (insertError) {
          console.error('AuthContext: Provisioning Insert Error:', insertError);
          // If insert fails, we can't proceed with a profile-less session in our app
          window.dispatchEvent(new CustomEvent('authError', { detail: 'Profile provisioning failed.' }));
          throw insertError;
        }
        profile = newProfile;
      } else if (profile && inviteData) {
        // Role Sync Protection Logic:
        // 1. If user is currently an Admin, do NOT demote them automatically.
        // 2. Otherwise, sync with whitelist (promote to professor or demote to student if whitelist changed).
        
        let shouldUpdateRole = false;
        if (profile.role === 'admin') {
          // Admins are never demoted automatically by this sync for safety.
          shouldUpdateRole = false; 
        } else if (profile.role !== initialRole) {
          // Sync student/professor roles with whitelist
          shouldUpdateRole = true;
        }

        if (shouldUpdateRole) {
          console.log(`AuthContext: SYNCING role for ${authUser.email}: ${profile.role} -> ${initialRole}`);
          const { data: updatedProfile, error: syncError } = await supabase
            .from('profiles')
            .update({ 
              role: initialRole,
              // Also sync name/regNO if they are missing in profile but present in whitelist
              name: profile.name || initialName,
              register_number: profile.register_number || initialRegNo
            })
            .eq('id', authUser.id)
            .select()
            .single();
          
          if (syncError) {
            console.error('AuthContext: Role Sync Error:', syncError);
          } else if (updatedProfile) {
            profile = updatedProfile;
          }
        }
      }

      setUser(profile || null);
    } catch (err) {
      console.error('AuthContext: CRITICAL Auth Error for', authUser.email, ':', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
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

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      console.error('Login Error:', error.message);
      window.dispatchEvent(new CustomEvent('authError', { detail: error.message }));
      return false;
    }
    return true;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      console.error('SignUp Error:', error.message);
      window.dispatchEvent(new CustomEvent('authError', { detail: error.message }));
      return false;
    }
    
    // If signup is successful, we wait for the trigger to create the profile.
    // Supabase will automatically sign the user in depending on "Confirm Email" setting.
    return true;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      console.error('Password Reset Error:', error.message);
      window.dispatchEvent(new CustomEvent('authError', { detail: error.message }));
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
      signUp,
      resetPassword,
      logout,
      updateUser,
      setRole: setRoleOverride,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
