"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import SuggestionModal from "../SuggestionModal";
import { 
  Users, Landmark, Award, Plus, X, CheckCircle2, AlertCircle, Loader, 
  ShieldAlert, ArrowRight, ArrowLeft
} from "lucide-react";
import { doc, updateDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

export default function TeacherDashboard() {
  const { user, profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Step 1: Specialization
  const [bio, setBio] = useState(profile?.bio || "");
  const [subject, setSubject] = useState(profile?.subject || "");
  const [resumeLink, setResumeLink] = useState(profile?.resumeLink || "");

  // Step 2: Affiliation Search
  const [instSearch, setInstSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [submittingAffiliation, setSubmittingAffiliation] = useState(false);

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

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

  // --- Handlers ---
  const handleSaveStep = async (step, e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      if (step === 1) {
        await updateDoc(userRef, { bio, subject, resumeLink });
      }
      
      setCurrentStep(step + 1);
      window.scrollTo(0,0);
    } catch (error) {
      console.error(error);
      alert("Failed to save progress.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSkip = (e) => {
    e.preventDefault();
    setCurrentStep(currentStep + 1);
    window.scrollTo(0,0);
  };

  const handleAddAffiliation = async (e) => {
    e.preventDefault();
    if (!selectedInst || !subject) {
      alert("Please select your school and ensure your specialized subject is filled.");
      return;
    }
    setSubmittingAffiliation(true);

    try {
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        pendingInstitutionId: selectedInst.id,
        pendingInstitutionName: selectedInst.name,
        isVerifiedFaculty: false
      });

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

      alert(`Affiliation Request Sent! Awaiting admin approval from "${selectedInst.name}".`);
      setInstSearch(""); setSelectedInst(null);
      setCurrentStep(3);
      window.scrollTo(0,0);
    } catch (err) {
      alert("Failed to submit request.");
    } finally {
      setSubmittingAffiliation(false);
    }
  };

  const renderProgressBar = () => {
    const steps = ["Specialization", "Affiliation", "Dashboard"];
    return (
      <div style={{ marginBottom: "40px", padding: "20px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "var(--border-secondary)", zIndex: 1, transform: "translateY(-50%)" }}>
             <div style={{ width: `${((currentStep - 1) / 2) * 100}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }}></div>
          </div>
          {steps.map((label, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isPast = currentStep > stepNum;
            return (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", position: "relative", zIndex: 2 }}>
                <div 
                  style={{ 
                    width: "36px", height: "36px", borderRadius: "50%", 
                    background: isActive || isPast ? "var(--primary)" : "var(--bg-tertiary)",
                    border: `2px solid ${isActive || isPast ? "var(--primary-glow)" : "var(--border-primary)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: "700", fontSize: "0.9rem",
                    boxShadow: isActive ? "0 0 15px var(--primary-glow)" : "none",
                    transition: "all 0.3s ease",
                    cursor: isPast ? "pointer" : "default"
                  }}
                  onClick={() => isPast && setCurrentStep(stepNum)}
                >
                  {isPast ? <CheckCircle2 size={18} /> : stepNum}
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          
          {currentStep < 3 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "2.2rem", color: "var(--text-primary)", fontWeight: "800", marginBottom: "8px" }}>
                  Welcome, Prof. {profile?.name || "Teacher"}
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Set up your teaching credentials and school affiliation.</p>
              </div>

              <div style={{ padding: "16px", background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "12px", fontSize: "0.95rem", marginBottom: "32px", display: "flex", alignItems: "flex-start", gap: "12px", animation: "fadeIn 0.5s ease" }}>
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Action Required:</strong> Please complete your profile to be visible to students in the public directory!
                </div>
              </div>

              {renderProgressBar()}
            </>
          )}

          {/* STEP 1: Specialization */}
          {currentStep === 1 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Teaching Specialization</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Configure your primary teaching subject and specialized topics to display on directory listings.</p>
              
              <form onSubmit={(e) => handleSaveStep(1, e)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="form-label">Teaching Specialization / Subject *</label>
                  <input type="text" placeholder="e.g. Physics CBSE, Mathematics JEE" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>

                <div>
                  <label className="form-label">Teaching Philosophy / Short Bio</label>
                  <textarea placeholder="Share your teaching style and experience..." className="form-input" value={bio} onChange={(e) => setBio(e.target.value)} style={{ height: "120px", resize: "none" }} />
                </div>

                <div>
                  <label className="form-label">Resume Link (Google Drive / PDF Link)</label>
                  <input type="url" placeholder="https://drive.google.com/..." className="form-input" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "16px" }}>
                  <button type="button" onClick={handleSkip} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: "600" }}>Skip for now</button>
                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "12px 32px" }}>Save & Continue <ArrowRight size={18} /></button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Affiliation Search */}
          {currentStep === 2 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Link Your Institution</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Affiliate with your school, college, or coaching center to appear in their verified faculty directory.</p>
              
              {profile?.institutionId ? (
                <div style={{ padding: "20px", background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center", marginBottom: "24px" }}>
                  <CheckCircle2 size={36} style={{ color: "var(--success)" }} />
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Already Verified</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>You are linked to {profile.institutionName}.</p>
                  </div>
                </div>
              ) : profile?.pendingInstitutionId ? (
                <div style={{ padding: "20px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--warning)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center", marginBottom: "24px" }}>
                  <ShieldAlert size={36} style={{ color: "var(--warning)" }} />
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Request Pending</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Awaiting approval from {profile.pendingInstitutionName}.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddAffiliation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ position: "relative" }}>
                    <label className="form-label">Search Institution Directory *</label>
                    <input 
                      type="text" placeholder="Type school or college name..." className="form-input" 
                      value={selectedInst ? selectedInst.name : instSearch}
                      onChange={(e) => { setInstSearch(e.target.value); if (selectedInst) setSelectedInst(null); }}
                      disabled={!!selectedInst} required
                    />
                    {selectedInst && <button onClick={() => setSelectedInst(null)} style={{ position: "absolute", right: "12px", top: "33px", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "var(--danger)", fontWeight: "600" }}>Change</button>}
                    {suggestions.length > 0 && (
                      <div style={{ position: "absolute", left: 0, right: 0, top: "68px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: "8px", boxShadow: "var(--shadow-lg)", zIndex: 10, overflow: "hidden" }}>
                        {suggestions.map(s => (
                          <div key={s.id} onClick={() => { setSelectedInst(s); setSuggestions([]); }} style={{ padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="suggestion-item">
                            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{s.name} ({s.logo})</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.location}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span onClick={() => setIsSuggestModalOpen(true)} style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600", alignSelf: "flex-start" }}>Can't find your listing?</span>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                    <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary"><ArrowLeft size={18} /> Back</button>
                    <button type="submit" disabled={submittingAffiliation} className="btn-primary" style={{ padding: "12px 32px" }}>
                      {submittingAffiliation ? "Submitting..." : "Send Request & Finish"} <ArrowRight size={18} />
                    </button>
                  </div>
                </form>
              )}

              {/* If they are already linked or pending, they can just skip this step */}
              {(profile?.institutionId || profile?.pendingInstitutionId) && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary"><ArrowLeft size={18} /> Back</button>
                  <button type="button" onClick={() => setCurrentStep(3)} className="btn-primary" style={{ padding: "12px 32px" }}>Go to Dashboard <ArrowRight size={18} /></button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Dashboard Main View */}
          {currentStep === 3 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Users size={28} />
                </div>
                <div>
                  <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800" }}>
                    Dashboard Overview
                  </h1>
                  <p style={{ color: "var(--text-secondary)" }}>Manage your profile and school affiliation.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                
                <div className="glass-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Landmark size={20} style={{ color: "var(--primary)" }} /> Affiliation Status</h3>
                  
                  {profile?.institutionId ? (
                    <div style={{ padding: "20px", background: "var(--success-light)", border: "1px solid var(--success)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                      <CheckCircle2 size={36} style={{ color: "var(--success)" }} />
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Verified Faculty Member</h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>You are verified at **{profile.institutionName}**.</p>
                      </div>
                    </div>
                  ) : profile?.pendingInstitutionId ? (
                    <div style={{ padding: "20px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--warning)", borderRadius: "12px", display: "flex", gap: "16px", alignItems: "center" }}>
                      <ShieldAlert size={36} style={{ color: "var(--warning)" }} />
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Awaiting Admin Verification</h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>Request sent to **{profile.pendingInstitutionName}**. Platform or school administrators will verify your credentials shortly.</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "20px", background: "var(--bg-tertiary)", border: "1px dashed var(--border-secondary)", borderRadius: "12px", textAlign: "center" }}>
                      <AlertCircle size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px auto" }} />
                      <h4 style={{ fontWeight: "700", fontSize: "1rem" }}>No Linked Institution</h4>
                      <button onClick={() => setCurrentStep(2)} className="btn-primary" style={{ marginTop: "12px", padding: "8px 16px" }}>Link an Institution</button>
                    </div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}><Award size={20} style={{ color: "var(--accent)" }} /> Profile Config</h3>
                    <button onClick={() => setCurrentStep(1)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>Edit Profile</button>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>Subject</span>
                      <span style={{ fontWeight: "700" }}>{profile?.subject || "Not Set"}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem" }}>Bio</span>
                      <span style={{ fontSize: "0.9rem" }}>{profile?.bio || "No bio provided."}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
      <SuggestionModal isOpen={isSuggestModalOpen} onClose={() => setIsSuggestModalOpen(false)} />

      <style jsx global>{`
        .form-label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; }
        .suggestion-item:hover { background: var(--bg-tertiary); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
