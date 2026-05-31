"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import SuggestionModal from "../SuggestionModal";
import { 
  GraduationCap, Briefcase, Plus, Trash2, Calendar, MapPin, 
  ExternalLink, User, Settings, CheckCircle2, ClipboardList, BookOpen, AlertCircle, ArrowRight, ArrowLeft
} from "lucide-react";
import { doc, updateDoc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, profile, saveUserProfile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  
  // --- Step 1: Basic Info ---
  const [name, setName] = useState(profile?.name || "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [presentAddress, setPresentAddress] = useState(profile?.presentAddress || "");
  const [permanentAddress, setPermanentAddress] = useState(profile?.permanentAddress || "");
  
  // --- Step 2: Priorities & Interests ---
  const [priorities, setPriorities] = useState(profile?.priorities || []);
  const [hobbies, setHobbies] = useState(profile?.hobbies?.join(", ") || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills?.join(", ") || "");
  const [resumeLink, setResumeLink] = useState(profile?.resumeLink || "");

  const priorityOptions = [
    "Find a job",
    "Search education institutes",
    "Search courses",
    "Meet old friends"
  ];
  
  // --- Step 3: Timelines ---
  const [instSearch, setInstSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [degree, setDegree] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrentStudy, setIsCurrentStudy] = useState(false);
  
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [startJob, setStartJob] = useState("");
  const [endJob, setEndJob] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState(profile?.privacySettings || {
    showPhone: false,
    showWhatsApp: false,
    showAddress: false,
    showEmail: false,
    showResume: false
  });
  
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [localTimeline, setLocalTimeline] = useState(profile?.education || []);
  const [localWork, setLocalWork] = useState(profile?.employment || []);
  
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDocs(collection(db, "institutions"));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setAllInstitutions(list);

        if (user) {
          const q = query(collection(db, "applications"), where("studentId", "==", user.uid));
          const appSnap = await getDocs(q);
          const appList = [];
          appSnap.forEach(d => appList.push({ id: d.id, ...d.data() }));
          setApplications(appList);
        }
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      }
    };
    loadData();
  }, [user]);

  // Handle autocomplete search
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
  
  const togglePriority = (p) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter(item => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleSaveStep = async (step, e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      let updateData = {};
      
      if (step === 1) {
        updateData = { name, whatsapp, phone, presentAddress, permanentAddress, privacySettings };
      } else if (step === 2) {
        const hobbiesArray = hobbies.split(",").map(s => s.trim()).filter(s => s.length > 0);
        const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
        updateData = { priorities, hobbies: hobbiesArray, skills: skillsArray, bio, resumeLink, privacySettings };
      }
      
      await updateDoc(userRef, updateData);
      
      if (step < 4) {
        setCurrentStep(step + 1);
        window.scrollTo(0,0);
      } else {
        setStatusMessage("Profile fully updated!");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save progress.");
    } finally {
      setSavingProfile(false);
    }
  };

  const skipStep = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0,0);
    }
  };

  const handleAddAcademic = async (e) => {
    e.preventDefault();
    if (!selectedInst || !degree || !startYear) {
      alert("Please select an institution, degree, and start year.");
      return;
    }

    const newItem = {
      id: selectedInst.id,
      name: selectedInst.name,
      logo: selectedInst.logo || "🏫",
      degree,
      startYear,
      endYear: isCurrentStudy ? "Present" : endYear || "N/A",
      isCurrent: isCurrentStudy,
      isVerified: false
    };

    const updatedTimeline = [...localTimeline, newItem];
    setLocalTimeline(updatedTimeline);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        education: updatedTimeline,
        ...(isCurrentStudy ? { institutionId: selectedInst.id, institutionName: selectedInst.name } : {})
      });

      await addDoc(collection(db, "enrollment_requests"), {
        studentId: user.uid,
        studentName: profile?.name || "Student",
        studentEmail: user.email,
        institutionId: selectedInst.id,
        institutionName: selectedInst.name,
        degree,
        startYear,
        endYear: isCurrentStudy ? "Present" : endYear || "N/A",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      
      setInstSearch(""); setSelectedInst(null); setDegree(""); setStartYear(""); setEndYear(""); setIsCurrentStudy(false);
    } catch (err) { console.error(err); alert("Failed to update education timeline."); }
  };

  const handleAddWork = async (e) => {
    e.preventDefault();
    if (!company || !role || !startJob) {
      alert("Please fill in company, role, and start date."); return;
    }

    const newItem = {
      company, role, location: jobLocation || "N/A", startYear: startJob,
      endYear: isCurrentJob ? "Present" : endJob || "N/A", isCurrent: isCurrentJob, isVerified: false
    };

    const updatedWork = [...localWork, newItem];
    setLocalWork(updatedWork);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { employment: updatedWork });
      setCompany(""); setRole(""); setJobLocation(""); setStartJob(""); setEndJob(""); setIsCurrentJob(false);
    } catch (err) { console.error(err); alert("Failed to update work timeline."); }
  };

  const handleRemoveAcademic = async (index) => {
    const updated = localTimeline.filter((_, i) => i !== index);
    setLocalTimeline(updated);
    try { await updateDoc(doc(db, "users", user.uid), { education: updated }); } catch (err) { console.error(err); }
  };

  const handleRemoveWork = async (index) => {
    const updated = localWork.filter((_, i) => i !== index);
    setLocalWork(updated);
    try { await updateDoc(doc(db, "users", user.uid), { employment: updated }); } catch (err) { console.error(err); }
  };

  // --- Renders ---
  
  const renderProgressBar = () => {
    const steps = ["Basic Info", "Goals", "Timelines", "Dashboard"];
    return (
      <div style={{ marginBottom: "40px", padding: "20px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          {/* Progress Line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "var(--border-secondary)", zIndex: 1, transform: "translateY(-50%)" }}>
             <div style={{ width: `${((currentStep - 1) / 3) * 100}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }}></div>
          </div>
          
          {/* Steps */}
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
          
          {/* Welcome Title */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "2.2rem", color: "var(--text-primary)", fontWeight: "800", marginBottom: "8px" }}>
              Welcome, {profile?.name || "Student"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>Complete your profile to get the most out of EduConnect.</p>
          </div>

          <div style={{ padding: "16px", background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: "12px", fontSize: "0.95rem", marginBottom: "32px", display: "flex", alignItems: "flex-start", gap: "12px", animation: "fadeIn 0.5s ease" }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Action Required:</strong> Please fill out your profile details below to get the full EduConnect experience. If you don't have time right now, you can skip steps and come back later using the menu!
            </div>
          </div>

          {renderProgressBar()}

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Basic Information</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Let's start with your contact details so peers and employers can reach you.</p>
              
              <form onSubmit={(e) => handleSaveStep(1, e)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label className="form-label">WhatsApp Number</label>
                    <input type="tel" className="form-input" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Present Address</label>
                  <textarea className="form-input" rows="2" value={presentAddress} onChange={e => setPresentAddress(e.target.value)} style={{ resize: "none" }}></textarea>
                </div>

                <div>
                  <label className="form-label">Permanent Address</label>
                  <textarea className="form-input" rows="2" value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} style={{ resize: "none" }}></textarea>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "16px" }}>
                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "12px 32px" }}>
                    {savingProfile ? "Saving..." : "Save & Continue"} <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Goals & Interests */}
          {currentStep === 2 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Goals & Interests</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Tell us what you are looking for so we can personalize your experience.</p>
              
              <form onSubmit={(e) => handleSaveStep(2, e)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Priorities */}
                <div>
                  <label className="form-label" style={{ marginBottom: "12px" }}>What is your priority right now? (Select multiple)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {priorityOptions.map(p => (
                      <div 
                        key={p} 
                        onClick={() => togglePriority(p)}
                        style={{ 
                          padding: "16px", borderRadius: "12px", cursor: "pointer",
                          border: `1px solid ${priorities.includes(p) ? "var(--primary)" : "var(--border-primary)"}`,
                          background: priorities.includes(p) ? "var(--primary-light)" : "var(--bg-tertiary)",
                          display: "flex", alignItems: "center", gap: "12px",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: "2px solid", borderColor: priorities.includes(p) ? "var(--primary)" : "#64748b", background: priorities.includes(p) ? "var(--primary)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                          {priorities.includes(p) && <CheckCircle2 size={14} />}
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "0.95rem", color: priorities.includes(p) ? "var(--primary)" : "var(--text-secondary)" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label">Personal Interests & Hobbies (Comma separated)</label>
                  <input type="text" className="form-input" placeholder="e.g. Reading, Coding, Cricket, Travel" value={hobbies} onChange={e => setHobbies(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Technical / Professional Skills (Comma separated)</label>
                  <input type="text" className="form-input" placeholder="e.g. React, JavaScript, Management" value={skills} onChange={e => setSkills(e.target.value)} />
                </div>

                <div>
                  <label className="form-label">Brief Professional Bio</label>
                  <textarea className="form-input" rows="3" placeholder="Introduce yourself..." value={bio} onChange={e => setBio(e.target.value)} style={{ resize: "none" }}></textarea>
                </div>

                <div>
                  <label className="form-label">Resume Link (Google Drive / PDF)</label>
                  <input type="url" className="form-input" placeholder="https://..." value={resumeLink} onChange={e => setResumeLink(e.target.value)} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary" style={{ padding: "12px 24px" }}><ArrowLeft size={18} /> Back</button>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button type="button" onClick={skipStep} style={{ background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", fontWeight: "600", padding: "12px" }}>Skip for now</button>
                    <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "12px 32px" }}>
                      {savingProfile ? "Saving..." : "Save & Continue"} <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Timelines */}
          {currentStep === 3 && (
            <div style={{ animation: "fadeIn 0.4s ease", display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className="glass-card" style={{ padding: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Academic History</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Add schools and colleges to build your alumni network.</p>
                  </div>
                </div>

                {/* Vertical Timeline Display */}
                {localTimeline.length > 0 && (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "0 0 32px 10px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {localTimeline.map((item, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: "-33px", top: "4px", width: "16px", height: "16px", borderRadius: "50%", background: item.isCurrent ? "var(--primary)" : "var(--bg-secondary)", border: `3px solid ${item.isCurrent ? "var(--primary-glow)" : "var(--border-secondary)"}` }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", background: "var(--bg-tertiary)", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{item.startYear} - {item.endYear}</span>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                              <Link href={`/institutions/${item.id}`} style={{ textDecoration: "underline", color: "var(--text-primary)" }}>{item.name}</Link>
                              <span style={{ fontSize: "1rem" }}>{item.logo}</span>
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{item.degree}</p>
                          </div>
                          <button onClick={() => handleRemoveAcademic(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "4px" }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone form */}
                <form onSubmit={handleAddAcademic} style={{ padding: "24px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Add Academic Milestone</h4>
                  
                  {/* Autocomplete Input */}
                  <div style={{ position: "relative" }}>
                    <label className="form-label">Search Institution *</label>
                    <input type="text" placeholder="Type to search school, college..." className="form-input" value={selectedInst ? selectedInst.name : instSearch} onChange={(e) => { setInstSearch(e.target.value); if (selectedInst) setSelectedInst(null); }} disabled={!!selectedInst} required />
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

                  <div>
                    <label className="form-label">Degree / Course / Class *</label>
                    <input type="text" placeholder="e.g. B.Tech CSE" className="form-input" value={degree} onChange={(e) => setDegree(e.target.value)} required />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="form-label">Start Year *</label>
                      <input type="number" placeholder="2024" className="form-input" value={startYear} onChange={(e) => setStartYear(e.target.value)} required />
                    </div>
                    <div>
                      <label className="form-label">End Year</label>
                      <input type="number" placeholder="2026" className="form-input" value={endYear} onChange={(e) => setEndYear(e.target.value)} disabled={isCurrentStudy} />
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <input type="checkbox" checked={isCurrentStudy} onChange={(e) => setIsCurrentStudy(e.target.checked)} />
                    <span>I am currently studying here</span>
                  </label>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                    <span onClick={() => setIsSuggestModalOpen(true)} style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}>Can't find your school?</span>
                    <button type="submit" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem", gap: "4px" }}><Plus size={16} /> Add Milestone</button>
                  </div>
                </form>
              </div>

              {/* Work history timeline builder */}
              <div className="glass-card" style={{ padding: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Employment History</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Add internships and jobs to build your resume.</p>
                  </div>
                </div>

                {localWork.length > 0 && (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "0 0 32px 10px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {localWork.map((item, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: "-33px", top: "4px", width: "16px", height: "16px", borderRadius: "50%", background: item.isCurrent ? "var(--success)" : "var(--bg-secondary)", border: `3px solid ${item.isCurrent ? "var(--success-light)" : "var(--border-secondary)"}` }}></div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", background: "var(--bg-tertiary)", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "700" }}>{item.startYear} - {item.endYear}</span>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginTop: "4px" }}>{item.role}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{item.company} • {item.location}</p>
                          </div>
                          <button onClick={() => handleRemoveWork(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "4px" }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddWork} style={{ padding: "24px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Add Work Experience</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div><label className="form-label">Company / Employer *</label><input type="text" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} required /></div>
                    <div><label className="form-label">Role / Designation *</label><input type="text" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} required /></div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div><label className="form-label">Start Date *</label><input type="text" placeholder="Jan 2025" className="form-input" value={startJob} onChange={(e) => setStartJob(e.target.value)} required /></div>
                    <div><label className="form-label">End Date</label><input type="text" placeholder="May 2025" className="form-input" value={endJob} onChange={(e) => setEndJob(e.target.value)} disabled={isCurrentJob} /></div>
                  </div>

                  <div>
                    <label className="form-label">Job Location</label>
                    <input type="text" placeholder="Remote, City" className="form-input" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <input type="checkbox" checked={isCurrentJob} onChange={(e) => setIsCurrentJob(e.target.checked)} />
                    <span>I currently work here</span>
                  </label>

                  <button type="submit" className="btn-primary" style={{ alignSelf: "flex-end", padding: "10px 20px", fontSize: "0.85rem", gap: "4px", background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.25)" }}>
                    <Plus size={16} /> Add Experience
                  </button>
                </form>
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary" style={{ padding: "12px 24px" }}><ArrowLeft size={18} /> Back</button>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button type="button" onClick={skipStep} style={{ background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", fontWeight: "600", padding: "12px" }}>Skip for now</button>
                  <button type="button" onClick={() => setCurrentStep(4)} className="btn-primary" style={{ padding: "12px 32px" }}>
                    Finish & View Dashboard <ArrowRight size={18} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 4: Dashboard Main View (Applied Placements) */}
          {currentStep === 4 && (
            <div style={{ animation: "fadeIn 0.4s ease", display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className="glass-card" style={{ padding: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Dashboard Overview</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Track your applications and public profile.</p>
                  </div>
                  <Link href={`/student/${user.uid}`} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem", gap: "6px" }} target="_blank">
                    <span>View Public Profile</span>
                    <ExternalLink size={16} />
                  </Link>
                </div>

                {statusMessage && (
                  <div style={{ padding: "16px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "8px", fontSize: "0.9rem", marginBottom: "24px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckCircle2 size={18} /> {statusMessage}
                  </div>
                )}

                <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClipboardList size={20} style={{ color: "var(--primary)" }} />
                  Applied Placements
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app.id} style={{ padding: "16px 20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{app.jobTitle}</h4>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{app.employerName}</span>
                        </div>
                        <span style={{
                          fontSize: "0.8rem", fontWeight: "700", padding: "6px 12px", borderRadius: "100px", textTransform: "uppercase", border: "1px solid",
                          background: app.status === "hired" ? "var(--success-light)" : app.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: app.status === "hired" ? "var(--success)" : app.status === "rejected" ? "var(--danger)" : "var(--warning)"
                        }}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>No applications found. Use the search to find and apply for jobs!</div>
                  )}
                </div>
              </div>

              {/* Privacy Settings Card */}
              <div className="glass-card" style={{ padding: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Shield size={20} style={{ color: "var(--warning)" }} />
                      Privacy Settings
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Control what information is visible on your public profile.</p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {Object.keys(privacySettings).map(key => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                          {key === 'showPhone' ? 'Show Phone Number' : 
                           key === 'showWhatsApp' ? 'Show WhatsApp Number' : 
                           key === 'showAddress' ? 'Show Location/Addresses' : 
                           key === 'showEmail' ? 'Show Email Address' : 
                           'Show Resume/CV Link'}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          If turned off, users must "Request Access" to see this.
                        </div>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          checked={privacySettings[key]} 
                          onChange={(e) => {
                            const newSettings = { ...privacySettings, [key]: e.target.checked };
                            setPrivacySettings(newSettings);
                            updateDoc(doc(db, "users", user.uid), { privacySettings: newSettings })
                              .then(() => setStatusMessage("Privacy settings updated!"))
                              .catch(() => alert("Failed to save settings."));
                            setTimeout(() => setStatusMessage(""), 3000);
                          }} 
                          style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} 
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "40px" }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary" style={{ padding: "10px 20px" }}>
                    <Settings size={16} style={{ marginRight: "8px" }} /> Edit Profile Settings
                  </button>
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
