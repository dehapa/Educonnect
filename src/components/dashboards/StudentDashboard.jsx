"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import SuggestionModal from "../SuggestionModal";
import { 
  GraduationCap, Briefcase, Plus, Trash2, Calendar, MapPin, 
  ExternalLink, User, Settings, CheckCircle2, ClipboardList, BookOpen, AlertCircle
} from "lucide-react";
import { doc, updateDoc, getDoc, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, profile, saveUserProfile } = useAuth();
  
  // Forms states
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills?.join(", ") || "");
  const [resumeLink, setResumeLink] = useState(profile?.resumeLink || "");
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Academic Timeline states
  const [instSearch, setInstSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedInst, setSelectedInst] = useState(null);
  const [degree, setDegree] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [isCurrentStudy, setIsCurrentStudy] = useState(false);
  
  // Employment states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [startJob, setStartJob] = useState("");
  const [endJob, setEndJob] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  
  // Database states
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [localTimeline, setLocalTimeline] = useState(profile?.education || []);
  const [localWork, setLocalWork] = useState(profile?.employment || []);
  
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Load institutions list for search autocomplete and applications list
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch all institutions
        const snap = await getDocs(collection(db, "institutions"));
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        setAllInstitutions(list);

        // Fetch student applications
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

  // Save profile bio & skills
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bio,
        skills: skillsArray,
        resumeLink
      });
      setStatusMessage("Profile updated successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Add academic timeline milestone
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
        // Save direct association to help employer queries if current
        ...(isCurrentStudy ? { institutionId: selectedInst.id, institutionName: selectedInst.name } : {})
      });

      // Submit an enrollment request document to 'enrollment_requests' for Institution Admin review
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
      
      // Reset form
      setInstSearch("");
      setSelectedInst(null);
      setDegree("");
      setStartYear("");
      setEndYear("");
      setIsCurrentStudy(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update education timeline.");
    }
  };

  // Add work timeline milestone
  const handleAddWork = async (e) => {
    e.preventDefault();
    if (!company || !role || !startJob) {
      alert("Please fill in company, role, and start date.");
      return;
    }

    const newItem = {
      company,
      role,
      location: jobLocation || "N/A",
      startYear: startJob,
      endYear: isCurrentJob ? "Present" : endJob || "N/A",
      isCurrent: isCurrentJob,
      isVerified: false
    };

    const updatedWork = [...localWork, newItem];
    setLocalWork(updatedWork);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        employment: updatedWork
      });

      setCompany("");
      setRole("");
      setJobLocation("");
      setStartJob("");
      setEndJob("");
      setIsCurrentJob(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update work timeline.");
    }
  };

  // Remove academic milestone
  const handleRemoveAcademic = async (index) => {
    const updated = localTimeline.filter((_, i) => i !== index);
    setLocalTimeline(updated);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { education: updated });
    } catch (err) {
      console.error(err);
    }
  };

  // Remove work milestone
  const handleRemoveWork = async (index) => {
    const updated = localWork.filter((_, i) => i !== index);
    setLocalWork(updated);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { employment: updated });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          
          {/* Welcome Panel */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800" }}>
                Welcome back, {profile?.name || "Student"}
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>Manage your education timeline, public profile, and active placement applications.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="dashboard-grid">
            
            {/* Column 1: Timelines (Education & Work) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Education timeline builder */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <GraduationCap size={20} style={{ color: "var(--primary)" }} />
                  Academic History Timeline
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Link verified educational organizations you studied at to display them chronologically on your public resume.
                </p>

                {/* Vertical Timeline Display */}
                {localTimeline.length > 0 && (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "20px 0 32px 10px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {localTimeline.map((item, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        {/* Dot */}
                        <div style={{
                          position: "absolute",
                          left: "-33px",
                          top: "4px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: item.isCurrent ? "var(--primary)" : "var(--bg-secondary)",
                          border: `3px solid ${item.isCurrent ? "var(--primary-glow)" : "var(--border-secondary)"}`
                        }}></div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", background: "var(--bg-tertiary)", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{item.startYear} - {item.endYear}</span>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                              <Link href={`/institutions/${item.id}`} style={{ textDecoration: "underline", color: "var(--text-primary)" }}>
                                {item.name}
                              </Link>
                              <span style={{ fontSize: "1rem" }}>{item.logo}</span>
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{item.degree}</p>
                          </div>
                          
                          <button onClick={() => handleRemoveAcademic(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "4px" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add milestone form */}
                <form onSubmit={handleAddAcademic} style={{ padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Add Academic Milestone</h4>
                  
                  {/* Autocomplete Input */}
                  <div style={{ position: "relative" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Search Institution *</label>
                    <input 
                      type="text" 
                      placeholder="Type to search school, college, coaching..." 
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
                            style={{ padding: "10px 14px", cursor: "pointer", hover: { background: "var(--bg-tertiary)" }, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            className="suggestion-item"
                          >
                            <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{s.name} ({s.logo})</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.location}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Degree/Course */}
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Degree / Course / Class *</label>
                    <input type="text" placeholder="e.g. Class XII Science, B.Sc Physics, B.Tech CSE" className="form-input" value={degree} onChange={(e) => setDegree(e.target.value)} required />
                  </div>

                  {/* Years */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Start Year *</label>
                      <input type="number" placeholder="2024" className="form-input" value={startYear} onChange={(e) => setStartYear(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>End Year (Estimated)</label>
                      <input type="number" placeholder="2026" className="form-input" value={endYear} onChange={(e) => setEndYear(e.target.value)} disabled={isCurrentStudy} />
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                    <input type="checkbox" checked={isCurrentStudy} onChange={(e) => setIsCurrentStudy(e.target.checked)} />
                    <span>I am currently studying here</span>
                  </label>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                    <span 
                      onClick={() => setIsSuggestModalOpen(true)}
                      style={{ fontSize: "0.8rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "600" }}
                    >
                      Can't find your school?
                    </span>
                    <button type="submit" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem", gap: "4px" }}>
                      <Plus size={16} /> Add Milestone
                    </button>
                  </div>
                </form>
              </div>

              {/* Work history timeline builder */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={20} style={{ color: "var(--success)" }} />
                  Employment History Timeline
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Add your past or current internships and job details.
                </p>

                {/* Work list */}
                {localWork.length > 0 && (
                  <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px solid var(--border-primary)", margin: "20px 0 32px 10px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {localWork.map((item, idx) => (
                      <div key={idx} style={{ position: "relative" }}>
                        <div style={{
                          position: "absolute",
                          left: "-33px",
                          top: "4px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: item.isCurrent ? "var(--success)" : "var(--bg-secondary)",
                          border: `3px solid ${item.isCurrent ? "var(--success-light)" : "var(--border-secondary)"}`
                        }}></div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", background: "var(--bg-tertiary)", padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "700" }}>{item.startYear} - {item.endYear}</span>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginTop: "4px" }}>{item.role}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{item.company} • {item.location}</p>
                          </div>
                          
                          <button onClick={() => handleRemoveWork(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "4px" }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add work form */}
                <form onSubmit={handleAddWork} style={{ padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>Add Work Experience</h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Company / Employer *</label>
                      <input type="text" placeholder="e.g. Infosys, TCS" className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Role / Designation *</label>
                      <input type="text" placeholder="e.g. Intern, Web Developer" className="form-input" value={role} onChange={(e) => setRole(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Start Date *</label>
                      <input type="text" placeholder="e.g. Jan 2025" className="form-input" value={startJob} onChange={(e) => setStartJob(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>End Date</label>
                      <input type="text" placeholder="e.g. May 2025" className="form-input" value={endJob} onChange={(e) => setEndJob(e.target.value)} disabled={isCurrentJob} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Location</label>
                      <input type="text" placeholder="e.g. Bhubaneswar, Remote" className="form-input" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
                    </div>
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

            </div>

            {/* Column 2: Profile settings & applied jobs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Profile Config */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={20} style={{ color: "var(--accent)" }} />
                  Profile Configuration
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Update your professional bio and technical skills list (comma-separated).
                </p>

                {statusMessage && (
                  <div style={{ padding: "12px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Brief Professional Bio</label>
                    <textarea 
                      placeholder="Introduce yourself to employers and schools..." 
                      className="form-input"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ height: "100px", resize: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Technical Skills (Comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, JavaScript, Node.js, Teaching, Communication" 
                      className="form-input"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
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

                  {profile && (
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "4px 0 12px 0" }}>
                      {profile.skills?.map((sk, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "var(--primary-light)", color: "var(--primary)", border: "1px solid", borderRadius: "100px", fontWeight: "600" }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", alignItems: "center" }}>
                    {profile && (
                      <Link 
                        href={`/student/${user.uid}`} 
                        className="btn-secondary" 
                        style={{ padding: "10px 16px", fontSize: "0.85rem", gap: "6px" }}
                        target="_blank"
                      >
                        <span>View Public Resume</span>
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Placement Job Applications Status */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClipboardList size={20} style={{ color: "var(--primary)" }} />
                  Applied Placements
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Track your job applications submitted to local companies.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <div key={app.id} style={{ padding: "14px 16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>{app.jobTitle}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.employerName}</span>
                        </div>
                        
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "100px",
                          textTransform: "uppercase",
                          border: "1px solid",
                          background: 
                            app.status === "hired" ? "var(--success-light)" : 
                            app.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: 
                            app.status === "hired" ? "var(--success)" : 
                            app.status === "rejected" ? "var(--danger)" : "var(--warning)"
                        }}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>
                      You haven't applied for any placements yet.
                    </div>
                  )}
                </div>
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
      `}</style>
    </div>
  );
}
