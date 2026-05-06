import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, auth, db } from './firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreUtils';

interface UserProfile {
  isPro: boolean;
  isAdmin: boolean;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPro: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null,
  loading: true, 
  isAdmin: false,
  isPro: false 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        const userPath = `users/${currentUser.uid}`;
        const profileRef = doc(db, 'users', currentUser.uid);

        // First check if profile exists, if not create it
        try {
          const snap = await getDoc(profileRef);
          if (!snap.exists()) {
            const isAdmin = currentUser.email === 'taniyahpftmccormick93943@gmail.com';
            const initialProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              isPro: false,
              isAdmin: isAdmin,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(profileRef, initialProfile);
          }
        } catch (err) {
          console.error("Error checking/creating profile:", err);
        }

        // Real-time listener for the profile
        unsubscribeProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, userPath);
        });
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.isAdmin || user?.email === 'taniyahpftmccormick93943@gmail.com';
  const isPro = profile?.isPro || false;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isPro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
