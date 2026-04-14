'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  toggleContact: (contactId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          const newProfile = {
            uid: user.uid,
            name: user.displayName || 'Membro Skillsy',
            email: user.email || '',
            photoURL: user.photoURL || '',
            isProvider: false,
            role: 'user',
            contacts: [],
            createdAt: serverTimestamp(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      await updateProfile(res.user, { displayName: name });
      
      const docRef = doc(db, 'users', res.user.uid);
      const newProfile = {
        uid: res.user.uid,
        name: name,
        email: email,
        photoURL: '',
        isProvider: false,
        role: 'user',
        contacts: [],
        createdAt: serverTimestamp(),
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile);
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
    
    const docRef = doc(db, 'users', user.uid);
    const isContact = profile.contacts?.includes(contactId);
    
    try {
      await updateDoc(docRef, {
        contacts: isContact ? arrayRemove(contactId) : arrayUnion(contactId)
      });
      
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, toggleContact, logout }}>
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
