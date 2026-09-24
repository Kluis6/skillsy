'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  toggleContact: (contactId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  cancelAccount: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          let userProfile = await UserService.getProfile(user.uid);
          
          if (!userProfile) {
            // Check if there's a pre-registered profile by email (e.g. created by another admin).
            // Only verified emails may claim it; the rules deny this read otherwise.
            const existingByEmail =
              user.email && user.emailVerified
                ? await UserService.getProfileByEmail(user.email)
                : null;
            
            if (existingByEmail && (!existingByEmail.uid || existingByEmail.uid === "")) {
              // This is a pre-registered profile without a valid UID yet
              const updatedProfile: Partial<UserProfile> = {
                ...existingByEmail,
                uid: user.uid,
                name: user.displayName || existingByEmail.name || 'Membro Skillsy',
                photoURL: user.photoURL || existingByEmail.photoURL || '',
                email: user.email || existingByEmail.email,
              };
              await UserService.createProfile(updatedProfile);
              userProfile = await UserService.getProfile(user.uid);
            } else {
              // Bootstrap admin check
              const isBootstrapAdmin = user.email === "luislmorningstar@gmail.com" && user.emailVerified;
              
              const newProfile: Partial<UserProfile> = {
                uid: user.uid,
                name: user.displayName || 'Membro Skillsy',
                email: user.email || '',
                photoURL: user.photoURL || '',
                isProvider: false,
                role: isBootstrapAdmin ? 'admin' : 'user',
                contacts: [],
              };
              await UserService.createProfile(newProfile);
              userProfile = await UserService.getProfile(user.uid);
            }
          }
          setProfile(userProfile);

          if (userProfile?.isDeleted) {
            setProfile(null);
            await signOut(auth);
            if (pathname !== '/') {
              router.push('/');
            }
            return;
          }

          // Blocked user redirection
          if (userProfile?.isBlocked && pathname !== '/blocked') {
            router.push('/blocked');
          }

          // Admin redirection upon login (if not already in admin area)
          if (userProfile?.role === 'admin' && !pathname.startsWith('/admin')) {
            router.push('/admin');
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      // Immediate redirection attempt after login
      const profile = await UserService.getProfile(res.user.uid);
      if (profile?.role === 'admin') {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // The onAuthStateChanged listener creates the profile for every new
  // account; creating it here as well raced with it and failed the rules.
  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      // Immediate redirection attempt after login
      const profile = await UserService.getProfile(res.user.uid);
      if (profile?.role === 'admin') {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const toggleContact = async (contactId: string) => {
    if (!user || !profile) {
      toast.error('Login necessário', {
        description: 'Você precisa estar logado para salvar contatos.'
      });
      return;
    }
    
    const isContact = profile.contacts?.includes(contactId);
    
    try {
      await UserService.toggleContact(user.uid, contactId, !isContact);
      
      // Update local profile state
      setProfile((prev: any) => ({
        ...prev,
        contacts: isContact 
          ? prev.contacts.filter((id: string) => id !== contactId)
          : [...(prev.contacts || []), contactId]
      }));
    } catch (error) {
      console.error('Error toggling contact:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      await UserService.updateProfile(user.uid, data);
      const refreshedProfile = await UserService.getProfile(user.uid);
      setProfile(refreshedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const cancelAccount = async () => {
    if (!user) return;
    try {
      await UserService.cancelOwnAccount(user.uid, user.email || '');
      setProfile(null);
      await signOut(auth);
      router.replace('/');
      router.refresh();
    } catch (error) {
      console.error('Error canceling account:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, toggleContact, updateProfile, cancelAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
