"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import { 
  Briefcase, Plus, Users, Globe, MapPin, DollarSign, Calendar, 
  Trash2, Award, CheckCircle2, UserCheck, Send, Loader, UserX, UserMinus, Search, ExternalLink
} from "lucide-react";
import { doc, updateDoc, collection, getDocs, addDoc, query, where, deleteDoc } from "firebase/firestore";
import { db, logAppEvent } from "../../lib/firebase";

export default function EmployerDashboard() {
  const { user, profile } = useAuth();
  
  // Profile states
  const [companyName, setCompanyName] = useState(profile?.name || "");
  const [companyBio, setCompanyBio] = useState(profile?.bio || "");
  const [companyLoc, setCompanyLoc] = useState(profile?.location || "");
  const [companyWeb, setCompanyWeb] = useState(profile?.website || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Job Posting Form states
  const [jobTitle, setJobTitle] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [jobLoc, setJobLoc] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobSkills, setJobSkills] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [postingJob, setPostingJob] = useState(false);

  // Database loaded states
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  // Talent Search states
  const [talentQuery, setTalentQuery] = useState("");
  const [talentResults, setTalentResults] = useState([]);
  const [searchingTalent, setSearchingTalent] = useState(false);

  // Load jobs and applications
  const loadEmployerData = async () => {
    if (!user) return;
    try {
      // 1. Fetch Employer Jobs
      const qJobs = query(collection(db, "jobs"), where("employerId", "==", user.uid));
      const jobsSnap = await getDocs(qJobs);
      const jobsList = [];
      jobsSnap.forEach(d => jobsList.push({ id: d.id, ...d.data() }));
      setJobs(jobsList);

      // 2. Fetch Applications for Employer's Jobs
      const qApps = query(collection(db, "applications"), where("employerId", "==", user.uid));
      const appsSnap = await getDocs(qApps);
      const appsList = [];
      appsSnap.forEach(d => appsList.push({ id: d.id, ...d.data() }));
      setApplicants(appsList);
    } catch (e) {
      console.error("Error loading employer dashboard data:", e);
    }
  };

  useEffect(() => {
    loadEmployerData();
  }, [user]);

  // Save company details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: companyName,
        bio: companyBio,
        location: companyLoc,
        website: companyWeb
      });
      setStatusMessage("Company profile updated successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update company details.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Post Job
  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobSalary || !jobLoc) {
      alert("Please fill in job title, salary, and location.");
      return;
    }
    setPostingJob(true);

    try {
      const skillsArray = jobSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);
      
      const newJob = {
        employerId: user.uid,
        employerName: companyName || profile.name || "Employer",
        title: jobTitle,
        type: jobType,
        location: jobLoc,
        salary: jobSalary,
        skills: skillsArray,
        description: jobDesc,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "jobs"), newJob);
      
      logAppEvent("job_posted", {
        jobType,
        location: jobLoc
      });

      alert("Job vacancy posted successfully! It is now visible on the placements directory.");
      
      // Reset form
      setJobTitle("");
      setJobLoc("");
      setJobSalary("");
      setJobSkills("");
      setJobDesc("");
      
      // Reload jobs list
      loadEmployerData();
    } catch (err) {
      console.error(err);
      alert("Failed to post job opening.");
    } finally {
      setPostingJob(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter(j => j.id !== jobId));
    } catch (e) {
      console.error(e);
    }
  };

  // Update Applicant status
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, {
        status: newStatus
      });
      alert(`Applicant status updated to: ${newStatus.toUpperCase()}`);
      
      // Update local state
      setApplicants(applicants.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    }
  };

  const handleTalentSearch = async (e) => {
    e.preventDefault();
    if (!talentQuery.trim()) return;
    setSearchingTalent(true);
    try {
      // For simplicity without a complex search engine (like Algolia), 
      // we'll fetch all students and filter locally by the query (skills or name)
      // Note: In production with thousands of users, use Algolia/Typesense.
      const q = query(collection(db, "users"), where("role", "in", ["student", "teacher"]));
      const snap = await getDocs(q);
      const results = [];
      const queryLower = talentQuery.toLowerCase();
      
      snap.forEach(d => {
        const userData = d.data();
        const nameMatch = (userData.name || "").toLowerCase().includes(queryLower);
        const skillsMatch = (userData.skills || []).some(s => s.toLowerCase().includes(queryLower));
        const roleMatch = (userData.role || "").toLowerCase().includes(queryLower);
        const subjectMatch = (userData.subject || "").toLowerCase().includes(queryLower);
        
        if (nameMatch || skillsMatch || roleMatch || subjectMatch) {
          results.push({ id: d.id, ...userData });
        }
      });
      setTalentResults(results);
    } catch (err) {
      console.error("Talent search error:", err);
    } finally {
      setSearchingTalent(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          
          {/* Welcome Dashboard Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <Briefcase size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800" }}>
                Welcome, {companyName || "Employer"}
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>Post vacancies, manage active placements, and review campus talent submissions.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="dashboard-grid">
            
            {/* Column 1: Post Jobs & Active listings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Job Posting Form */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={20} style={{ color: "var(--primary)" }} />
                  Post Placement Vacancy
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Create a new job or internship opportunity for students across Odisha and Pan-India.
                </p>

                <form onSubmit={handlePostJob} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Title *</label>
                      <input type="text" placeholder="e.g. React Frontend Intern" className="form-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Type *</label>
                      <select className="form-input" value={jobType} onChange={(e) => setJobType(e.target.value)} style={{ cursor: "pointer" }}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Location *</label>
                      <input type="text" placeholder="e.g. Bhubaneswar (On-site) / Remote" className="form-input" value={jobLoc} onChange={(e) => setJobLoc(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Compensation / Salary *</label>
                      <input type="text" placeholder="e.g. ₹15,000 / month, ₹6.5 LPA" className="form-input" value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Required Skills (Comma separated)</label>
                    <input type="text" placeholder="e.g. React, JavaScript, HTML, CSS" className="form-input" value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Description & Apply Details *</label>
                    <textarea 
                      placeholder="Detail the daily responsibilities, skills requirements, and how candidates will be interviewed..." 
                      className="form-input"
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      style={{ height: "100px", resize: "none" }}
                      required
                    />
                  </div>

                  <button type="submit" disabled={postingJob} className="btn-primary" style={{ padding: "12px", gap: "6px" }}>
                    {postingJob ? <Loader className="spinner" size={16} /> : <Plus size={16} />}
                    <span>Post Career Listing</span>
                  </button>
                </form>
              </div>

              {/* Active Jobs list */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ClipboardList className="icon" size={20} style={{ color: "var(--primary)" }} />
                  <span>Your Active Jobs ({jobs.length})</span>
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <div key={job.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{job.title}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                            <MapPin size={12} /> {job.location} | <DollarSign size={12} /> {job.salary}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteJob(job.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", padding: "8px" }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      No active job postings. Post your first listing above!
                    </div>
                  )}
                </div>
              </div>

              {/* Talent Search Section */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Search size={20} style={{ color: "var(--accent)" }} />
                  Talent Search
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Search our verified pool of students and teachers by skills, subjects, or names.
                </p>

                <form onSubmit={handleTalentSearch} style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <input 
                    type="text" 
                    placeholder="Search e.g., 'React', 'Physics', 'John Doe'..." 
                    className="form-input" 
                    value={talentQuery}
                    onChange={(e) => setTalentQuery(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={searchingTalent} className="btn-primary" style={{ padding: "10px 24px" }}>
                    {searchingTalent ? <Loader className="spinner" size={16} /> : "Search"}
                  </button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {talentResults.length > 0 ? (
                    talentResults.map((t) => (
                      <div key={t.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                            {t.name}
                            {t.tier === "premium" && <CheckCircle2 size={14} style={{ color: "var(--primary)" }} />}
                          </h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--primary)", textTransform: "uppercase", fontWeight: "700" }}>{t.role}</span>
                          
                          {t.skills && t.skills.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                              {t.skills.slice(0, 3).map((sk, i) => (
                                <span key={i} style={{ fontSize: "0.65rem", padding: "2px 6px", background: "var(--bg-secondary)", border: "1px solid var(--border-secondary)", borderRadius: "4px", color: "var(--text-secondary)" }}>
                                  {sk}
                                </span>
                              ))}
                              {t.skills.length > 3 && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>+{t.skills.length - 3}</span>}
                            </div>
                          )}
                          {t.subject && (
                            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>Subj: {t.subject}</p>
                          )}
                        </div>
                        <a href={`/${t.role}/${t.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "8px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                          Profile <ExternalLink size={14} />
                        </a>
                      </div>
                    ))
                  ) : (
                    talentQuery && !searchingTalent ? (
                      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No users found matching "{talentQuery}".
                      </div>
                    ) : null
                  )}
                </div>
              </div>

            </div>

            {/* Column 2: Applicants pipeline & Company Profile */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Applicants pipeline */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={20} style={{ color: "var(--success)" }} />
                  Applicants Review Pipeline
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Review timeline resumes and manage candidate interview sequences.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {applicants.length > 0 ? (
                    applicants.map((app) => (
                      <div key={app.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{app.studentName}</h4>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Applied for: **{app.jobTitle}**</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--primary)", display: "block", textDecoration: "underline", marginTop: "4px" }}>
                              <a href={`/student/${app.studentId}`} target="_blank" rel="noopener noreferrer">
                                View Profile Timeline →
                              </a>
                            </span>
                          </div>
                          
                          <span style={{
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "100px",
                            border: "1px solid",
                            background: 
                              app.status === "hired" ? "var(--success-light)" : 
                              app.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                            color: 
                              app.status === "hired" ? "var(--success)" : 
                              app.status === "rejected" ? "var(--danger)" : "var(--warning)"
                          }}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Pipeline controls */}
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: "1px solid var(--border-primary)", paddingTop: "10px" }}>
                          <button 
                            onClick={() => handleUpdateStatus(app.id, "rejected")} 
                            className="btn-secondary" 
                            style={{ padding: "5px 10px", fontSize: "0.75rem", border: "1px solid var(--danger)", color: "var(--danger)" }}
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(app.id, "interview")} 
                            className="btn-secondary" 
                            style={{ padding: "5px 10px", fontSize: "0.75rem", border: "1px solid var(--warning)", color: "var(--warning)" }}
                          >
                            Interview
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(app.id, "hired")} 
                            className="btn-primary" 
                            style={{ padding: "5px 12px", fontSize: "0.75rem", background: "var(--success)" }}
                          >
                            Hire Student
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      No applicants yet for your job openings.
                    </div>
                  )}
                </div>
              </div>

              {/* Company Profile configuration */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Globe size={20} style={{ color: "var(--accent)" }} />
                  Company Directory Profile
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Configure your company listing details displayed to applicants.
                </p>

                {statusMessage && (
                  <div style={{ padding: "12px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Company Name *</label>
                    <input type="text" className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Location</label>
                      <input type="text" placeholder="Bhubaneswar, India" className="form-input" value={companyLoc} onChange={(e) => setCompanyLoc(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Website URL</label>
                      <input type="url" placeholder="https://company.com" className="form-input" value={companyWeb} onChange={(e) => setCompanyWeb(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Company Bio / Description</label>
                    <textarea 
                      placeholder="Detail your company industry, environment, and placements history..." 
                      className="form-input"
                      value={companyBio}
                      onChange={(e) => setCompanyBio(e.target.value)}
                      style={{ height: "100px", resize: "none" }}
                    />
                  </div>

                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ alignSelf: "flex-end", padding: "10px 24px", fontSize: "0.85rem" }}>
                    {savingProfile ? "Saving..." : "Save Company Profile"}
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
      <style jsx global>{`
        .dashboard-grid {
          grid-template-columns: 1fr;
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
