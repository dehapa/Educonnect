"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { BookOpen, User, LogIn, Menu, X, ChevronDown, Loader, MessageSquare } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  
  if (pathname && pathname.startsWith("/admin")) return null;
  const [pages, setPages] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const q = query(collection(db, "pages"), where("status", "==", "published"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter to only include pages with showInMenu = true
        const homePage = data.find(p => p.slug === "home" && p.showInMenu);
        const otherPages = data.filter(p => p.slug !== "home" && p.showInMenu).sort((a, b) => a.title.localeCompare(b.title));
        
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get("ref");
    if (refId && !sessionStorage.getItem(`tracked_ref_${refId}`)) {
      import("firebase/firestore").then(({ collection, addDoc, serverTimestamp }) => {
        addDoc(collection(db, "referrals"), {
          referrerId: refId,
          path: window.location.pathname,
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent
        }).then(() => {
          sessionStorage.setItem(`tracked_ref_${refId}`, "true");
        }).catch(err => console.error("Error tracking referral:", err));
      });
    }
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
      padding: "20px 32px",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* LEFT: Logo & Slogan */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "16px", textDecoration: "none" }}>
            <div style={{ background: "#3b82f6", padding: "12px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={32} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", margin: 0, letterSpacing: "-0.5px" }}>
                EduConnect
              </h1>
              <p className="desktop-slogan" style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0, fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>
                Learn • Grow • Succeed
              </p>
            </div>
          </Link>
        </div>

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
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flexDirection: "column", alignItems: "flex-end" }} className="user-name-display">
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#f8fafc", textAlign: "right", marginRight: "12px" }}>
                  {user.displayName || "User"}
                </span>
              </div>
              <Link href="/inbox" style={{ 
                width: "40px", 
                height: "40px", 
                borderRadius: "50%", 
                background: "rgba(59, 130, 246, 0.15)", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#3b82f6",
                marginRight: "8px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.3)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)"}
              title="Go to Inbox"
              >
                <MessageSquare size={20} />
              </Link>
              <Link href="/dashboard" style={{ 
                width: "50px", 
                height: "50px", 
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
                    <User size={24} color="#94a3b8" />
                  </div>
                )}
              </Link>
              <Link href="/dashboard" className="desktop-dashboard-btn" style={{ 
                display: "none", 
                alignItems: "center", 
                gap: "8px", 
                background: "rgba(59, 130, 246, 0.15)", 
                color: "#3b82f6", 
                padding: "8px 16px", 
                borderRadius: "8px", 
                textDecoration: "none", 
                fontWeight: "600", 
                fontSize: "0.9rem",
                border: "1px solid rgba(59, 130, 246, 0.3)"
              }}>
                Dashboard
              </Link>
              <button 
                onClick={async () => {
                  setIsLoggingOut(true);
                  await logout();
                  router.push("/");
                  router.refresh();
                  setTimeout(() => { window.location.href = "/"; }, 100);
                }}
                disabled={isLoggingOut}
                className="desktop-dashboard-btn" 
                style={{ 
                  display: "none", 
                  alignItems: "center", 
                  background: "transparent", 
                  color: "#ef4444", 
                  padding: "8px 16px", 
                  borderRadius: "8px", 
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  cursor: isLoggingOut ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  gap: "8px"
                }}
              >
                {isLoggingOut ? <Loader className="spinner" size={16} /> : null}
                {isLoggingOut ? "..." : "Log out"}
              </button>
            </div>
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
          .desktop-dashboard-btn { display: flex !important; }
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
            
            {!user ? (
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
            ) : (
              <>
                <li>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ color: "#ffffff", textDecoration: "none", fontSize: "1.1rem", fontWeight: "600", display: "block", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={async () => {
                      setIsLoggingOut(true);
                      await logout();
                      router.push("/");
                      router.refresh();
                      setTimeout(() => { window.location.href = "/"; }, 100);
                    }}
                    disabled={isLoggingOut}
                    style={{ color: "#ef4444", background: "none", border: "none", textAlign: "left", fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", cursor: isLoggingOut ? "not-allowed" : "pointer", width: "100%" }}
                  >
                    {isLoggingOut ? <Loader className="spinner" size={16} /> : null}
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
