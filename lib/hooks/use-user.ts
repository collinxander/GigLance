'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Database } from '../database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user from Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUser(null);
          return;
        }
        
        // Get the user's profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  return { 
    user, 
    loading,
    isLoading: loading,
    isAuthenticated: !!user
  };
} 