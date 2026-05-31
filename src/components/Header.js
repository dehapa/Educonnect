"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { BookOpen, User, LogIn, Menu, X, ChevronDown } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))) return null;
  const [pages, setPages] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const q = query(collection(db, "pages"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Ensure home page is first, and sort the rest
        const homePage = data.find(p => p.slug === "home");
        const otherPages = data.filter(p => p.slug !== "home").sort((a, b) => a.title.localeCompare(b.title));
        
        let finalPages = [];
        if (homePage) finalPages.push(homePage);
        finalPages = [...finalPages, ...otherPages];
        
        setPages(finalPages);
      } catch (err) {
        console.error("Error fetching pages for header menu:", err);
      }
    };
    fetchPages();
  }, []);

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 1000,
      background: "rgba(11, 17, 32, 0.95)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "16px 24px",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* LEFT: Logo & Slogan */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <div style={{ background: "#3b82f6", padding: "10px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
              EduConnect
            </h1>
            <p className="desktop-slogan" style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0, fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>
              Learn • Grow • Succeed
            </p>
          </div>
        </Link>

        {/* MIDDLE: Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: "none" }}>
          <ul style={{ display: "flex", gap: "24px", listStyle: "none", margin: 0, padding: 0 }}>
            {pages.map((page) => (
              <li key={page.id}>
                <Link 
                  href={page.slug === "home" ? "/" : `/${page.slug}`} 
                  style={{ 
                    color: "#cbd5e1", 
                    textDecoration: "none", 
                    fontSize: "0.95rem", 
                    fontWeight: "500",
                    transition: "color 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.color = "#3b82f6"}
                  onMouseOut={(e) => e.target.style.color = "#cbd5e1"}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT: Auth & Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {user ? (
            <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flexDirection: "column", alignItems: "flex-end" }} className="user-name-display">
                <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#f8fafc", textAlign: "right" }}>
                  {user.displayName || "User"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#3b82f6", fontWeight: "500", textAlign: "right" }}>
                  Dashboard
                </span>
              </div>
              <div style={{ 
                width: "42px", 
                height: "42px", 
                borderRadius: "50%", 
                padding: "2px", 
                background: "linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #FFD700 100%)", // Rich Gold Border
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              title="Go to Dashboard"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #0B1120" }} 
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0B1120" }}>
                    <User size={20} color="#94a3b8" />
                  </div>
                )}
              </div>
            </Link>
          ) : (
            <div className="desktop-auth" style={{ display: "flex", gap: "12px" }}>
              <Link href="/dashboard" style={{ 
                display: "flex", alignItems: "center", gap: "8px", 
                background: "rgba(255,255,255,0.1)", color: "white", 
                padding: "8px 16px", borderRadius: "8px", 
                textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" 
              }}>
                Login
              </Link>
              <Link href="/dashboard" style={{ 
                display: "flex", alignItems: "center", gap: "8px", 
                background: "#3b82f6", color: "white", 
                padding: "8px 16px", borderRadius: "8px", 
                textDecoration: "none", fontWeight: "600", fontSize: "0.9rem" 
              }}>
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "none" }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Global Styles for Header Responsiveness */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .desktop-nav { display: block !important; }
          .user-name-display { display: flex !important; }
          .desktop-auth { display: flex !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: block !important; }
          .user-name-display { display: none !important; }
          .desktop-auth { display: none !important; }
        }
        @media (max-width: 480px) {
          .desktop-slogan { display: none !important; }
          h1 { fontSize: "1.2rem" !important; }
        }
      `}} />

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "20px" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {pages.map((page) => (
              <li key={page.id}>
                <Link 
                  href={page.slug === "home" ? "/" : `/${page.slug}`} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ color: "white", textDecoration: "none", fontSize: "1.1rem", fontWeight: "500", display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {page.title}
                </Link>
              </li>
            ))}
            
            {!user && (
              <>
                <li>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: "#3b82f6", textDecoration: "none", fontSize: "1.1rem", fontWeight: "600", display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: "#10b981", textDecoration: "none", fontSize: "1.1rem", fontWeight: "600", display: "block", padding: "8px 0" }}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
