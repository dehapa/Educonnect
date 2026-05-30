"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { ArrowLeft, Building2, MapPin, Briefcase, Clock, IndianRupee, ExternalLink, Share2, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function JobDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("No such job!");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  const timeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: "40px 20px", background: "#f8fafc", minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid #cbd5e1", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </main>
        <Footer />
      </>
    );
  }

  if (!job) {
    return (
      <>
        <Header />
        <main style={{ padding: "80px 20px", background: "#f8fafc", minHeight: "60vh", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "600px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "16px" }}>Job Not Found</h1>
            <p style={{ color: "#64748b", marginBottom: "32px" }}>The job you are looking for does not exist or has been removed.</p>
            <button onClick={() => router.push('/jobs')} className="btn-primary" style={{ padding: "12px 24px" }}>
              Browse All Jobs
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
      
      {/* Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", padding: "30px 20px" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <Link href="/jobs" style={{ color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", marginBottom: "20px", fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> Back to Jobs
          </Link>
        </div>
      </div>

      <main style={{ padding: "0 20px 60px", background: "#f8fafc", minHeight: "70vh", marginTop: "-40px" }}>
        <div className="container" style={{ maxWidth: "1000px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
          
          {/* Main Job Details */}
          <div style={{ flex: "3 1 600px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Header Card */}
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap" }}>
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} style={{ width: "80px", height: "80px", borderRadius: "16px", objectFit: "contain", background: "#f8fafc", padding: "8px", border: "1px solid #e2e8f0" }} />
                ) : (
                  <div style={{ width: "80px", height: "80px", borderRadius: "16px", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(79, 70, 229, 0.2)" }}>
                    <Building2 size={32} color="var(--primary)" />
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px", lineHeight: 1.2 }}>{job.title}</h1>
                  <h2 style={{ fontSize: "1.1rem", color: "var(--primary)", fontWeight: "600", marginBottom: "16px" }}>{job.companyName}</h2>
                  
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "#475569", fontSize: "0.95rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><MapPin size={16} /> {job.location}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Briefcase size={16} /> {job.type || "Full-time"}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Clock size={16} /> {timeAgo(job.postedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "24px", flexWrap: "wrap" }}>
                {job.applyLink ? (
                  <a href={job.applyLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <button className="btn-primary" style={{ padding: "12px 32px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", borderRadius: "8px" }}>
                      Apply Now <ExternalLink size={18} />
                    </button>
                  </a>
                ) : (
                  <button className="btn-primary" style={{ padding: "12px 32px", fontSize: "1rem", borderRadius: "8px" }}>
                    Apply on EduConnect
                  </button>
                )}
                
                <button className="btn-secondary" style={{ padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", width: "48px" }}>
                  <Bookmark size={20} color="#64748b" />
                </button>
                <button className="btn-secondary" style={{ padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", width: "48px" }}>
                  <Share2 size={20} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Description Card */}
            <div style={{ background: "white", borderRadius: "16px", padding: "32px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "20px", color: "#0f172a", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>Job Description</h3>
              
              <div 
                className="job-description-content"
                style={{ 
                  color: "#334155", 
                  lineHeight: 1.7, 
                  fontSize: "1rem",
                  whiteSpace: "pre-wrap"
                }}
              >
                {job.description}
              </div>
            </div>
            
          </div>
          
          {/* Right Sidebar */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Job Overview Card */}
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", color: "#0f172a" }}>Job Overview</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", marginTop: "2px" }}><IndianRupee size={20} /></div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2px" }}>Salary</div>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{job.salaryRange || "Not Disclosed"}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", marginTop: "2px" }}><MapPin size={20} /></div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2px" }}>Location</div>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{job.location}</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ color: "var(--primary)", marginTop: "2px" }}><Briefcase size={20} /></div>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2px" }}>Job Type</div>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{job.type || "Full-time"}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Verification Card */}
            <div style={{ background: "linear-gradient(to bottom, #f0fdf4, #ffffff)", borderRadius: "16px", padding: "24px", border: "1px solid #bbf7d0" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontWeight: "700", color: "#166534", marginBottom: "8px", fontSize: "1rem" }}>Verified Listing</h4>
                  <p style={{ fontSize: "0.85rem", color: "#15803d", lineHeight: 1.5, margin: 0 }}>
                    {job.source === "SerpApi" 
                      ? "This job was aggregated from verified Google Jobs listings to ensure authenticity." 
                      : "This employer has been verified by the EduConnect platform."}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </main>
      
      <Footer />
    </>
  );
}
