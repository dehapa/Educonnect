"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserPlus, UserCheck, Clock, UserMinus } from "lucide-react";

// The ConnectButton allows users to send connection requests to each other.
export default function ConnectButton({ targetUserId, targetName }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("none"); // none, pending, connected
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !targetUserId || user.uid === targetUserId) {
      setLoading(false);
      return;
    }

    const checkConnectionStatus = async () => {
      try {
        // We'll store connections in a subcollection under the user's document
        // Path: users/{currentUserId}/connections/{targetUserId}
        const connRef = doc(db, "users", user.uid, "connections", targetUserId);
        const connSnap = await getDoc(connRef);
        
        if (connSnap.exists()) {
          setStatus(connSnap.data().status); // "pending" or "connected"
        } else {
          setStatus("none");
        }
      } catch (err) {
        console.error("Error checking connection status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkConnectionStatus();
  }, [user, targetUserId]);

  const handleConnect = async () => {
    if (!user) {
      alert("Please log in to connect with " + targetName);
      return;
    }
    setLoading(true);
    try {
      // Set status to pending on both sides
      const myConnRef = doc(db, "users", user.uid, "connections", targetUserId);
      const theirConnRef = doc(db, "users", targetUserId, "connections", user.uid);
      
      await setDoc(myConnRef, {
        targetId: targetUserId,
        targetName: targetName,
        status: "pending", // I requested them
        isInitiator: true,
        timestamp: serverTimestamp()
      });

      await setDoc(theirConnRef, {
        targetId: user.uid,
        targetName: user.displayName || "User", // This should be fetched from profile ideally
        status: "pending", // They have a pending request from me
        isInitiator: false,
        timestamp: serverTimestamp()
      });

      setStatus("pending");
    } catch (err) {
      console.error("Error sending connection request:", err);
      alert("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to remove ${targetName} from your network?`)) return;
    setLoading(true);
    try {
      const myConnRef = doc(db, "users", user.uid, "connections", targetUserId);
      const theirConnRef = doc(db, "users", targetUserId, "connections", user.uid);
      
      await deleteDoc(myConnRef);
      await deleteDoc(theirConnRef);
      
      setStatus("none");
    } catch (err) {
      console.error("Error removing connection:", err);
    } finally {
      setLoading(false);
    }
  };

  // Do not render button if not logged in or viewing own profile
  if (!user || user.uid === targetUserId) return null;

  if (loading) return <button disabled className="btn-secondary" style={{ opacity: 0.5 }}>Loading...</button>;

  if (status === "connected") {
    return (
      <button onClick={handleDisconnect} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", border: "1px solid var(--success)" }}>
        <UserCheck size={16} /> Connected
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button onClick={handleDisconnect} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)", border: "1px solid var(--warning)" }}>
        <Clock size={16} /> Pending
      </button>
    );
  }

  return (
    <button onClick={handleConnect} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <UserPlus size={16} /> Connect
    </button>
  );
}
