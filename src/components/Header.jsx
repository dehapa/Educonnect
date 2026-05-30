"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { Sun, Moon, Menu, X, GraduationCap, LogOut, Shield } from "lucide-react";

export default function Header() {
  const { user, profile, logout } = useAuth();
  const [theme, setTheme] = useState("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Institutions", href: "/#institutions" },
    { name: "Jobs & Careers", href: "/#jobs" },
    { name: "Student Hub", href: "/#students" },
  ];

  // Capitalize roles
  const formatRole = (role) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="glass-header">
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
        
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "1.4rem", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <GraduationCap size={24} />
          </div>
          <span>Edu<span style={{ color: "var(--primary)" }}>Connect</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }} className="desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              style={{ fontWeight: "500", fontSize: "0.95rem", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
            >
              {link.name}
            </Link>
          ))}
          {/* Admin Panel Link (Show if logged in user is super_admin, admin, or manager) */}
          {profile && ["super_admin", "admin", "manager"].includes(profile?.role) && (
            <Link 
              href="/admin" 
              style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--accent)", display: "flex", alignItems: "center", gap: "6px" }}
              onMouseEnter={(e) => e.target.style.color = "var(--accent-hover)"}
              onMouseLeave={(e) => e.target.style.color = "var(--accent)"}
            >
              <Shield size={16} />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* Action Controls (Desktop) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }} className="desktop-only">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: "8px" }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            /* User Panel (Logged In) */
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }} title="Go to Dashboard">
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-primary)" }}>
                    {profile?.name || user.displayName || "User"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "600" }}>
                    {formatRole(profile?.role) || "User"}
                  </div>
                </div>
                
                {/* Profile Image / Initials */}
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "1rem",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  {(profile?.name || user.displayName || "U").charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={logout}
                className="btn-secondary" 
                style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            /* Auth Trigger Buttons (Logged Out) */
            <>
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                Login
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }} className="mobile-only-flex">
          <button onClick={toggleTheme} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div style={{ 
          background: "var(--bg-secondary)", 
          borderTop: "1px solid var(--border-primary)", 
          padding: "20px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "16px",
          position: "absolute",
          top: "80px",
          left: 0,
          right: 0,
          zIndex: 99,
          boxShadow: "var(--shadow-lg)"
        }} className="mobile-only">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              style={{ fontWeight: "600", fontSize: "1.1rem", padding: "8px 0", borderBottom: "1px solid var(--bg-tertiary)" }}
            >
              {link.name}
            </Link>
          ))}
          {profile && ["super_admin", "admin", "manager"].includes(profile?.role) && (
            <Link 
              href="/admin" 
              onClick={() => setIsMenuOpen(false)}
              style={{ fontWeight: "600", fontSize: "1.1rem", padding: "8px 0", borderBottom: "1px solid var(--bg-tertiary)", color: "var(--accent)" }}
            >
              Admin Panel
            </Link>
          )}
          
          {user ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "var(--primary)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700"
                }}>
                  {(profile?.name || user.displayName || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "700" }}>{profile?.name || user.displayName}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{formatRole(profile?.role)}</div>
                </div>
              </div>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn-secondary" style={{ padding: "10px" }}>
                <LogOut size={16} style={{ marginRight: "6px" }} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
              <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="btn-secondary" style={{ flex: 1, padding: "12px" }}>Login</button>
              <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="btn-primary" style={{ flex: 1, padding: "12px" }}>Register</button>
            </div>
          )}
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Styling for Responsive Layouts */}
      <style jsx global>{`
        .desktop-only {
          display: flex;
        }
        .mobile-only, .mobile-only-flex {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          .mobile-only-flex {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}
