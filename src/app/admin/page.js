"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Shield, Lock, Landmark, Search, Play, RefreshCw, Check, X, ShieldAlert, Award, FileText, CheckCircle2, UserCheck } from "lucide-react";

// Mock Database of Claim Requests
const initialClaims = [
  {
    id: "claim-1",
    instId: "dav-cspur",
    instName: "DAV Public School, Chandrasekharpur",
    email: "principal@davcspur.org",
    phone: "+91 94371 98765",
    documentUrl: "#",
    status: "pending"
  },
  {
    id: "claim-2",
    instId: "government-iti-cuttack",
    instName: "Government Industrial Training Institute",
    email: "iti.cuttack@odishaskill.gov.in",
    phone: "+91 671 2345678",
    documentUrl: "#",
    status: "pending"
  }
];

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  
  // Scraper inputs state
  const [scrapingLocation, setScrapingLocation] = useState("bhubaneswar");
  const [scrapingCategory, setScrapingCategory] = useState("school");
  const [scraperLog, setScraperLog] = useState([]);
  const [isScraping, setIsScraping] = useState(false);

  // Claims state
  const [claims, setClaims] = useState(initialClaims);

  // Stats state
  const [scrapedCount, setScrapedCount] = useState(482);
  const [usersCount, setUsersCount] = useState(1280);

  // 1. Guard check - Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <div style={{ textAlign: "center" }}>
            <RefreshCw className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "1.2rem" }}>Loading Admin Profile...</h3>
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

  // 2. Guard check - Access Denied (if not logged in or role is not admin)
  if (!user || profile?.role !== "admin") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", textAlign: "center", border: "1px solid var(--danger)" }}>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "16px", borderRadius: "50%", display: "inline-flex", marginBottom: "20px" }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px", fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Access Denied</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "32px" }}>
              This page is restricted to platform administrators. Please log in with an administrator account to access the scraping engine and database verification cockpit.
            </p>
            <a href="/" className="btn-primary" style={{ width: "100%" }}>Return to Homepage</a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 3. Admin View
  const runPlacesScraper = () => {
    if (isScraping) return;
    setIsScraping(true);
    setScraperLog([]);

    const logs = [
      `[INFO] Starting Google Places Ingestion Engine...`,
      `[INFO] Target Location: ${scrapingLocation.toUpperCase()}, Odisha`,
      `[INFO] Target Category: ${scrapingCategory.toUpperCase()}`,
      `[API] Querying textsearch endpoints using Google Maps API...`,
      `[API] Found 14 matching places...`,
      `[DATABASE] Geocoding coordinates...`,
      `[DATABASE] Writing new entries to Firestore database...`,
      `[INFO] Successfully imported: Buxi Jagabandhu English Medium School, Bhubaneswar`,
      `[INFO] Successfully imported: Mothers Public School, Bhubaneswar`,
      `[INFO] Successfully imported: Sai International School, Bhubaneswar`,
      `[SUCCESS] Scraper execution completed. 3 new directories added, 11 duplicates skipped.`
    ];

    // Simulate logs output one by one
    logs.forEach((log, index) => {
      setTimeout(() => {
        setScraperLog(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsScraping(false);
          setScrapedCount(prev => prev + 3);
        }
      }, (index + 1) * 600);
    });
  };

  const handleApproveClaim = (claimId, instName) => {
    alert(`Claim Request Approved!\n${instName} is now marked as Claimed and Verified in the ecosystem database. The claiming administrator account has been granted ownership credentials.`);
    setClaims(claims.filter(claim => claim.id !== claimId));
  };

  const handleRejectClaim = (claimId, instName) => {
    alert(`Claim Request Rejected for ${instName}. The claiming administrator will be notified.`);
    setClaims(claims.filter(claim => claim.id !== claimId));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      
      <main style={{ flex: 1, padding: "60px 0" }}>
        <div className="container">
          
          {/* Header Dashboard Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "24px" }}>
            <div style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)", padding: "12px", borderRadius: "14px", color: "#fff", display: "flex", alignItems: "center" }}>
              <Shield size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "2.25rem", color: "var(--text-primary)", fontWeight: "800" }}>EduConnect Engine Cockpit</h1>
              <p style={{ color: "var(--text-secondary)" }}>Manage data ingestion pipeline, verify claims, and view platform metrics.</p>
            </div>
          </div>

          {/* Metric Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            
            {/* Stat 1 */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--primary)" }}>
                <Landmark size={24} />
                <span style={{ fontSize: "0.75rem", background: "var(--primary-light)", color: "var(--primary)", padding: "4px 8px", borderRadius: "6px", fontWeight: "700" }}>Firestore</span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{scrapedCount}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", fontWeight: "600" }}>Ingested Schools & Colleges</p>
            </div>

            {/* Stat 2 */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--accent)" }}>
                <FileText size={24} />
                <span style={{ fontSize: "0.75rem", background: "rgba(34, 211, 238, 0.1)", color: "var(--accent)", padding: "4px 8px", borderRadius: "6px", fontWeight: "700" }}>Active</span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{claims.length}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", fontWeight: "600" }}>Pending Listing Claims</p>
            </div>

            {/* Stat 3 */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--success)" }}>
                <UserCheck size={24} />
                <span style={{ fontSize: "0.75rem", background: "var(--success-light)", color: "var(--success)", padding: "4px 8px", borderRadius: "6px", fontWeight: "700" }}>Live</span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-primary)" }}>{usersCount}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", fontWeight: "600" }}>Registered Users (Students/Teachers)</p>
            </div>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="admin-grid">
            
            {/* Scraper Engine Console */}
            <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Landmark size={20} style={{ color: "var(--primary)" }} />
                  Google Places Data Scraper
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                  Scrape educational institution directories directly from Google Places API maps data and auto-populate the Firestore database collections.
                </p>

                {/* Scraper Filters */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Location</label>
                    <select 
                      value={scrapingLocation} 
                      onChange={(e) => setScrapingLocation(e.target.value)} 
                      className="form-input"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="bhubaneswar">Bhubaneswar</option>
                      <option value="cuttack">Cuttack</option>
                      <option value="rourkela">Rourkela</option>
                      <option value="sambalpur">Sambalpur</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Institution Category</label>
                    <select 
                      value={scrapingCategory} 
                      onChange={(e) => setScrapingCategory(e.target.value)} 
                      className="form-input"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="school">Schools</option>
                      <option value="university">Universities</option>
                      <option value="coaching">Coaching Classes</option>
                    </select>
                  </div>
                </div>

                {/* Scraper Action Button */}
                <button 
                  onClick={runPlacesScraper}
                  disabled={isScraping}
                  className="btn-primary" 
                  style={{ gap: "8px", width: "100%", padding: "14px", marginBottom: "24px" }}
                >
                  {isScraping ? <RefreshCw className="spinner" size={18} /> : <Play size={18} />}
                  {isScraping ? "Scraping & Syncing Database..." : "Execute Scraping Pipeline"}
                </button>

                {/* Logs Terminal */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Engine Output Terminal</label>
                  <div style={{ 
                    background: "#090d16", 
                    border: "1px solid var(--border-primary)", 
                    borderRadius: "10px", 
                    padding: "16px", 
                    height: "180px", 
                    overflowY: "auto", 
                    fontFamily: "Courier, monospace", 
                    fontSize: "0.8rem",
                    color: "#34d399",
                    lineHeight: "1.6"
                  }}>
                    {scraperLog.length > 0 ? (
                      scraperLog.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text-muted)" }}>[IDLE] Awaiting scraping pipeline execution trigger...</div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Claims Verification Registry */}
            <div className="glass-card" style={{ padding: "32px" }}>
              <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} style={{ color: "var(--accent)" }} />
                Pending Verification Requests
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                Approve or reject claim listing requests submitted by educational institutions after validating email records.
              </p>

              {claims.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {claims.map((claim) => (
                    <div 
                      key={claim.id} 
                      style={{ 
                        background: "var(--bg-tertiary)", 
                        border: "1px solid var(--border-primary)", 
                        borderRadius: "12px", 
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "16px"
                      }}
                      className="claim-card-inner"
                    >
                      <div>
                        <h4 style={{ fontSize: "1.05rem", fontWeight: "700", marginBottom: "6px" }}>{claim.instName}</h4>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                          <span>📧 Email: <strong>{claim.email}</strong></span>
                          <span>📞 Phone: <strong>{claim.phone}</strong></span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button 
                          onClick={() => handleRejectClaim(claim.id, claim.instName)} 
                          className="btn-secondary" 
                          style={{ padding: "8px 12px", fontSize: "0.8rem", border: "1px solid var(--danger)", color: "var(--danger)", gap: "4px" }}
                        >
                          <X size={14} /> Reject
                        </button>
                        <button 
                          onClick={() => handleApproveClaim(claim.id, claim.instName)} 
                          className="btn-primary" 
                          style={{ padding: "8px 12px", fontSize: "0.8rem", background: "var(--success)", boxShadow: "none", gap: "4px" }}
                        >
                          <Check size={14} /> Approve & Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  padding: "40px", 
                  border: "1px dashed var(--border-secondary)", 
                  borderRadius: "12px",
                  color: "var(--text-muted)" 
                }}>
                  <CheckCircle2 size={32} style={{ color: "var(--success)", marginBottom: "8px" }} />
                  <p style={{ fontSize: "0.9rem" }}>All verification queue items cleared. No pending claims!</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />


    </div>
  );
}
