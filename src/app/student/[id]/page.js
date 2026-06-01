"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ShareButtons from "../../../components/ShareButtons";
import { 
  GraduationCap, Briefcase, MapPin, Globe, Mail, ArrowLeft, 
  ShieldCheck, Award, Star, RefreshCw, Sparkles, Code, Phone, MessageSquare, Lock, Link as LinkIcon, Target, Edit2, Check
} from "lucide-react";
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

export default function StudentPublicProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  
  // Frontend Edit States
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);

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
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <div style={{ textAlign: "center" }}>
            <RefreshCw className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3>Loading Profile Timeline...</h3>
          </div>
        </main>
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
      </>
    );
  }

  const handleRequestAccess = async () => {
    if (!user) {
      alert("You must be logged in to send a message.");
      router.push("/auth/login");
      return;
    }
    if (user.uid === id) {
      alert("You cannot request access from yourself.");
      return;
    }

    setCreatingChat(true);
    try {
      // 1. Check if chat already exists
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", user.uid));
      const snapshot = await getDocs(q);
      
      let existingChatId = null;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(id)) {
          existingChatId = doc.id;
        }
      });

      let chatId = existingChatId;

      // 2. If it doesn't exist, create it
      if (!chatId) {
        const newChat = await addDoc(chatsRef, {
          participants: [user.uid, id],
          participantsData: {
            [user.uid]: { name: user.displayName || profile?.name || "User", role: profile?.role || "User" },
            [id]: { name: student.name, role: student.role || "Student" }
          },
          lastMessage: "Hello, I would like to request access to your contact information and resume.",
          updatedAt: serverTimestamp()
        });
        chatId = newChat.id;

        // 3. Add the initial automated message
        await addDoc(collection(db, "chats", chatId, "messages"), {
          senderId: user.uid,
          text: "Hello, I would like to request access to your contact information and resume.",
          timestamp: serverTimestamp()
        });

        // 4. Send Notification to the receiver
        await addDoc(collection(db, "users", id, "notifications"), {
          type: "new_chat",
          message: `${user.displayName || profile?.name || "Someone"} requested access to your profile and sent a message.`,
          link: `/inbox?chat=${chatId}`,
          isRead: false,
          createdAt: serverTimestamp()
        });
      }

      // 4. Redirect to inbox
      router.push(`/inbox?chat=${chatId}`);
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Failed to start conversation. Please try again.");
      setCreatingChat(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user || user.uid !== id) return;
    setSavingBio(true);
    try {
      await updateDoc(doc(db, "users", id), { bio: editedBio });
      setStudent(prev => ({ ...prev, bio: editedBio }));
      setIsEditingBio(false);
    } catch (err) {
      console.error("Failed to update bio", err);
      alert("Failed to update bio");
    } finally {
      setSavingBio(false);
    }
  };

  return (
    <>
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

              {/* Career & Job Preferences */}
              {(student.targetJobRole || student.totalExperience || student.expectedSalary) && (
                <div className="glass-card" style={{ padding: "32px", border: "1px solid var(--accent)" }}>
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Target size={18} style={{ color: "var(--accent)" }} />
                    Career & Job Preferences
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {student.targetJobRole && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-muted)", width: "110px", flexShrink: 0 }}>Target Role:</span>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{student.targetJobRole}</span>
                      </div>
                    )}
                    {student.totalExperience && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-muted)", width: "110px", flexShrink: 0 }}>Experience:</span>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{student.totalExperience}</span>
                      </div>
                    )}
                    {student.expectedSalary && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem" }}>
                        <span style={{ color: "var(--text-muted)", width: "110px", flexShrink: 0 }}>Expected Salary:</span>
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{student.expectedSalary}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
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
                  onClick={handleRequestAccess} 
                  disabled={creatingChat}
                  className="btn-primary" 
                  style={{ width: "100%", justifyContent: "center", gap: "8px", padding: "12px", opacity: creatingChat ? 0.7 : 1 }}
                >
                  {creatingChat ? <RefreshCw size={18} className="spinner" /> : <MessageSquare size={18} />}
                  {creatingChat ? "Opening Chat..." : "Message to Request Access"}
                </button>
              </div>

              {/* About & Bio */}
              <div className="glass-card" style={{ padding: "32px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                    <Sparkles size={18} style={{ color: "var(--accent)" }} />
                    About Candidates
                  </h3>
                  {user && user.uid === id && !isEditingBio && (
                    <button 
                      onClick={() => { setEditedBio(student.bio || ""); setIsEditingBio(true); }}
                      style={{ background: "transparent", border: "1px solid var(--border-primary)", borderRadius: "8px", padding: "6px 12px", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem" }}
                      onMouseOver={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>
                
                {isEditingBio ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <textarea 
                      value={editedBio}
                      onChange={e => setEditedBio(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", color: "var(--text-primary)", resize: "vertical", minHeight: "100px", fontFamily: "inherit" }}
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => setIsEditingBio(false)} style={{ padding: "8px 16px", borderRadius: "8px", background: "transparent", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", cursor: "pointer" }}>Cancel</button>
                      <button onClick={handleSaveBio} disabled={savingBio} className="btn-primary" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}>
                        {savingBio ? <RefreshCw size={14} className="spinner" /> : <Check size={14} />} {savingBio ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                    {student.bio || "No description provided."}
                  </p>
                )}
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
