
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define types for the user profile
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  updated_at?: string;
  created_at?: string;
  website?: string;
  bio?: string;
  subscription_status?: string;
  role?: string;
}

// Define the Auth context type
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>; // Add the signOut function to the context type
}

// Create the Auth context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  error: null,
  refreshProfile: async () => {},
  signOut: async () => {}, // Initialize with an empty function
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        console.log("Auth state changed: INITIAL_SESSION");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          console.log("User signed in");
          await fetchUserProfile(data.session.user.id);
        }
      } catch (e: any) {
        console.error("Error during auth session fetch:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    // Call the function to fetch the initial session
    fetchInitialSession();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event);
      
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      } else if (event === 'USER_UPDATED' && newSession?.user) {
        await fetchUserProfile(newSession.user.id);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Get profile from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // If profile doesn't exist, create it
        const newProfile = {
          id: userId,
          username: user?.email?.split('@')[0],
          full_name: '',
          avatar_url: '',
          email: user?.email,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return;
        }

        setProfile(newProfile as UserProfile);
      }
    } catch (e: any) {
      console.error("Error during profile fetch:", e);
      setError(e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Implement the signOut function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Provide feedback to the user
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      
      // Navigate to home page (this should happen in the component that calls signOut)
    } catch (e: any) {
      console.error("Error signing out:", e);
      toast({
        title: "Error signing out",
        description: e.message || "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        profile,
        session,
        isLoading,
        error,
        refreshProfile,
        signOut, // Add the signOut function to the context
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
