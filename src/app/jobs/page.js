"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Search, MapPin, Briefcase, Building2, Clock, Filter, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function JobsBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef, orderBy("postedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const jobsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = filterType === "All" || job.type?.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesType;
  });

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

  return (
    <>
      <Header />
      
      {/* Hero Search Section */}
      <section style={{ 
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", 
        padding: "60px 20px", 
        textAlign: "center",
        color: "white"
      }}>
        <div className="container">
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px" }}>
            Find Your Dream Career
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: "40px", maxWidth: "600px", margin: "0 auto 40px" }}>
            Explore thousands of job opportunities in education, technology, healthcare, and more.
          </p>
          
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap",
            gap: "12px", 
            background: "white", 
            padding: "8px", 
            borderRadius: "12px",
            maxWidth: "800px",
            margin: "0 auto",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ flex: "1 1 300px", display: "flex", alignItems: "center", padding: "0 16px", background: "#f8fafc", borderRadius: "8px" }}>
              <Search size={20} color="#64748b" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or company..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "16px 12px", border: "none", background: "transparent", outline: "none", color: "#0f172a" }}
              />
            </div>
            
            <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", padding: "0 16px", background: "#f8fafc", borderRadius: "8px" }}>
              <MapPin size={20} color="#64748b" />
              <input 
                type="text" 
                placeholder="Location..." 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                style={{ width: "100%", padding: "16px 12px", border: "none", background: "transparent", outline: "none", color: "#0f172a" }}
              />
            </div>
            
            <button className="btn-primary" style={{ padding: "0 32px", height: "52px" }}>
              Search Jobs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main style={{ padding: "40px 20px", background: "#f8fafc", minHeight: "60vh" }}>
        <div className="container" style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* Left Sidebar Filters */}
          <aside style={{ flex: "1 1 250px", maxWidth: "300px", background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} /> Filters
            </h3>
            
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Job Type</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["All", "Full-time", "Part-time", "Contract", "Internship"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", color: "#334155" }}>
                    <input 
                      type="radio" 
                      name="jobType" 
                      checked={filterType === type}
                      onChange={() => setFilterType(type)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Job Listings Feed */}
          <div style={{ flex: "3 1 600px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"} Found
              </h2>
            </div>
            
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: "160px", borderRadius: "16px", width: "100%" }}></div>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.id} style={{ 
                  background: "white", 
                  borderRadius: "16px", 
                  padding: "24px", 
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.companyName} style={{ width: "56px", height: "56px", borderRadius: "12px", objectFit: "contain", background: "#f8fafc", padding: "4px" }} />
                      ) : (
                        <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "rgba(79, 70, 229, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={24} color="var(--primary)" />
                        </div>
                      )}
                      
                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
                          <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                            {job.title}
                          </Link>
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.9rem", color: "#64748b", flexWrap: "wrap" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={14} /> {job.companyName}</span>
                          <span>•</span>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MapPin size={14} /> {job.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {job.salaryRange && job.salaryRange !== "Not Disclosed" && (
                      <span className="pill-badge" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                        💰 {job.salaryRange}
                      </span>
                    )}
                    <span className="pill-badge" style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                      <Briefcase size={12} /> {job.type}
                    </span>
                    <span className="pill-badge" style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>
                      <Clock size={12} /> {timeAgo(job.postedAt)}
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "4px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                      {job.source === "SerpApi" ? "Verified via Google Jobs" : "Posted on EduConnect"}
                    </div>
                    <Link href={`/jobs/${job.id}`} style={{ textDecoration: "none" }}>
                      <button className="btn-primary" style={{ padding: "8px 24px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        View Job <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1px solid #e2e8f0" }}>
                <Briefcase size={48} color="#cbd5e1" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "1.25rem", color: "#334155", marginBottom: "8px" }}>No jobs found</h3>
                <p style={{ color: "#64748b" }}>Try adjusting your search keywords or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
      
      <Footer />
    </>
  );
}
