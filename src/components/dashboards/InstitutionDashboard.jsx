"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../Header";
import Footer from "../Footer";
import { 
  Landmark, Users, Award, BookOpen, Edit3, Check, X, 
  MapPin, Phone, Globe, ShieldCheck, Loader, Star,
  Briefcase, DollarSign, Calendar, Clock, ArrowRight, Shield
} from "lucide-react";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

export default function InstitutionDashboard() {
  const { user, profile } = useAuth();
  
  // Institution details state
  const [inst, setInst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingInst, setUpdatingInst] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Edit fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Verification lists state
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);

  // Placements States
  const [postedJobs, setPostedJobs] = useState([]);
  const [activeApplications, setActiveApplications] = useState([]);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobSalary, setNewJobSalary] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("");
  const [newJobType, setNewJobType] = useState("Full-time");
  const [newJobSkills, setNewJobSkills] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");

  const loadInstitutionData = async () => {
    if (!profile?.institutionId) return;

    try {
      // 1. Fetch school details
      const instRef = doc(db, "institutions", profile.institutionId);
      const instSnap = await getDoc(instRef);
      if (instSnap.exists()) {
        const data = instSnap.data();
        setInst({ id: instSnap.id, ...data });
        setName(data.name || "");
        setDescription(data.description || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setWebsite(data.website || "");
        setLogoUrl(data.logoUrl || "");
        setHeroUrl(data.heroUrl || "");
        setVideoUrl(data.videoUrl || "");
      }

      // 2. Fetch pending teachers affiliation requests
      const qTeachers = query(
        collection(db, "faculty_requests"), 
        where("institutionId", "==", profile.institutionId),
        where("status", "==", "pending")
      );
      const teacherSnap = await getDocs(qTeachers);
      const teacherList = [];
      teacherSnap.forEach(d => teacherList.push({ id: d.id, ...d.data() }));
      setPendingTeachers(teacherList);

      // 3. Fetch pending students enrollment requests
      const qStudents = query(
        collection(db, "enrollment_requests"),
        where("institutionId", "==", profile.institutionId),
        where("status", "==", "pending")
      );
      const studentSnap = await getDocs(qStudents);
      const studentList = [];
      studentSnap.forEach(d => studentList.push({ id: d.id, ...d.data() }));
      setPendingStudents(studentList);

      // 4. Fetch jobs and applications if Tier 2
      if (data.tier === "paid-tier-2") {
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
      console.error("Error loading school admin dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDescription) {
      alert("Please fill in title and description.");
      return;
    }
    setIsPostingJob(true);
    try {
      const jobId = `job-${Date.now()}`;
      const jobData = {
        id: jobId,
        employerId: profile.institutionId,
        employerName: inst.name,
        title: newJobTitle,
        salary: newJobSalary || "Negotiable",
        location: newJobLocation || inst.address || "Odisha",
        type: newJobType,
        skills: newJobSkills ? newJobSkills.split(",").map(s => s.trim()) : [],
        description: newJobDescription,
        createdAt: new Date().toISOString()
      };
      
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "jobs", jobId), jobData);
      
      alert("Campus job posted successfully!");
      setPostedJobs(prev => [...prev, jobData]);
      
      // Reset form
      setNewJobTitle("");
      setNewJobSalary("");
      setNewJobLocation("");
      setNewJobSkills("");
      setNewJobDescription("");
    } catch(err) {
      console.error(err);
      alert("Failed to post job.");
    } finally {
      setIsPostingJob(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status: newStatus
      });
      setActiveApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      alert(`Application marked as: ${newStatus.toUpperCase()}`);
    } catch(err) {
      console.error(err);
      alert("Error updating application status.");
    }
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

  useEffect(() => {
    loadInstitutionData();
  }, [profile]);

  // Update school details
  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    if (!profile?.institutionId) return;
    setUpdatingInst(true);
    try {
      const instRef = doc(db, "institutions", profile.institutionId);
      await updateDoc(instRef, {
        name,
        description,
        address,
        phone,
        website,
        logoUrl,
        heroUrl,
        videoUrl
      });
      setStatusMessage("School profile directory updated successfully!");
      setInst(prev => ({ ...prev, name, description, address, phone, website }));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update school details.");
    } finally {
      setUpdatingInst(false);
    }
  };

  // Approve teacher request
  const handleApproveTeacher = async (requestId, teacherUid, teacherName) => {
    try {
      // 1. Update teacher profile in collection 'users'
      const teacherRef = doc(db, "users", teacherUid);
      await updateDoc(teacherRef, {
        institutionId: profile.institutionId,
        institutionName: inst.name,
        isVerifiedFaculty: true
      });

      // 2. Update request status in 'faculty_requests'
      const reqRef = doc(db, "faculty_requests", requestId);
      await updateDoc(reqRef, {
        status: "approved"
      });

      alert(`Approved Prof. ${teacherName} as verified faculty!`);
      setPendingTeachers(pendingTeachers.filter(t => t.id !== requestId));
    } catch (err) {
      console.error(err);
      alert("Error approving faculty request.");
    }
  };

  // Reject teacher request
  const handleRejectTeacher = async (requestId) => {
    try {
      const reqRef = doc(db, "faculty_requests", requestId);
      await updateDoc(reqRef, { status: "rejected" });
      setPendingTeachers(pendingTeachers.filter(t => t.id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  // Approve student request
  const handleApproveStudent = async (requestId, studentUid, studentName) => {
    try {
      // 1. Fetch student doc to update their specific education milestone
      const studentRef = doc(db, "users", studentUid);
      const studentSnap = await getDoc(studentRef);
      
      if (studentSnap.exists()) {
        const studentData = studentSnap.data();
        const education = studentData.education || [];
        
        // Update isVerified to true for this school
        const updatedEdu = education.map(edu => {
          if (edu.id === profile.institutionId) {
            return { ...edu, isVerified: true };
          }
          return edu;
        });

        await updateDoc(studentRef, {
          education: updatedEdu,
          // Set active verified connection if current
          institutionId: profile.institutionId,
          institutionName: inst.name,
          isVerifiedEducation: true
        });
      }

      // 2. Update request status in 'enrollment_requests'
      const reqRef = doc(db, "enrollment_requests", requestId);
      await updateDoc(reqRef, { status: "approved" });

      alert(`Approved ${studentName} as a verified student!`);
      setPendingStudents(pendingStudents.filter(s => s.id !== requestId));
    } catch (err) {
      console.error(err);
      alert("Error verifying student.");
    }
  };

  // Reject student request
  const handleRejectStudent = async (requestId) => {
    try {
      const reqRef = doc(db, "enrollment_requests", requestId);
      await updateDoc(reqRef, { status: "rejected" });
      setPendingStudents(pendingStudents.filter(s => s.id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <Loader className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3>Loading School Cockpit...</h3>
          </div>
        </main>
        <Footer />
        <style jsx global>{`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "40px 0" }}>
        <div className="container">
          
          {/* Dashboard Title */}
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
              <Landmark size={28} />
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", color: "var(--text-primary)", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span>{inst?.name || "Institution Panel"}</span>
                <ShieldCheck size={24} style={{ color: "var(--success)" }} />
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>Verify student enrollments, authorize teacher profiles, and edit public listing records.</p>
              
              {/* Profile Completion Logic */}
              {inst && (
                <div style={{ marginTop: "16px", marginBottom: "8px", maxWidth: "400px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    <span>Profile Completion</span>
                    <span style={{ fontWeight: "bold" }}>
                      {Math.round(((
                        (inst.name ? 1 : 0) + 
                        (inst.description ? 1 : 0) + 
                        (inst.logoUrl ? 1 : 0) + 
                        (inst.heroUrl ? 1 : 0) + 
                        (inst.address ? 1 : 0)
                      ) / 5) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ 
                      height: "100%", 
                      background: "var(--success)", 
                      width: `${((
                        (inst.name ? 1 : 0) + 
                        (inst.description ? 1 : 0) + 
                        (inst.logoUrl ? 1 : 0) + 
                        (inst.heroUrl ? 1 : 0) + 
                        (inst.address ? 1 : 0)
                      ) / 5) * 100}%` 
                    }}></div>
                  </div>
                  {(!inst.logoUrl || !inst.heroUrl || !inst.description) && (
                    <div style={{ fontSize: "0.75rem", color: "var(--warning)", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={12} /> Complete your profile (Logo, Banner, Description) to improve your public ranking!
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "var(--bg-secondary)", borderRadius: "6px", border: "1px solid var(--border-secondary)", display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "600", color: "var(--text-muted)" }}>
                  Listing ID: <strong style={{ color: "var(--text-secondary)" }}>{inst?.id}</strong>
                </span>
                <span style={{ 
                  fontSize: "0.75rem", 
                  padding: "4px 10px", 
                  background: inst?.tier === "paid-tier-2" 
                    ? "rgba(16, 185, 129, 0.15)" 
                    : inst?.tier === "paid-tier-1" 
                      ? "rgba(79, 70, 229, 0.15)" 
                      : "rgba(245, 158, 11, 0.15)", 
                  color: inst?.tier === "paid-tier-2" 
                    ? "var(--success)" 
                    : inst?.tier === "paid-tier-1" 
                      ? "var(--primary)" 
                      : "var(--warning)", 
                  borderRadius: "100px", 
                  border: "1px solid", 
                  fontWeight: "700" 
                }}>
                  {inst?.tier === "paid-tier-2" 
                    ? "Placement Paid Tier 2 (Premium)" 
                    : inst?.tier === "paid-tier-1" 
                      ? "Premium Paid Tier 1 (Featured)" 
                      : "Free Directory Tier"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="dashboard-grid">
            
            {/* Column 1: Verification Lists */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Faculty Verification Request queue */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={20} style={{ color: "var(--accent)" }} />
                  Faculty Affiliation Requests
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Approve teachers requesting to link their profile to your school directory.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pendingTeachers.length > 0 ? (
                    pendingTeachers.map((teach) => (
                      <div key={teach.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="verify-card">
                        <div>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Prof. {teach.userName}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Subject: {teach.subject} | {teach.userEmail}</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleRejectTeacher(teach.id)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem", border: "1px solid var(--danger)", color: "var(--danger)" }}><X size={14} /></button>
                          <button onClick={() => handleApproveTeacher(teach.id, teach.userId, teach.userName)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "var(--success)" }}><Check size={14} style={{ marginRight: "4px" }} /> Approve</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>
                      No pending teacher affiliation requests.
                    </div>
                  )}
                </div>
              </div>

              {/* Student Enrollment verification queue */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={20} style={{ color: "var(--success)" }} />
                  Student Enrollment Approvals
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Approve students studying at your school to verify their study milestones.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pendingStudents.length > 0 ? (
                    pendingStudents.map((stud) => (
                      <div key={stud.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="verify-card">
                        <div>
                          <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{stud.studentName}</h4>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Course: {stud.degree} ({stud.startYear} - {stud.endYear})</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleRejectStudent(stud.id)} className="btn-secondary" style={{ padding: "6px 10px", fontSize: "0.8rem", border: "1px solid var(--danger)", color: "var(--danger)" }}><X size={14} /></button>
                          <button onClick={() => handleApproveStudent(stud.id, stud.studentId, stud.studentName)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", background: "var(--success)" }}><Check size={14} style={{ marginRight: "4px" }} /> Approve</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>
                      No pending student approvals.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Column 2: Edit Listing details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Profile Config */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Edit3 size={20} style={{ color: "var(--primary)" }} />
                  Edit Public Directory Details
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Update your public profile displayed to students, teachers, and employers on the ecosystem.
                </p>

                {statusMessage && (
                  <div style={{ padding: "12px", background: "var(--success-light)", color: "var(--success)", border: "1px solid var(--success)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                    {statusMessage}
                  </div>
                )}

                <form onSubmit={handleUpdateSchool} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>School / College Name *</label>
                    <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Full Location Address</label>
                    <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Contact Number</label>
                      <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Website URL</label>
                      <input type="url" className="form-input" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Editorial Summary / Description</label>
                    <textarea 
                      placeholder="Detail courses, study structures, campus size, and placement highlights..." 
                      className="form-input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{ height: "120px", resize: "none" }}
                    />
                  </div>

                  <div style={{ padding: "20px", background: "var(--bg-tertiary)", border: "1px dashed var(--border-secondary)", borderRadius: "10px", marginTop: "8px" }}>
                    <h4 style={{ fontSize: "1rem", marginBottom: "16px", color: "var(--text-primary)" }}>Media Gallery</h4>
                    
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                        Institution Logo (500x500px recommended)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border-primary)" }}>
                          {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>None</span>}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploadingLogo} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }} />
                        {uploadingLogo && <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>Uploading...</span>}
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "var(--warning)", marginTop: "6px" }}>* If image is not a square, it will be automatically center-cropped.</p>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                        Hero Banner Background (1920x600px recommended)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexDirection: "column", alignItems: "flex-start" }}>
                        <div style={{ width: "100%", height: "100px", borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--border-primary)" }}>
                          {heroUrl ? <img src={heroUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No Banner Uploaded</span>}
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} disabled={uploadingHero} style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }} />
                          {uploadingHero && <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>Uploading...</span>}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "var(--warning)", marginTop: "6px" }}>* Images will be stretched/cropped to fit wide displays.</p>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                        Public Campus Video Link (YouTube / Vimeo)
                      </label>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder="e.g. https://www.youtube.com/watch?v=..." 
                        value={videoUrl} 
                        onChange={(e) => setVideoUrl(e.target.value)} 
                      />
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>Direct video uploads are not supported to save bandwidth. Paste a public video link instead.</p>
                    </div>
                  </div>

                  <button type="submit" disabled={updatingInst} className="btn-primary" style={{ alignSelf: "flex-end", padding: "10px 24px", fontSize: "0.85rem", marginTop: "16px" }}>
                    {updatingInst ? "Updating..." : "Save Public Changes"}
                  </button>
                </form>
              </div>

            </div>

          </div>

          {/* Placements Deck Section */}
          <div style={{ marginTop: "40px" }}>
            {inst?.tier === "paid-tier-2" ? (
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={22} style={{ color: "var(--success)" }} />
                  Campus Placements Board & Job Posting Console
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "28px" }}>
                  Post job listings directly to your students and review incoming student applicant timelines.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="placements-deck-grid">
                  
                  {/* Left: Job Form */}
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                      Publish Job Vacancy
                    </h4>
                    <form onSubmit={handlePostJob} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Title *</label>
                        <input type="text" className="form-input" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="e.g. Graduate Engineer Trainee" required />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Salary Package</label>
                          <input type="text" className="form-input" value={newJobSalary} onChange={(e) => setNewJobSalary(e.target.value)} placeholder="e.g. ₹25,000 / month" />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Location</label>
                          <input type="text" className="form-input" value={newJobLocation} onChange={(e) => setNewJobLocation(e.target.value)} placeholder={address || "Odisha"} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Job Type</label>
                          <select className="form-input" value={newJobType} onChange={(e) => setNewJobType(e.target.value)} style={{ cursor: "pointer" }}>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Internship">Internship</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Required Skills (Comma separated)</label>
                          <input type="text" className="form-input" value={newJobSkills} onChange={(e) => setNewJobSkills(e.target.value)} placeholder="e.g. Java, SQL, React" />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Detailed Description *</label>
                        <textarea 
                          placeholder="Outline responsibilities, eligibility criteria, and requirements..." 
                          className="form-input"
                          value={newJobDescription}
                          onChange={(e) => setNewJobDescription(e.target.value)}
                          style={{ height: "100px", resize: "none" }}
                          required
                        />
                      </div>

                      <button type="submit" disabled={isPostingJob} className="btn-primary" style={{ padding: "10px 24px", alignSelf: "flex-end" }}>
                        {isPostingJob ? "Publishing..." : "Publish Job Listing"}
                      </button>
                    </form>
                  </div>

                  {/* Right: Job listings and applicants list */}
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "16px" }}>Active Positions ({postedJobs.length})</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {postedJobs.length > 0 ? (
                        postedJobs.map((job) => {
                          const jobApps = activeApplications.filter(a => a.jobId === job.id);
                          return (
                            <div key={job.id} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "20px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "10px" }}>
                                <div>
                                  <h5 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)" }}>{job.title}</h5>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{job.type} | {job.location} | {job.salary}</span>
                                </div>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Applicants ({jobApps.length})</label>
                                {jobApps.length > 0 ? (
                                  jobApps.map((app) => (
                                    <div key={app.id} style={{ padding: "10px 14px", background: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-primary)", display: "flex", flexDirection: "column", gap: "8px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                          <a 
                                            href={`/student/${app.studentId}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary)", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                          >
                                            {app.studentName} <ArrowRight size={12} />
                                          </a>
                                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>{app.studentEmail}</span>
                                        </div>
                                        <span style={{ 
                                          fontSize: "0.75rem", 
                                          padding: "3px 8px", 
                                          borderRadius: "100px", 
                                          fontWeight: "700",
                                          background: app.status === "hired" 
                                            ? "rgba(16, 185, 129, 0.15)" 
                                            : app.status === "rejected" 
                                              ? "rgba(239, 68, 68, 0.15)" 
                                              : app.status === "interview" 
                                                ? "rgba(79, 70, 229, 0.15)" 
                                                : "rgba(245, 158, 11, 0.15)",
                                          color: app.status === "hired" 
                                            ? "var(--success)" 
                                            : app.status === "rejected" 
                                              ? "var(--danger)" 
                                              : app.status === "interview" 
                                                ? "var(--primary)" 
                                                : "var(--warning)"
                                        }}>
                                          {app.status.toUpperCase()}
                                        </span>
                                      </div>

                                      {/* Application Status Actions */}
                                      <div style={{ display: "flex", gap: "6px", alignSelf: "flex-end" }}>
                                        {app.status === "applied" && (
                                          <button 
                                            onClick={() => handleUpdateApplicationStatus(app.id, "interview")} 
                                            className="btn-primary" 
                                            style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                          >
                                            Interview
                                          </button>
                                        )}
                                        {["applied", "interview"].includes(app.status) && (
                                          <>
                                            <button 
                                              onClick={() => handleUpdateApplicationStatus(app.id, "hired")} 
                                              className="btn-primary" 
                                              style={{ padding: "4px 8px", fontSize: "0.75rem", background: "var(--success)" }}
                                            >
                                              Hire
                                            </button>
                                            <button 
                                              onClick={() => handleUpdateApplicationStatus(app.id, "rejected")} 
                                              className="btn-secondary" 
                                              style={{ padding: "4px 8px", fontSize: "0.75rem", color: "var(--danger)", border: "1px solid var(--danger)" }}
                                            >
                                              Reject
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>No students have applied to this placement yet.</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", border: "1px dashed var(--border-secondary)", borderRadius: "10px" }}>
                          No active placement positions published.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "32px", border: "1px dashed var(--warning)", textAlign: "center" }}>
                <div style={{ display: "inline-flex", background: "rgba(245, 158, 11, 0.12)", color: "var(--warning)", padding: "12px", borderRadius: "50%", marginBottom: "16px" }}>
                  <Shield size={32} />
                </div>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", fontWeight: "800" }}>Unlock Campus Placement Drives</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "600px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
                  Upgrade your listing subscription to <strong style={{ color: "var(--warning)" }}>Placement Paid Tier 2</strong> to post campus job openings directly, collect student resume timelines, and review candidate portfolios.
                </p>
                <button 
                  onClick={() => alert("Please contact platform administration at admin@educonnect.in to upgrade your listing subscription.")} 
                  className="btn-primary" 
                  style={{ background: "linear-gradient(135deg, var(--warning) 0%, #d97706 100%)", boxShadow: "0 4px 14px 0 rgba(245, 158, 11, 0.25)", padding: "10px 24px" }}
                >
                  Upgrade to Placement Tier 2
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        @media (max-width: 768px) {
          .verify-card {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          .verify-card > div:last-child {
            width: 100%;
            justify-content: flex-end;
          }
        }
        @media (min-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1.2fr 1fr;
          }
          .placements-deck-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
