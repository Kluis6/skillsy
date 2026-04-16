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
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  toggleContact: (contactId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
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
            // Check if there's a pre-registered profile by email (e.g. created by another admin)
            const existingByEmail = await UserService.getProfileByEmail(user.email || '');
            
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

          // Blocked user redirection
          if (userProfile?.isBlocked && pathname !== '/blocked') {
            router.push('/blocked');
          }

          // Admin redirection upon login (if on home page)
          if (userProfile?.role === 'admin' && pathname === '/') {
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await firebaseUpdateProfile(res.user, { displayName: name });
      
      const newProfile: Partial<UserProfile> = {
        uid: res.user.uid,
        name: name,
        email: email,
        photoURL: '',
        isProvider: false,
        role: 'user',
        contacts: [],
      };
      await UserService.createProfile(newProfile);
      const userProfile = await UserService.getProfile(res.user.uid);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const toggleContact = async (contactId: string) => {
    if (!user || !profile) return;
    
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
      setProfile((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error updating profile:', error);
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
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, toggleContact, updateProfile, logout }}>
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
