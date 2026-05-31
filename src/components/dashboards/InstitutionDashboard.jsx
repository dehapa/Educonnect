"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import { 
  Landmark, Users, Award, Edit3, Check, X, ShieldCheck, Loader, Briefcase, 
  ArrowRight, Shield, CheckCircle2, AlertCircle, ArrowLeft, CreditCard
} from "lucide-react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

export default function InstitutionDashboard() {
  const { user, profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [inst, setInst] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Basic Information
  const [name, setName] = useState("");
  const [instType, setInstType] = useState("University");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Step 2: About & Mission
  const [description, setDescription] = useState("");
  const [studentCount, setStudentCount] = useState("");
  
  // Step 3: Media & Socials
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Step 4: Plan & Payment
  const [selectedPlan, setSelectedPlan] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSimulating, setPaymentSimulating] = useState(false);

  // Dashboard Data (Step 5)
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [activeApplications, setActiveApplications] = useState([]);
  const [isPostingJob, setIsPostingJob] = useState(false);
  
  // Job form
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobSalary, setNewJobSalary] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newJobSkills, setNewJobSkills] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");

  const loadInstitutionData = async () => {
    if (!profile?.institutionId) return;

    try {
      const instRef = doc(db, "institutions", profile.institutionId);
      const instSnap = await getDoc(instRef);
      if (instSnap.exists()) {
        const data = instSnap.data();
        setInst({ id: instSnap.id, ...data });
        setName(data.name || "");
        setInstType(data.type || "University");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setDescription(data.description || "");
        setStudentCount(data.studentCount || "");
        setWebsite(data.website || "");
        setLogoUrl(data.logoUrl || "");
        setHeroUrl(data.heroUrl || "");
        setVideoUrl(data.videoUrl || "");
      }

      // Teachers
      const qTeachers = query(collection(db, "faculty_requests"), where("institutionId", "==", profile.institutionId), where("status", "==", "pending"));
      const teacherSnap = await getDocs(qTeachers);
      const teacherList = [];
      teacherSnap.forEach(d => teacherList.push({ id: d.id, ...d.data() }));
      setPendingTeachers(teacherList);

      // Students
      const qStudents = query(collection(db, "enrollment_requests"), where("institutionId", "==", profile.institutionId), where("status", "==", "pending"));
      const studentSnap = await getDocs(qStudents);
      const studentList = [];
      studentSnap.forEach(d => studentList.push({ id: d.id, ...d.data() }));
      setPendingStudents(studentList);

      // Jobs (if allowed)
      if (instSnap.data()?.tier === "diamond" || instSnap.data()?.tier === "paid-tier-2") {
        const qJobs = query(collection(db, "jobs"), where("employerId", "==", profile.institutionId));
        const jobsSnap = await getDocs(qJobs);
        const jobsList = [];
        jobsSnap.forEach(d => jobsList.push({ id: d.id, ...d.data() }));
        setPostedJobs(jobsList);

        const qApps = query(collection(db, "applications"), where("employerId", "==", profile.institutionId));
        const appsSnap = await getDocs(qApps);
        const appsList = [];
        appsSnap.forEach(d => appsList.push({ id: d.id, ...d.data() }));
        setActiveApplications(appsList);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutionData();
  }, [profile]);

  // --- Handlers ---
  const handleSaveStep = async (step, e) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const instRef = doc(db, "institutions", profile.institutionId);
      let updateData = {};
      
      if (step === 1) updateData = { name, type: instType, address, phone, email };
      else if (step === 2) updateData = { description, studentCount };
      else if (step === 3) updateData = { website, logoUrl, heroUrl, videoUrl };
      
      await updateDoc(instRef, updateData);
      setInst(prev => ({ ...prev, ...updateData }));
      
      setCurrentStep(step + 1);
      window.scrollTo(0,0);
    } catch (error) {
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

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    if (plan === "free") {
      updateTierAndFinish("free");
    } else {
      setShowPayment(true);
    }
  };

  const updateTierAndFinish = async (tier) => {
    setSavingProfile(true);
    try {
      const instRef = doc(db, "institutions", profile.institutionId);
      await updateDoc(instRef, { tier });
      setInst(prev => ({ ...prev, tier }));
      setCurrentStep(5); // Go to Dashboard
      window.scrollTo(0,0);
      setStatusMessage(`Successfully enrolled in ${tier.toUpperCase()} plan!`);
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (error) {
      alert("Failed to update tier.");
    } finally {
      setSavingProfile(false);
    }
  };

  const simulatePayment = () => {
    setPaymentSimulating(true);
    setTimeout(() => {
      setPaymentSimulating(false);
      setShowPayment(false);
      updateTierAndFinish(selectedPlan);
    }, 2500);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingHero(true);
    
    try {
      const imageRef = ref(storage, `institutions/${profile.institutionId}/${type}_${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      if (type === 'logo') setLogoUrl(url);
      else setHeroUrl(url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingHero(false);
    }
  };

  // Rest of original Dashboard logic...
  const handleApproveTeacher = async (requestId, teacherUid, teacherName) => {
    try {
      await updateDoc(doc(db, "users", teacherUid), { institutionId: profile.institutionId, institutionName: inst.name, isVerifiedFaculty: true });
      await updateDoc(doc(db, "faculty_requests", requestId), { status: "approved" });
      setPendingTeachers(pendingTeachers.filter(t => t.id !== requestId));
    } catch (err) { console.error(err); }
  };

  const handleRejectTeacher = async (requestId) => {
    try {
      await updateDoc(doc(db, "faculty_requests", requestId), { status: "rejected" });
      setPendingTeachers(pendingTeachers.filter(t => t.id !== requestId));
    } catch (err) { console.error(err); }
  };

  const handleApproveStudent = async (requestId, studentUid, studentName) => {
    try {
      const studentRef = doc(db, "users", studentUid);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const updatedEdu = (studentData.education || []).map(edu => edu.id === profile.institutionId ? { ...edu, isVerified: true } : edu);
        await updateDoc(studentRef, { education: updatedEdu, institutionId: profile.institutionId, institutionName: inst.name, isVerifiedEducation: true });
      }
      await updateDoc(doc(db, "enrollment_requests", requestId), { status: "approved" });
      setPendingStudents(pendingStudents.filter(s => s.id !== requestId));
    } catch (err) { console.error(err); }
  };

  const handleRejectStudent = async (requestId) => {
    try {
      await updateDoc(doc(db, "enrollment_requests", requestId), { status: "rejected" });
      setPendingStudents(pendingStudents.filter(s => s.id !== requestId));
    } catch (err) { console.error(err); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDescription) return;
    setIsPostingJob(true);
    try {
      const jobId = `job-${Date.now()}`;
      const jobData = {
        id: jobId, employerId: profile.institutionId, employerName: inst.name, title: newJobTitle,
        salary: newJobSalary || "Negotiable", location: newJobLocation || inst.address || "Odisha",
        type: newJobType, skills: newJobSkills ? newJobSkills.split(",").map(s => s.trim()) : [],
        description: newJobDescription, createdAt: new Date().toISOString()
      };
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "jobs", jobId), jobData);
      setPostedJobs(prev => [...prev, jobData]);
      setNewJobTitle(""); setNewJobSalary(""); setNewJobLocation(""); setNewJobSkills(""); setNewJobDescription("");
    } catch(err) { console.error(err); } finally { setIsPostingJob(false); }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status: newStatus });
      setActiveApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    } catch(err) { console.error(err); }
  };

  // --- UI Renders ---
  const renderProgressBar = () => {
    const steps = ["Basic Info", "Mission", "Media", "Plan", "Dashboard"];
    return (
      <div style={{ marginBottom: "40px", padding: "20px", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-primary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "4px", background: "var(--border-secondary)", zIndex: 1, transform: "translateY(-50%)" }}>
             <div style={{ width: `${((currentStep - 1) / 4) * 100}%`, height: "100%", background: "var(--primary)", transition: "width 0.3s ease" }}></div>
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
                <span style={{ fontSize: "0.75rem", fontWeight: "600", color: isActive ? "var(--text-primary)" : "var(--text-muted)", display: "none" }} className="md-show">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}><Loader className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} /></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container" style={{ maxWidth: currentStep === 5 ? "1200px" : "800px" }}>
          
          {currentStep < 5 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "2.2rem", color: "var(--text-primary)", fontWeight: "800", marginBottom: "8px" }}>
                  Institution Setup
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>Set up your public profile to attract the best students and faculty.</p>
              </div>

              <div style={{ padding: "16px", background: "var(--warning-light)", color: "var(--warning)", border: "1px solid var(--warning)", borderRadius: "12px", fontSize: "0.95rem", marginBottom: "32px", display: "flex", alignItems: "flex-start", gap: "12px", animation: "fadeIn 0.5s ease" }}>
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Setup Required:</strong> Complete these steps to launch your public page. You can skip steps and return later!
                </div>
              </div>

              {renderProgressBar()}
            </>
          )}

          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Basic Information</h2>
              <form onSubmit={(e) => handleSaveStep(1, e)} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px" }}>
                <div>
                  <label className="form-label">Institution Name *</label>
                  <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Institution Type</label>
                  <select className="form-input" value={instType} onChange={e => setInstType(e.target.value)}>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Training Center">Training Center</option>
                  </select>
                </div>
                <div><label className="form-label">Full Location Address</label><input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div><label className="form-label">Contact Phone</label><input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                  <div><label className="form-label">Contact Email</label><input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} /></div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button type="submit" disabled={savingProfile} className="btn-primary" style={{ padding: "12px 32px" }}>Save & Continue <ArrowRight size={18} /></button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Mission */}
          {currentStep === 2 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>About & Mission</h2>
              <form onSubmit={(e) => handleSaveStep(2, e)} style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
                <div>
                  <label className="form-label">Editorial Summary / Description</label>
                  <textarea className="form-input" rows="5" placeholder="Detail your courses, study structures, campus size..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: "none" }}></textarea>
                </div>
                <div><label className="form-label">Total Student Capacity / Count</label><input type="number" className="form-input" placeholder="e.g. 5000" value={studentCount} onChange={e => setStudentCount(e.target.value)} /></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary"><ArrowLeft size={18} /> Back</button>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button type="button" onClick={handleSkip} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: "600" }}>Skip for now</button>
                    <button type="submit" disabled={savingProfile} className="btn-primary">Save & Continue <ArrowRight size={18} /></button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Media */}
          {currentStep === 3 && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>Media & Branding</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "24px" }}>
                <div>
                  <label className="form-label">Institution Logo (Square 500x500px)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--border-primary)" }}>
                      {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>No Logo</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploadingLogo} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Hero Banner Background (1920x600px)</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ width: "100%", height: "120px", borderRadius: "12px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "2px solid var(--border-primary)" }}>
                      {heroUrl ? <img src={heroUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No Banner</span>}
                    </div>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} disabled={uploadingHero} />
                  </div>
                </div>
                <div><label className="form-label">Website URL</label><input type="url" className="form-input" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." /></div>
                <div><label className="form-label">Public Campus Video Link (YouTube)</label><input type="url" className="form-input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} /></div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                  <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary"><ArrowLeft size={18} /> Back</button>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <button type="button" onClick={handleSkip} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontWeight: "600" }}>Skip for now</button>
                    <button type="button" onClick={(e) => handleSaveStep(3, e)} disabled={savingProfile} className="btn-primary">Save & Continue <ArrowRight size={18} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Plan Selection */}
          {currentStep === 4 && !showPayment && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Choose Your Plan</h2>
                <p style={{ color: "var(--text-secondary)" }}>Select a tier to unlock premium features and higher visibility.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                {/* Free Plan */}
                <div style={{ background: "var(--bg-tertiary)", padding: "32px 24px", borderRadius: "16px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "8px" }}>Free Tier</h3>
                  <div style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "24px" }}>₹0<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", textAlign: "left", width: "100%", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)" }}>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Standard Public Listing</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Verify Students/Teachers</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 }}><X size={16} /> Advertisements Displayed</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 }}><X size={16} /> No Job Postings</li>
                  </ul>
                  <button onClick={() => handlePlanSelection("free")} className="btn-secondary" style={{ width: "100%", marginTop: "auto" }}>Select Free</button>
                </div>

                {/* Gold Plan */}
                <div style={{ background: "var(--bg-tertiary)", padding: "32px 24px", borderRadius: "16px", border: "2px solid var(--primary)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxShadow: "0 0 20px rgba(79, 70, 229, 0.15)" }}>
                  <div style={{ position: "absolute", top: "-12px", background: "var(--primary)", color: "white", padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>Recommended</div>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "8px", color: "var(--primary)" }}>Gold Tier</h3>
                  <div style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "24px" }}>₹2499<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", textAlign: "left", width: "100%", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)" }}>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Verified Badge</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Campus Photo Gallery</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Customized Theme Colors</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.5 }}><X size={16} /> Advertisements Displayed</li>
                  </ul>
                  <button onClick={() => handlePlanSelection("gold")} className="btn-primary" style={{ width: "100%", marginTop: "auto" }}>Select Gold</button>
                </div>

                {/* Diamond Plan */}
                <div style={{ background: "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(16, 185, 129, 0.05) 100%)", padding: "32px 24px", borderRadius: "16px", border: "1px solid var(--success)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "8px", color: "var(--success)" }}>Diamond Tier</h3>
                  <div style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "24px" }}>₹5999<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/mo</span></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", textAlign: "left", width: "100%", display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-secondary)" }}>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Everything in Gold</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Post Unlimited Jobs</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Premium Top Ranking</li>
                    <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><Check size={16} style={{ color: "var(--success)" }} /> Zero Advertisements</li>
                  </ul>
                  <button onClick={() => handlePlanSelection("diamond")} className="btn-primary" style={{ width: "100%", marginTop: "auto", background: "var(--success)" }}>Select Diamond</button>
                </div>
              </div>
            </div>
          )}

          {/* MOCK PAYMENT GATEWAY */}
          {currentStep === 4 && showPayment && (
            <div className="glass-card" style={{ padding: "40px", animation: "fadeIn 0.4s ease", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
              <div style={{ background: "rgba(79, 70, 229, 0.1)", display: "inline-flex", padding: "16px", borderRadius: "50%", marginBottom: "24px" }}>
                <CreditCard size={32} style={{ color: "var(--primary)" }} />
              </div>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>Secure Checkout</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>You selected the <strong style={{ textTransform: "capitalize", color: "var(--text-primary)" }}>{selectedPlan}</strong> plan.</p>
              
              <div style={{ padding: "20px", border: "1px dashed var(--border-secondary)", borderRadius: "12px", marginBottom: "32px", background: "var(--bg-secondary)" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>This is a simulated payment gateway. No real charges will be made during this development phase.</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "1.2rem", paddingBottom: "16px", borderBottom: "1px solid var(--border-primary)", marginBottom: "16px" }}>
                  <span>Total Due:</span>
                  <span>{selectedPlan === "gold" ? "₹2499.00" : "₹5999.00"}</span>
                </div>
                <button 
                  onClick={simulatePayment} 
                  disabled={paymentSimulating}
                  className="btn-primary" 
                  style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
                >
                  {paymentSimulating ? <Loader size={20} className="spinner" /> : "Pay Now (Mock)"}
                </button>
              </div>
              
              <button onClick={() => setShowPayment(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}>Cancel and choose a different plan</button>
            </div>
          )}

          {/* STEP 5: Main Dashboard (The original UI) */}
          {currentStep === 5 && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              {statusMessage && (
                <div style={{ padding: "16px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "12px", fontSize: "0.95rem", marginBottom: "32px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
                  <CheckCircle2 size={24} /> {statusMessage}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Landmark size={28} /></div>
                <div>
                  <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{inst?.name || "Institution Panel"}</span>
                    <ShieldCheck size={24} style={{ color: "var(--success)" }} />
                  </h1>
                  <p style={{ color: "var(--text-secondary)" }}>Verify student enrollments, authorize teacher profiles, and post jobs.</p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-secondary)", display: "inline-flex", fontWeight: "600", color: "var(--text-muted)" }}>
                      Tier: <strong style={{ color: "var(--text-secondary)", marginLeft: "4px", textTransform: "capitalize" }}>{inst?.tier || "Free"}</strong>
                    </span>
                    <button onClick={() => setCurrentStep(1)} style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline" }}>Edit Profile</button>
                    {inst?.tier === "free" && <button onClick={() => setCurrentStep(4)} style={{ background: "var(--warning-light)", color: "var(--warning)", border: "1px solid var(--warning)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "600" }}>Upgrade Plan</button>}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                {/* Faculty Approvals */}
                <div className="glass-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Users size={20} style={{ color: "var(--accent)" }} /> Faculty Requests</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {pendingTeachers.length > 0 ? pendingTeachers.map((teach) => (
                      <div key={teach.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Prof. {teach.userName}</h4><span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{teach.subject}</span></div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleRejectTeacher(teach.id)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem", color: "var(--danger)" }}><X size={14} /></button>
                          <button onClick={() => handleApproveTeacher(teach.id, teach.userId, teach.userName)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "var(--success)" }}><Check size={14} /> Approve</button>
                        </div>
                      </div>
                    )) : <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>No requests.</div>}
                  </div>
                </div>

                {/* Student Approvals */}
                <div className="glass-card" style={{ padding: "32px" }}>
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Award size={20} style={{ color: "var(--success)" }} /> Student Requests</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {pendingStudents.length > 0 ? pendingStudents.map((stud) => (
                      <div key={stud.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{stud.studentName}</h4><span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stud.degree}</span></div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleRejectStudent(stud.id)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem", color: "var(--danger)" }}><X size={14} /></button>
                          <button onClick={() => handleApproveStudent(stud.id, stud.studentId, stud.studentName)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "var(--success)" }}><Check size={14} /> Approve</button>
                        </div>
                      </div>
                    )) : <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>No requests.</div>}
                  </div>
                </div>
              </div>

              {/* Jobs section only for Diamond or paid-tier-2 */}
              <div style={{ marginTop: "40px" }}>
                {(inst?.tier === "diamond" || inst?.tier === "paid-tier-2") ? (
                  <div className="glass-card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "1.4rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={22} style={{ color: "var(--success)" }} /> Job Posting Console</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                      
                      <form onSubmit={handlePostJob} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div><label className="form-label">Job Title *</label><input type="text" className="form-input" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} required /></div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <div><label className="form-label">Salary</label><input type="text" className="form-input" value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} /></div>
                          <div><label className="form-label">Location</label><input type="text" className="form-input" value={newJobLocation} onChange={(e) => setNewJobLocation(e.target.value)} /></div>
                        </div>
                        <div><label className="form-label">Description *</label><textarea className="form-input" value={newJobDescription} onChange={(e) => setNewJobDescription(e.target.value)} style={{ height: "100px", resize: "none" }} required /></div>
                        <button type="submit" disabled={isPostingJob} className="btn-primary" style={{ padding: "10px 24px", alignSelf: "flex-end" }}>{isPostingJob ? "Publishing..." : "Publish Job Listing"}</button>
                      </form>

                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px" }}>Active Positions ({postedJobs.length})</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          {postedJobs.length > 0 ? postedJobs.map((job) => {
                            const jobApps = activeApplications.filter(a => a.jobId === job.id);
                            return (
                              <div key={job.id} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px" }}>
                                <div style={{ borderBottom: "1px solid var(--border-secondary)", paddingBottom: "10px", marginBottom: "10px" }}>
                                  <h5 style={{ fontSize: "1rem", fontWeight: "700" }}>{job.title}</h5>
                                </div>
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Applicants ({jobApps.length})</label>
                                {jobApps.map((app) => (
                                  <div key={app.id} style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "8px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{app.studentName}</span>
                                    <span style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "100px", background: "var(--primary-light)", color: "var(--primary)", fontWeight: "700" }}>{app.status.toUpperCase()}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }) : <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>No jobs published.</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card" style={{ padding: "32px", border: "1px dashed var(--warning)", textAlign: "center" }}>
                    <Shield size={32} style={{ color: "var(--warning)", margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>Unlock Campus Placements</h3>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Upgrade to the Diamond tier to post job openings directly to students.</p>
                    <button onClick={() => setCurrentStep(4)} className="btn-primary" style={{ background: "var(--warning)" }}>Upgrade to Diamond</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <style jsx global>{`
        .form-label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .md-show { display: block !important; } }
      `}</style>
    </div>
  );
}
