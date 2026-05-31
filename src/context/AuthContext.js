"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user role profile from Firestore
        try {
          const docRef = doc(db, "users", currentUser.uid);
          let docSnap = await getDoc(docRef);
          let data = null;
          
          if (docSnap.exists()) {
            data = docSnap.data();
          } else {
            // Check if there is an existing pre-created profile with this email (e.g. created by admin)
            const emailClean = currentUser.email.trim().toLowerCase();
            const q = query(collection(db, "users"), where("email", "==", emailClean));
            const querySnap = await getDocs(q);
            
            if (!querySnap.empty) {
              const matchedDoc = querySnap.docs[0];
              const preCreatedData = matchedDoc.data();
              
              // Copy data to the new UID document
              const updatedProfile = {
                ...preCreatedData,
                uid: currentUser.uid,
              };
              
              await setDoc(doc(db, "users", currentUser.uid), updatedProfile);
              
              // Delete the old placeholder document if it used a temporary ID
              if (matchedDoc.id !== currentUser.uid) {
                await deleteDoc(doc(db, "users", matchedDoc.id));
              }
              
              data = updatedProfile;
            }
          }
          
          if (data) {
            // Automatically promote shyamdash@gmail.com to super_admin
            if (currentUser.email.trim().toLowerCase() === "shyamdash@gmail.com" && data.role !== "super_admin") {
              data.role = "super_admin";
            }
            setProfile(data);
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up user with email & role
  const signup = async (email, password, name, role) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      let finalRole = role;
      if (email.trim().toLowerCase() === "shyamdash@gmail.com") {
        finalRole = "super_admin";
      }
      
      const userProfile = {
        uid: newUser.uid,
        name,
        email,
        role: finalRole, // "student" | "teacher" | "employer" | "admin" | "super_admin"
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", newUser.uid), userProfile);
      setProfile(userProfile);
      setLoading(false);
      return newUser;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Sign in with Google (Gmail)
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });
      const userCredential = await signInWithPopup(auth, provider);
      const loggedUser = userCredential.user;
      
      // Check if user profile already exists in Firestore
      const docRef = doc(db, "users", loggedUser.uid);
      const docSnap = await getDoc(docRef);
      
      let exists = docSnap.exists();
      let userProfile = null;
      
      if (exists) {
        userProfile = docSnap.data();
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
      return { user: loggedUser, exists, profile: userProfile };
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Create profile for new Google Sign-Ins
  const saveUserProfile = async (uid, name, email, role) => {
    setLoading(true);
    try {
      let finalRole = role;
      if (email.trim().toLowerCase() === "shyamdash@gmail.com") {
        finalRole = "super_admin";
      }
      const userProfile = {
        uid,
        name,
        email,
        role: finalRole, // "student" | "teacher" | "employer" | "admin" | "super_admin"
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", uid), userProfile);
      setProfile(userProfile);
      setLoading(false);
      return userProfile;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Email/Password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;
      
      const docRef = doc(db, "users", loggedUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
      
      setLoading(false);
      return loggedUser;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  };

  // Log out
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      
      // Forcefully clear web storage where Firebase might cache fallback tokens
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Wait 500ms for Firebase to clear IndexedDB/Local storage tokens to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, saveUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
