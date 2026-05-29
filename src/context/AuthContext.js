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
import { doc, getDoc, setDoc } from "firebase/firestore";
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
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data());
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
      
      const userProfile = {
        uid: newUser.uid,
        name,
        email,
        role, // "student" | "teacher" | "employer" | "admin"
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
      const userProfile = {
        uid,
        name,
        email,
        role, // "student" | "teacher" | "employer" | "admin"
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
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, saveUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
