
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'student' | 'teacher';

export interface Profile {
  id: string;
  user_role: UserRole;
  full_name: string;
  email: string;
  department: string;
  student_id?: string;
  position?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  department: string;
  user_role: UserRole;
  student_id?: string;
  position?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileData) {
            setProfile({
              id: profileData.id,
              user_role: profileData.user_role as UserRole,
              full_name: profileData.full_name,
              email: profileData.email,
              department: profileData.department,
              student_id: profileData.student_id,
              position: profileData.position
            });
          }
        } else {
          setProfile(null);
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData) {
              setProfile({
                id: profileData.id,
                user_role: profileData.user_role as UserRole,
                full_name: profileData.full_name,
                email: profileData.email,
                department: profileData.department,
                student_id: profileData.student_id,
                position: profileData.position
              });
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (data: SignUpData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          user_role: data.user_role,
          full_name: data.full_name,
          department: data.department,
          student_id: data.student_id,
          position: data.position,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, signIn, signUp, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
