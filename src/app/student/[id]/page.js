"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ShareButtons from "../../../components/ShareButtons";
import { 
  GraduationCap, Briefcase, MapPin, Globe, Mail, ArrowLeft, 
  ShieldCheck, Award, Star, RefreshCw, Sparkles, Code, Phone, MessageSquare, Lock, Link as LinkIcon
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Link from "next/link";

export default function StudentPublicProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().role === "student") {
          setStudent(docSnap.data());
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
            <h3>Loading Profile Timeline...</h3>
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

  if (!student) {
    return (
      <>
        <Header />
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", textAlign: "center" }}>
            <GraduationCap size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Profile Not Found</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              The student profile timeline you are looking for does not exist, is set to private, or has not been configured.
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
          <div className="glass-card" style={{ padding: "40px", marginBottom: "32px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
              
              {/* Initials badge */}
              <div style={{
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                fontSize: "2.25rem",
                boxShadow: "var(--shadow-lg)"
              }}>
                {student.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  <h1 style={{ fontSize: "2.25rem", color: "var(--text-primary)" }}>{student.name}</h1>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
                    Student profile
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {student.privacySettings?.showEmail ? (
                      <><Mail size={16} /> {student.email}</>
                    ) : (
                      <><Lock size={14} /> Email Hidden</>
                    )}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {student.privacySettings?.showAddress && (student.location || student.presentAddress) ? (
                      <><MapPin size={16} /> {student.presentAddress || student.location}</>
                    ) : (
                      <><Lock size={14} /> Location Hidden</>
                    )}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="profile-grid">
            
            {/* Left Column: Timelines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Academic timeline */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <GraduationCap size={22} style={{ color: "var(--primary)" }} />
                  Academic History Timeline
                </h3>

                {student.education && student.education.length > 0 ? (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "10px 0 10px 10px", display: "flex", flexDirection: "column", gap: "28px" }}>
                    {student.education.map((edu, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          left: "-33px",
                          top: "4px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: edu.isCurrent ? "var(--primary)" : "var(--bg-secondary)",
                          border: `3px solid ${edu.isCurrent ? "var(--primary-glow)" : "var(--border-secondary)"}`
                        }}></div>
                        
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{edu.startYear} - {edu.endYear}</span>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                            {/* Critical spec: school name hyperlinks back to details page! */}
                            <Link href={`/institutions/${edu.id}`} style={{ textDecoration: "underline", color: "var(--primary)" }}>
                              {edu.name}
                            </Link>
                            <span style={{ fontSize: "1.1rem" }}>{edu.logo}</span>
                          </h4>
                          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "2px" }}>{edu.degree}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No educational history added to this timeline yet.</div>
                )}
              </div>

              {/* Work history timeline */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={22} style={{ color: "var(--success)" }} />
                  Employment History Timeline
                </h3>

                {student.employment && student.employment.length > 0 ? (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "10px 0 10px 10px", display: "flex", flexDirection: "column", gap: "28px" }}>
                    {student.employment.map((work, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          left: "-33px",
                          top: "4px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: work.isCurrent ? "var(--success)" : "var(--bg-secondary)",
                          border: `3px solid ${work.isCurrent ? "var(--success-light)" : "var(--border-secondary)"}`
                        }}></div>
                        
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "700" }}>{work.startYear} - {work.endYear}</span>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginTop: "4px", color: "var(--text-primary)" }}>{work.role}</h4>
                          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "2px" }}>{work.company} • {work.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>No professional experience listed yet.</div>
                )}
              </div>

            </div>

            {/* Right Column: Bio, skills & sharing */}
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
                    {student.privacySettings?.showPhone && student.phone ? (
                      <span style={{ fontWeight: "600" }}>{student.phone}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontStyle: "italic" }}><Lock size={14}/> Hidden</span>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)", width: "80px" }}>WhatsApp:</span>
                    {student.privacySettings?.showWhatsApp && student.whatsapp ? (
                      <span style={{ fontWeight: "600" }}>{student.whatsapp}</span>
                    ) : (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontStyle: "italic" }}><Lock size={14}/> Hidden</span>
                    )}
                  </div>

                  {/* Resume */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-muted)", width: "80px" }}>Resume/CV:</span>
                    {student.privacySettings?.showResume && student.resumeLink ? (
                      <a href={student.resumeLink} target="_blank" rel="noopener noreferrer" style={{ fontWeight: "600", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>
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

              {/* About & Bio */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={18} style={{ color: "var(--accent)" }} />
                  About Candidates
                </h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem" }}>
                  {student.bio || "No description provided. Connect directly with the student to request details or view active course milestones."}
                </p>
              </div>

              {/* Skills badges */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Code size={18} style={{ color: "var(--primary)" }} />
                  Technical Skillset
                </h3>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {student.skills && student.skills.length > 0 ? (
                    student.skills.map((sk, idx) => (
                      <span key={idx} style={{ fontSize: "0.8rem", padding: "6px 12px", background: "var(--primary-light)", color: "var(--primary)", border: "1px solid", borderRadius: "100px", fontWeight: "700" }}>
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No specific skills configured yet.</span>
                  )}
                </div>
              </div>

              {/* Viral share loops */}
              <ShareButtons institutionId={null} institutionName={`Resume Profile of ${student.name}`} />

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
            grid-template-columns: 1.6fr 1.1fr;
          }
        }
      `}</style>
    </>
  );
}
