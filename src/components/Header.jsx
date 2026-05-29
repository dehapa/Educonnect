"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Menu, X, GraduationCap, Briefcase, Users, MapPin, Search } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { name: "Institutions", href: "#institutions" },
    { name: "Jobs & Careers", href: "#jobs" },
    { name: "Student Hub", href: "#students" },
    { name: "Teachers", href: "#teachers" },
  ];

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
          
          {/* Auth Button */}
          <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
            Login
          </button>
          <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
            Register
          </button>
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
          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button className="btn-secondary" style={{ flex: 1, padding: "12px" }}>Login</button>
            <button className="btn-primary" style={{ flex: 1, padding: "12px" }}>Register</button>
          </div>
        </div>
      )}

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
