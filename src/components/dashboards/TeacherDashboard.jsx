"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import SuggestionModal from "../SuggestionModal";
import { 
  Users, Landmark, Award, BookOpen, Plus, Trash2, CheckCircle2, AlertCircle, Loader, ShieldAlert
} from "lucide-react";
import { doc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  
  const [bio, setBio] = useState(profile?.bio || "");
  const [subject, setSubject] = useState(profile?.subject || "");
  const [resumeLink, setResumeLink] = useState(profile?.resumeLink || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Affiliation states
  const [instSearch, setInstSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [submittingAffiliation, setSubmittingAffiliation] = useState(false);

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Load institutions list on mount
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const snap = await getDocs(collection(db, "institutions"));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setAllInstitutions(list);
      } catch (e) {
        console.error("Error loading institutions:", e);
      }
    };
    loadInstitutions();
  }, []);

  // Filter search suggestions
  useEffect(() => {
    if (instSearch.trim().length > 1) {
      const filtered = allInstitutions.filter(inst => 
        inst.name.toLowerCase().includes(instSearch.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [instSearch, allInstitutions]);

  // Save profile information
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bio,
        subject,
        resumeLink
      });
      setStatusMessage("Profile updated successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update profile details.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit School Affiliation
  const handleAddAffiliation = async (e) => {
    e.preventDefault();
    if (!selectedInst || !subject) {
      alert("Please select your school and fill in your specialized subject.");
      return;
    }
    setSubmittingAffiliation(true);

    try {
      const userRef = doc(db, "users", user.uid);
      
      // 1. Update user profile to record pending institution request
      await updateDoc(userRef, {
        pendingInstitutionId: selectedInst.id,
        pendingInstitutionName: selectedInst.name,
        isVerifiedFaculty: false
      });

      // 2. Submit a pending request document to the 'claims' or 'faculty_requests' collection in Firestore
      // We will add this to a 'faculty_requests' collection which admin can approve!
      await addDoc(collection(db, "faculty_requests"), {
        userId: user.uid,
        userName: profile.name,
        userEmail: user.email,
        institutionId: selectedInst.id,
        institutionName: selectedInst.name,
        subject: subject,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      alert(`Affiliation Request Sent!\nYour request to join "${selectedInst.name}" has been logged and is awaiting admin approval.`);
      
      // Reset search form
      setInstSearch("");
      setSelectedInst(null);
      
      // Reload page/profile context state would happen automatically via Auth state listener, 
      // but let's notify the user to refresh or expect approval.
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setSubmittingAffiliation(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          
          {/* Welcome header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <Users size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800" }}>
                Welcome back, Prof. {profile?.name || "Teacher"}
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>Manage your subject specializations, link your institution, and showcase your teaching bio.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="dashboard-grid">
            
            {/* Column 1: School Affiliation */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Institution Affiliation Status */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Landmark size={20} style={{ color: "var(--primary)" }} />
                  Institution Affiliation Status
                </h3>

                {profile?.institutionId ? (
                  // Verified Affiliation
                  <div style={{ padding: "20px", background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <CheckCircle2 size={36} style={{ color: "var(--success)" }} />
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Verified Faculty Member</h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        You are successfully linked to **{profile.institutionName || "DAV School"}**. You appear on the school's public teacher list and can view students.
                      </p>
                    </div>
                  </div>
                ) : profile?.pendingInstitutionId ? (
                  // Pending Verification
                  <div style={{ padding: "20px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--warning)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                    <ShieldAlert size={36} style={{ color: "var(--warning)" }} />
                    <div>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Awaiting Admin Verification</h4>
                      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                        Request sent to link with **{profile.pendingInstitutionName}**. Platform or school administrators will verify your credentials shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  // No Affiliation Linked
                  <div style={{ padding: "20px", background: "var(--bg-tertiary)", border: "1px dashed var(--border-secondary)", borderRadius: "12px", textAlign: "center" }}>
                    <AlertCircle size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px auto" }} />
                    <h4 style={{ fontWeight: "700", fontSize: "1rem" }}>No Linked Institution</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "340px", margin: "6px auto 0 auto" }}>
                      Link your school, college, or coaching center to connect with your students and appear in the faculty directory.
                    </p>
                  </div>
                )}

                {/* Linking Form (only show if not linked to a school) */}
                {!profile?.institutionId && !profile?.pendingInstitutionId && (
                  <form onSubmit={handleAddAffiliation} style={{ marginTop: "24px", padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Affiliate with School/College</h4>

                    {/* Autocomplete Input */}
                    <div style={{ position: "relative" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Search Institution Directory *</label>
                      <input 
                        type="text" 
                        placeholder="Type school, college or coaching name..." 
                        className="form-input" 
                        value={selectedInst ? selectedInst.name : instSearch}
                        onChange={(e) => {
                          setInstSearch(e.target.value);
                          if (selectedInst) setSelectedInst(null);
                        }}
                        disabled={!!selectedInst}
                        required
                      />
                      {selectedInst && (
                        <button 
                          onClick={() => setSelectedInst(null)}
                          style={{ position: "absolute", right: "12px", top: "33px", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--danger)", fontWeight: "600" }}
                        >
                          Change
                        </button>
                      )}
                      {suggestions.length > 0 && (
                        <div style={{ position: "absolute", left: 0, right: 0, top: "68px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "8px", boxShadow: "var(--shadow-lg)", zIndex: 10, overflow: "hidden" }}>
                          {suggestions.map(s => (
                            <div 
                              key={s.id} 
                              onClick={() => {
                                setSelectedInst(s);
                                setSuggestions([]);
                              }}
                              style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                              className="suggestion-item"
                            >
                              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{s.name} ({s.logo})</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.location}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span 
                        onClick={() => setIsSuggestModalOpen(true)}
                        style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}
                      >
                        Can't find your listing?
                      </span>
                      <button type="submit" disabled={submittingAffiliation} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem", gap: "4px" }}>
                        {submittingAffiliation ? <Loader className="spinner" size={16} /> : <Plus size={16} />}
                        <span>Submit Affiliation</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Column 2: Profile settings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Profile details */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={20} style={{ color: "var(--accent)" }} />
                  Specialization & Credentials
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Configure your primary teaching subject and specialized topics to display on directory listings.
                </p>

                {statusMessage && (
                  <div style={{ padding: "12px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Teaching Specialization / Subject *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Physics CBSE, Mathematics JEE, English Literature" 
                      className="form-input"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Teaching Philosophy / Short Bio</label>
                    <textarea 
                      placeholder="Share your teaching style, experience, and achievements..." 
                      className="form-input"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ height: "120px", resize: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Resume Link (Google Drive / PDF Link)</label>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..." 
                      className="form-input"
                      value={resumeLink}
                      onChange={(e) => setResumeLink(e.target.value)}
                    />
                  </div>

                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ alignSelf: "flex-end", padding: "10px 24px", fontSize: "0.85rem" }}>
                    {savingProfile ? "Saving..." : "Save Configuration"}
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
      <SuggestionModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />

      <style jsx global>{`
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        .suggestion-item:hover {
          background: var(--bg-tertiary);
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1.2fr 1fr;
          }
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
