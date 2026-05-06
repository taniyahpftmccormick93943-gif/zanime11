import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreUtils';

interface UserProfile {
  isPro: boolean;
  isAdmin: boolean;
  uid: string;
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

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userPath = `users/${currentUser.uid}`;
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            // Create initial profile
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
            try {
              await setDoc(doc(db, 'users', currentUser.uid), initialProfile);
              setProfile({ uid: currentUser.uid, isPro: false, isAdmin: isAdmin });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, userPath);
            }
          }
        } catch (error) {
          // If it's a permission error, we use the helper
          if (error instanceof Error && error.message.includes('permission')) {
             handleFirestoreError(error, OperationType.GET, userPath);
          } else {
             console.error("Error fetching user profile:", error);
          }
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
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
