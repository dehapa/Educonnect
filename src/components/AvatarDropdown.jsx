"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AvatarDropdown() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push("/");
    router.refresh();
    setTimeout(() => { window.location.href = "/"; }, 100);
  };

  // Determine the profile link based on role
  let profileLink = "/dashboard";
  if (profile?.role === "student") profileLink = `/student/${user.uid}`;
  if (profile?.role === "teacher") profileLink = `/teacher/${user.uid}`;
  if (profile?.role === "institution") profileLink = `/institutions/${user.uid}`;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          background: "transparent", 
          border: "none", 
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "30px",
          transition: "background 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        onMouseOut={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ 
          width: "42px", 
          height: "42px", 
          borderRadius: "50%", 
          padding: "2px", 
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
        }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--bg-primary)" }} 
            />
          ) : (
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-primary)", color: "var(--text-muted)" }}>
              <User size={20} />
            </div>
          )}
        </div>
        <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: "0",
          marginTop: "12px",
          width: "280px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          zIndex: 1000,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Top Block: Profile Info & View Profile Button */}
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "12px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={32} color="var(--text-muted)" />
              )}
            </div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {user.displayName || "EduConnect User"}
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
              {profile?.role || "User"} Account
            </p>
            <Link 
              href={profileLink} 
              onClick={() => setIsOpen(false)}
              className="btn-primary" 
              style={{ width: "100%", justifyContent: "center", borderRadius: "100px", padding: "8px" }}
            >
              View Public Profile
            </Link>
          </div>

          {/* Middle Block: Quick Links */}
          <div style={{ padding: "8px" }}>
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", borderRadius: "8px", transition: "background 0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <LayoutDashboard size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>Dashboard</span>
            </Link>
            <Link 
              href="/dashboard?tab=settings" 
              onClick={() => setIsOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", color: "var(--text-primary)", textDecoration: "none", borderRadius: "8px", transition: "background 0.2s" }}
              onMouseOver={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <Settings size={18} color="var(--text-muted)" />
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>Account Settings</span>
            </Link>
          </div>

          {/* Bottom Block: Logout */}
          <div style={{ padding: "8px", borderTop: "1px solid var(--border-primary)" }}>
            <button 
              onClick={handleLogout}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", borderRadius: "8px", transition: "background 0.2s", textAlign: "left" }}
              onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={18} />
              <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
