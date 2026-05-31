"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ShareButtons from "../../../components/ShareButtons";
import { 
  Users, Award, MapPin, Globe, Mail, ArrowLeft, 
  ShieldCheck, Star, RefreshCw, BookOpen, Link as LinkIcon, Lock, Phone, MessageSquare
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

export default function TeacherPublicProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "teacher") {
          setTeacher(docSnap.data());
        }
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <div style={{ textAlign: "center" }}>
            <RefreshCw className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3>Loading Faculty Profile...</h3>
          </div>
        </main>
        <Footer />
        <style jsx global>{`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (!teacher) {
    return (
      <>
        <Header />
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", textAlign: "center" }}>
            <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Profile Not Found</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              The teacher profile you are looking for does not exist or has not been configured.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary" style={{ width: "100%", gap: "8px" }}>
              <ArrowLeft size={16} /> Return to Homepage
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main style={{ padding: "60px 0" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          
          {/* Back Action */}
          <button 
            onClick={() => router.back()} 
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", marginBottom: "32px", fontWeight: "600" }}
            onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Profile Header Block */}
          <div className="glass-card" style={{ padding: "40px", marginBottom: "32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, padding: "20px" }}>
               {teacher.isVerifiedFaculty ? (
                 <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--success-light)", color: "var(--success)", padding: "6px 14px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: "700" }}>
                   <ShieldCheck size={18} /> Verified Faculty
                 </div>
               ) : (
                 <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-secondary)", color: "var(--text-muted)", padding: "6px 14px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: "600" }}>
                   Unverified
                 </div>
               )}
            </div>

            <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", zIndex: 2, position: "relative" }}>
              
              {/* Initials badge */}
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "2.5rem",
                boxShadow: "var(--shadow-lg)"
              }}>
                {teacher.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 style={{ fontSize: "2.5rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                  Prof. {teacher.name}
                </h1>
                
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--primary)" }}>
                    {teacher.subject || "General Educator"}
                  </span>
                  
                  {teacher.institutionId && (
                    <>
                      <span style={{ color: "var(--border-primary)" }}>|</span>
                      <Link href={`/institutions/${teacher.institutionId}`} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: "600", textDecoration: "underline" }}>
                        {teacher.institutionName}
                      </Link>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {teacher.privacySettings?.showEmail ? (
                      <><Mail size={16} /> {teacher.email}</>
                    ) : (
                      <><Lock size={14} /> Email Hidden</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="profile-grid">
            
            {/* Left Column: Bio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={22} style={{ color: "var(--accent)" }} />
                  Teaching Philosophy & Bio
                </h3>
                
                {teacher.bio ? (
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "1.05rem" }}>
                    {teacher.bio}
                  </p>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", fontStyle: "italic" }}>No teaching biography provided yet.</div>
                )}
              </div>
              
            </div>

            {/* Right Column: Sharing */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Contact Information & Privacy Request */}
              <div className="glass-card" style={{ padding: "32px", border: "1px solid var(--primary-light)" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={18} style={{ color: "var(--primary)" }} />
                  Contact Information
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                  {/* Phone */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)", width: "80px" }}>Phone:</span>
                    {teacher.privacySettings?.showPhone && teacher.phone ? (
                      <span style={{ fontWeight: "600" }}>{teacher.phone}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontStyle: "italic" }}><Lock size={14}/> Hidden</span>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)", width: "80px" }}>WhatsApp:</span>
                    {teacher.privacySettings?.showWhatsApp && teacher.whatsapp ? (
                      <span style={{ fontWeight: "600" }}>{teacher.whatsapp}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontStyle: "italic" }}><Lock size={14}/> Hidden</span>
                    )}
                  </div>

                  {/* Resume */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)", width: "80px" }}>Resume/CV:</span>
                    {teacher.privacySettings?.showResume && teacher.resumeLink ? (
                      <a href={teacher.resumeLink} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "600", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <LinkIcon size={14} /> View Document
                      </a>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontStyle: "italic" }}><Lock size={14}/> Hidden</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => alert("Chat functionality coming in Phase 2! A message will be sent to request access.")} 
                  className="btn-primary" 
                  style={{ width: "100%", justifyContent: "center", gap: "8px", padding: "12px" }}
                >
                  <MessageSquare size={18} />
                  Message to Request Access
                </button>
              </div>

              {/* Viral share loops */}
              <ShareButtons institutionId={null} institutionName={`Faculty Profile of ${teacher.name}`} />
            </div>

          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .profile-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .profile-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
      `}</style>
    </>
  );
}
