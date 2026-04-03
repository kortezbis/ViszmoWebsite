import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useClerkSession, syncSupabaseAuth } from '../lib/clerk';

interface Profile {
  id: string;
  onboarding_completed: boolean;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  showSurvey: boolean;
  setShowSurvey: (show: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType>({ 
  profile: null, 
  loading: true,
  refreshProfile: async () => {},
  showSurvey: false,
  setShowSurvey: () => {}
});

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, userId, userName, userImageUrl, userEmail, getToken } = useClerkSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);

  const fetchProfile = async (id: string) => {
    try {
      // Sync auth first to ensure Supabase knows who we are
      await syncSupabaseAuth(getToken);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, create one for this Clerk user
          const newProfile = { 
            id: id, 
            onboarding_completed: false,
            full_name: userName || undefined,
            avatar_url: userImageUrl || undefined,
            email: userEmail || undefined
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            setProfile(insertedData);
          }
        } else {
          console.error('Error fetching profile:', error);
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (userId) await fetchProfile(userId);
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      fetchProfile(userId);
    } else {
      setProfile(null);
      setLoading(false);
      setShowSurvey(false);
    }
  }, [isSignedIn, userId]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile, showSurvey, setShowSurvey }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
