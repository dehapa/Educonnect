"use client";

import { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import InstitutionCard from "../components/InstitutionCard";
import Footer from "../components/Footer";
import { GraduationCap, Briefcase, Users, MapPin, Sparkles, Building, Landmark, CheckCircle } from "lucide-react";

// Mock database for educational institutions in Odisha
const initialInstitutions = [
  {
    id: "kiit-university",
    name: "Kalinga Institute of Industrial Technology (KIIT)",
    type: "university",
    location: "bhubaneswar",
    rating: 4.8,
    isVerified: true,
    isClaimed: true,
    coursesCount: 48,
    studentsCount: 25000,
    description: "A world-class university offering engineering, medical, management, and law courses with high placement rates.",
    logo: "🎓"
  },
  {
    id: "dav-cspur",
    name: "DAV Public School, Chandrasekharpur",
    type: "high-school",
    location: "bhubaneswar",
    rating: 4.6,
    isVerified: true,
    isClaimed: false,
    coursesCount: 6,
    studentsCount: 3500,
    description: "One of the premier schools in India known for academic excellence and outstanding records in board examinations.",
    logo: "🏫"
  },
  {
    id: "vssut-burla",
    name: "Veer Surendra Sai University of Technology",
    type: "university",
    location: "sambalpur",
    rating: 4.7,
    isVerified: true,
    isClaimed: true,
    coursesCount: 24,
    studentsCount: 5000,
    description: "A prestigious government engineering college offering undergraduate, postgraduate, and doctoral degrees.",
    logo: "🏛️"
  },
  {
    id: "dps-rourkela",
    name: "Delhi Public School Rourkela",
    type: "high-school",
    location: "rourkela",
    rating: 4.5,
    isVerified: true,
    isClaimed: false,
    coursesCount: 4,
    studentsCount: 2200,
    description: "Providing quality secondary education with focus on holistic development, sports, and technical science clubs.",
    logo: "🎒"
  },
  {
    id: "aakash-bbsr",
    name: "Aakash Institute, Bhubaneswar",
    type: "coaching",
    location: "bhubaneswar",
    rating: 4.3,
    isVerified: false,
    isClaimed: false,
    coursesCount: 8,
    studentsCount: 1500,
    description: "Leading national coaching institute preparing students for competitive exams like JEE Main, JEE Advanced, and NEET.",
    logo: "✏️"
  },
  {
    id: "government-iti-cuttack",
    name: "Government Industrial Training Institute",
    type: "technical",
    location: "cuttack",
    rating: 4.4,
    isVerified: true,
    isClaimed: false,
    coursesCount: 12,
    studentsCount: 1200,
    description: "Odisha's premier vocational and technical school offering skill development, electrical, and mechanical trades.",
    logo: "🔧"
  }
];

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
  const [institutions, setInstitutions] = useState(initialInstitutions);
  const [filteredInstitutions, setFilteredInstitutions] = useState(initialInstitutions);
  
  // Search and filter logic
  const handleSearch = ({ query, location, category }) => {
    const results = institutions.filter((inst) => {
      const matchesQuery = query 
        ? inst.name.toLowerCase().includes(query.toLowerCase()) || 
          inst.description.toLowerCase().includes(query.toLowerCase())
        : true;
      
      const matchesLocation = location ? inst.location === location : true;
      const matchesCategory = category ? inst.type === category : true;
      
      return matchesQuery && matchesLocation && matchesCategory;
    });
    setFilteredInstitutions(results);
  };

  // Claim listing handler
  const handleClaim = (id) => {
    // Show alert prompting for action
    alert(`Claim Request Sent!\nTo claim this institution profile, you will be redirected to verify your official institutional email (e.g. admin@school.edu.in) or submit verification documents.`);
    
    // Update local state to show claimed status
    const updated = institutions.map((inst) => {
      if (inst.id === id) {
        return { ...inst, isClaimed: true, isVerified: true };
      }
      return inst;
    });
    setInstitutions(updated);
    
    // Re-apply current search filter
    const activeFilters = document.querySelector('form');
    if (activeFilters) {
      const data = new FormData(activeFilters);
      // Fallback update
      setFilteredInstitutions(updated);
    } else {
      setFilteredInstitutions(updated);
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

        {/* Directory Listing Section */}
        <section style={{ padding: "40px 0" }} id="institutions">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Explore Educational Institutions</h2>
                <p style={{ color: "var(--text-secondary)" }}>Find and compare verified schools, coaching classes, and universities.</p>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-muted)", background: "var(--bg-tertiary)", padding: "6px 12px", borderRadius: "8px" }}>
                Found {filteredInstitutions.length} listings
              </span>
            </div>

            {filteredInstitutions.length > 0 ? (
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

      <style jsx global>{`
        .promo-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .promo-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </>
  );
}
