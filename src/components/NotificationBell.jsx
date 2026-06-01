"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = [];
      let unread = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({ id: docSnap.id, ...data });
        if (!data.isRead) {
          unread++;
        }
      });
      setNotifications(fetched);
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);

    // Mark as read
    if (!notification.isRead) {
      try {
        const notifRef = doc(db, "users", userId, "notifications", notification.id);
        await updateDoc(notifRef, { isRead: true });
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    // Redirect
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins || 1}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  if (!userId) return null;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn"
        style={{ 
          background: "transparent", 
          border: "none", 
          color: "var(--text-primary)", 
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "background 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "#ef4444", // Red badge
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "bold",
            padding: "2px 6px",
            borderRadius: "100px",
            border: "2px solid var(--bg-secondary)"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: "0",
          marginTop: "12px",
          width: "320px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000,
          overflow: "hidden"
        }}>
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}>
                Mark all read
              </span>
            )}
          </div>
          
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)" }}>
                <Bell size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                No new notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{ 
                    padding: "16px", 
                    borderBottom: "1px solid var(--border-primary)", 
                    background: notif.isRead ? "transparent" : "rgba(59, 130, 246, 0.05)",
                    cursor: "pointer",
                    display: "flex",
                    gap: "12px",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => { if (notif.isRead) e.currentTarget.style.background = "var(--bg-tertiary)" }}
                  onMouseOut={(e) => { if (notif.isRead) e.currentTarget.style.background = "transparent" }}
                >
                  <div style={{ width: "8px", display: "flex", justifyContent: "center", marginTop: "6px" }}>
                    {!notif.isRead && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }}></div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "0.9rem", color: notif.isRead ? "var(--text-secondary)" : "var(--text-primary)", fontWeight: notif.isRead ? "400" : "500", lineHeight: "1.4" }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <Link href="/notifications" style={{ display: "block", padding: "12px", textAlign: "center", background: "var(--bg-tertiary)", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none", borderTop: "1px solid var(--border-primary)" }}>
              View All
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
