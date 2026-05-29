"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import InstitutionCard from "../components/InstitutionCard";
import Footer from "../components/Footer";
import { Landmark, Sparkles, Briefcase, RefreshCw } from "lucide-react";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import ShareButtons from "../components/ShareButtons";

// Mock database for placement opportunities
const mockJobs = [
  {
    id: "job-1",
    title: "Software Engineer Intern",
    company: "TechOdisha Solutions",
    location: "Bhubaneswar",
    salary: "₹15,000 - ₹20,000 / month",
    type: "Internship",
    skills: ["React", "JavaScript", "CSS"],
    logo: "💻"
  },
  {
    id: "job-2",
    title: "PGT Physics Teacher",
    company: "DAV Group Cuttack",
    location: "Cuttack",
    salary: "₹40,000 - ₹50,000 / month",
    type: "Full-time",
    skills: ["Teaching", "Physics CBSE", "Communication"],
    logo: "📚"
  },
  {
    id: "job-3",
    title: "Graduate Engineer Trainee",
    company: "Tata Steel India",
    location: "Rourkela / Jajpur",
    salary: "₹6.5 LPA",
    type: "Full-time",
    skills: ["Metallurgy", "AutoCAD", "Site Inspection"],
    logo: "🏭"
  }
];

export default function Home() {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load institutions from Firestore educonnect database
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "institutions"));
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        // Sort by rating (highest first)
        data.sort((a, b) => b.rating - a.rating);
        setInstitutions(data);
        setFilteredInstitutions(data);
      } catch (e) {
        console.error("Error loading institutions from Firestore:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  // Handle Referral Click Ingestion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref");
    if (ref) {
      const logReferral = async () => {
        try {
          const refDocRef = doc(collection(db, "referrals"));
          await setDoc(refDocRef, {
            referrerId: ref,
            timestamp: new Date().toISOString(),
            type: "click",
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"
          });
          console.log("Logged referral click for:", ref);
        } catch (e) {
          console.error("Error logging referral click:", e);
        }
      };
      logReferral();
    }
  }, []);

  // Search and filter logic
  const handleSearch = ({ query, location, category }) => {
    const results = institutions.filter((inst) => {
      const matchesQuery = query 
        ? inst.name.toLowerCase().includes(query.toLowerCase()) || 
          (inst.description && inst.description.toLowerCase().includes(query.toLowerCase()))
        : true;
      
      const matchesLocation = location ? inst.location === location : true;
      const matchesCategory = category ? inst.type === category : true;
      
      return matchesQuery && matchesLocation && matchesCategory;
    });
    setFilteredInstitutions(results);
  };

  // Live Claim listing handler (saves state to Firestore!)
  const handleClaim = async (id) => {
    alert(`Claim Request Sent!\nTo claim this institution profile, you will be redirected to verify your official institutional email (e.g. admin@school.edu.in) or submit verification documents.`);
    
    try {
      const docRef = doc(db, "institutions", id);
      await updateDoc(docRef, {
        isClaimed: true,
        isVerified: true
      });
      
      // Update local state to show verified
      const updated = institutions.map((inst) => {
        if (inst.id === id) {
          return { ...inst, isClaimed: true, isVerified: true };
        }
        return inst;
      });
      setInstitutions(updated);
      setFilteredInstitutions(filteredInstitutions.map(inst => inst.id === id ? { ...inst, isClaimed: true, isVerified: true } : inst));
    } catch (e) {
      console.error("Error saving claim to database:", e);
    }
  };

  return (
    <>
      <Header />
      
      <main style={{ paddingBottom: "40px" }}>
        {/* Hero Section */}
        <Hero />
        
        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Share Buttons */}
        <div className="container" style={{ marginTop: "-10px", marginBottom: "20px" }}>
          <ShareButtons />
        </div>

        {/* Directory Listing Section */}
        <section style={{ padding: "40px 0" }} id="institutions">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Explore Educational Institutions</h2>
                <p style={{ color: "var(--text-secondary)" }}>Find and compare verified schools, coaching classes, and universities.</p>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "6px 12px", borderRadius: "8px" }}>
                {loading ? "Loading..." : `Found ${filteredInstitutions.length} listings`}
              </span>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                <RefreshCw className="spinner" size={36} style={{ color: "var(--primary)" }} />
              </div>
            ) : filteredInstitutions.length > 0 ? (
              <div className="grid-3">
                {filteredInstitutions.map((inst) => (
                  <InstitutionCard 
                    key={inst.id} 
                    institution={inst} 
                    onClaim={handleClaim} 
                  />
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "80px 24px", 
                background: "var(--card-bg)", 
                border: "1px dashed var(--border-secondary)", 
                borderRadius: "var(--radius-lg)" 
              }}>
                <Landmark size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>No listings found</h3>
                <p style={{ color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto 24px auto" }}>
                  We couldn't find any institutions matching your search terms. Try adjusting your location or category filters.
                </p>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setFilteredInstitutions(institutions);
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Dashboards Promotion Panel (Student & Teacher Hub) */}
        <section style={{ padding: "60px 0", background: "linear-gradient(180deg, transparent 0%, var(--bg-secondary) 100%)" }} id="students">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px", alignItems: "center" }} className="promo-grid">
              
              {/* Left Column: Student Promo */}
              <div className="glass-card" style={{ padding: "40px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary)", padding: "12px", borderRadius: "12px", display: "inline-block", marginBottom: "20px" }}>
                    <Sparkles size={28} />
                  </div>
                  <h3 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>For Students & Graduates</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                    Create your dynamic verified profile, link your school and academic history, track your career achievements, and apply for verified placements directly from local employers.
                  </p>
                  <ul style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "2.2", marginBottom: "32px", paddingLeft: "20px" }}>
                    <li>✓ Shareable public profile link (e.g. `educonnect.in/student/shyam`)</li>
                    <li>✓ Verified course completion and study records</li>
                    <li>✓ Direct applications to verified campus placement listings</li>
                  </ul>
                </div>
                <button className="btn-primary" style={{ width: "100%" }}>Create Student Profile</button>
              </div>

              {/* Right Column: Employer & Careers */}
              <div className="glass-card" style={{ padding: "40px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }} id="jobs">
                <div>
                  <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)", padding: "12px", borderRadius: "12px", display: "inline-block", marginBottom: "20px" }}>
                    <Briefcase size={28} />
                  </div>
                  <h3 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>Job & Placement Board</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "24px" }}>
                    Connecting local institutes directly with top companies. Post vacancies, filter verified student directories, and manage your placement logs easily.
                  </p>
                  
                  {/* Job List Preview */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                    {mockJobs.map((job) => (
                      <div key={job.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                        <div style={{ fontSize: "1.5rem" }}>{job.logo}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: "0.9rem", fontWeight: "700" }}>{job.title}</h4>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{job.company} • {job.location}</p>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700" }}>{job.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" style={{ width: "100%", background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.25)" }}>
                  Explore Job Openings
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />


    </>
  );
}
