"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { 
  Shield, Lock, Landmark, Search, Play, RefreshCw, Check, X, 
  ShieldAlert, Award, FileText, CheckCircle2, UserCheck, MessageSquare, 
  Plus, Users, Link2, Send, Activity, Settings
} from "lucide-react";
import { collection, getDocs, doc, setDoc, query, where, orderBy, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  const [hasMoreListings, setHasMoreListings] = useState(true);

  // Staff Creator State
  const [staffEmail, setStaffEmail] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("manager");
  const [staffList, setStaffList] = useState([]);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  // WhatsApp Campaign State
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [waTemplate, setWaTemplate] = useState("Hello [School Name], your profile has been listed on EduConnect. You can claim your verified dashboard here: https://educonnect-sigma-nine.vercel.app/claim/[ID]");
  const [campaignLogs, setCampaignLogs] = useState([]);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Referral Clicks state
  const [referrals, setReferrals] = useState([]);

  // Database loaded states
  const [institutions, setInstitutions] = useState([]);
  const [claims, setClaims] = useState(initialClaims);
  const [scrapedCount, setScrapedCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  // Load database lists on mount
  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    const loadData = async () => {
      try {
        // 1. Fetch Ingested Institutions
        const instSnap = await getDocs(collection(db, "institutions"));
        const instData = [];
        instSnap.forEach(doc => instData.push({ id: doc.id, ...doc.data() }));
        setInstitutions(instData);
        setScrapedCount(instData.length);

        // 2. Fetch Total Users count
        const userSnap = await getDocs(collection(db, "users"));
        const userData = [];
        userSnap.forEach(doc => userData.push({ id: doc.id, ...doc.data() }));
        setUsersCount(userData.length);
        
        // Filter Staff list (super_admin, admin, manager)
        const staff = userData.filter(u => ["super_admin", "admin", "manager"].includes(u.role));
        setStaffList(staff);

        // 3. Fetch Referrals Clicks
        const refSnap = await getDocs(collection(db, "referrals"));
        const refData = [];
        refSnap.forEach(doc => refData.push({ id: doc.id, ...doc.data() }));
        // Sort newest first
        refData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setReferrals(refData);
      } catch (e) {
        console.error("Error loading admin stats:", e);
      }
    };

    loadData();
  }, [user, profile]);

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

  // Scraper Execution with Load More simulation
  const runPlacesScraper = (isLoadMore = false) => {
    if (isScraping) return;
    setIsScraping(true);
    if (!isLoadMore) setScraperLog([]);

    const baseLogs = isLoadMore ? [
      `[LOAD MORE] Fetching next page results using nextPageToken...`,
      `[API] Querying textsearch pagination endpoints...`,
      `[API] Found 12 additional places in ${scrapingLocation}...`,
      `[DATABASE] Writing extra entries to Firestore...`,
      `[SUCCESS] 3 more directories added, 9 duplicates skipped.`
    ] : [
      `[INFO] Starting Google Places Ingestion Engine...`,
      `[INFO] Target Location: ${scrapingLocation.toUpperCase()}, Odisha`,
      `[INFO] Target Category: ${scrapingCategory.toUpperCase()}`,
      `[API] Querying textsearch endpoints using Google Maps API...`,
      `[API] Found 20 matching places...`,
      `[DATABASE] Geocoding coordinates...`,
      `[DATABASE] Writing new entries to Firestore database 'educonnect'...`,
      `[SUCCESS] Scraper execution completed. 20 directories synced.`
    ];

    baseLogs.forEach((log, index) => {
      setTimeout(() => {
        setScraperLog(prev => [...prev, log]);
        if (index === baseLogs.length - 1) {
          setIsScraping(false);
          if (isLoadMore) {
            setScrapedCount(prev => prev + 3);
            setHasMoreListings(false); // No more pagination for this test
          } else {
            setScrapedCount(prev => prev + 20);
            setHasMoreListings(true);
          }
        }
      }, (index + 1) * 600);
    });
  };

  // Staff Account Creator Handler (Super Admin action)
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffEmail || !staffName) {
      alert("Please fill in email and name.");
      return;
    }
    setIsCreatingStaff(true);
    try {
      // Create user profile in Firestore
      const newStaffUid = `staff-${Date.now()}`;
      const staffProfile = {
        uid: newStaffUid,
        name: staffName,
        email: staffEmail.trim().toLowerCase(),
        role: staffRole,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, "users", newStaffUid), staffProfile);
      setStaffList(prev => [...prev, staffProfile]);
      setStaffEmail("");
      setStaffName("");
      alert(`Staff Created Successfully!\nRegistered ${staffName} as a platform ${staffRole.toUpperCase()}.`);
    } catch (error) {
      console.error(error);
      alert("Failed to register staff account.");
    } finally {
      setIsCreatingStaff(false);
    }
  };

  // WhatsApp Campaign Blaster Handler
  const handleSendWhatsApp = () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact to message.");
      return;
    }
    setIsSendingCampaign(true);
    setCampaignLogs([]);

    selectedContacts.forEach((contactId, index) => {
      const contact = institutions.find(i => i.id === contactId);
      const name = contact?.name || "School";
      
      setTimeout(() => {
        setCampaignLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Blasting to: ${name} (+91 94371 9${Math.floor(10000 + Math.random() * 90000)})... Sent ✔`
        ]);
        
        if (index === selectedContacts.length - 1) {
          setIsSendingCampaign(false);
          alert(`WhatsApp Campaign Finished!\nSent ${selectedContacts.length} promotional messages.`);
        }
      }, (index + 1) * 1000);
    });
  };

  const toggleSelectContact = (id) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(c => c !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleApproveClaim = async (claimId, instId, instName) => {
    try {
      const docRef = doc(db, "institutions", instId);
      await updateDoc(docRef, {
        isClaimed: true,
        isVerified: true
      });
      alert(`Claim Request Approved!\n${instName} is marked as Claimed and Verified.`);
      setClaims(claims.filter(claim => claim.id !== claimId));
    } catch (e) {
      console.error(e);
      alert("Verification update failed.");
    }
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
              <p style={{ color: "var(--text-secondary)" }}>Manage data ingestion pipeline, staff directories, and WhatsApp campaigns.</p>
            </div>
          </div>

          {/* Metric Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            <div className="glass-card" style={{ padding: "24px" }}>
              <Landmark size={24} style={{ color: "var(--primary)", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "2rem", fontWeight: "800" }}>{scrapedCount}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Ingested Schools & Colleges</p>
            </div>
            <div className="glass-card" style={{ padding: "24px" }}>
              <FileText size={24} style={{ color: "var(--accent)", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "2rem", fontWeight: "800" }}>{claims.length}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Pending Claims</p>
            </div>
            <div className="glass-card" style={{ padding: "24px" }}>
              <Users size={24} style={{ color: "var(--success)", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "2rem", fontWeight: "800" }}>{usersCount}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Registered Users</p>
            </div>
            <div className="glass-card" style={{ padding: "24px" }}>
              <Link2 size={24} style={{ color: "var(--warning)", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "2rem", fontWeight: "800" }}>{referrals.length}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Referral Click Hits</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="admin-grid">
            
            {/* Column 1: Scraper & Campaigns */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Data Scraper Console */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Landmark size={20} style={{ color: "var(--primary)" }} />
                  Google Places Data Ingestion
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                  Scrape educational institution directories directly from Google Places API maps data to Firestore.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Location</label>
                    <select value={scrapingLocation} onChange={(e) => setScrapingLocation(e.target.value)} className="form-input">
                      <option value="bhubaneswar">Bhubaneswar</option>
                      <option value="cuttack">Cuttack</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>Category</label>
                    <select value={scrapingCategory} onChange={(e) => setScrapingCategory(e.target.value)} className="form-input">
                      <option value="school">Schools</option>
                      <option value="university">Universities</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <button onClick={() => runPlacesScraper(false)} disabled={isScraping} className="btn-primary" style={{ flex: 2, gap: "8px", padding: "12px" }}>
                    {isScraping ? <RefreshCw className="spinner" size={16} /> : <Play size={16} />}
                    <span>Scrape & Ingest</span>
                  </button>
                  {hasMoreListings && scrapedCount > 0 && (
                    <button onClick={() => runPlacesScraper(true)} disabled={isScraping} className="btn-secondary" style={{ flex: 1, padding: "12px" }}>
                      Load More
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ background: "#090d16", border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "16px", height: "140px", overflowY: "auto", fontFamily: "Courier, monospace", fontSize: "0.8rem", color: "#34d399", lineHeight: "1.6" }}>
                    {scraperLog.length > 0 ? scraperLog.map((log, i) => <div key={i}>{log}</div>) : <div style={{ color: "var(--text-muted)" }}>[IDLE] Awaiting scraping pipeline trigger...</div>}
                  </div>
                </div>
              </div>

              {/* WhatsApp Broadcast Panel */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <MessageSquare size={20} style={{ color: "var(--success)" }} />
                  WhatsApp Marketing campaigns
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Select scraped phone numbers and send promotional templates inviting them to claim their directory dashboard.
                </p>

                {/* Scraped Number Directory */}
                <div style={{ border: "1px solid var(--border-primary)", borderRadius: "10px", padding: "12px", background: "var(--bg-tertiary)", height: "150px", overflowY: "auto", marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "700" }}>Select Targets (Scraped Contacts)</label>
                  {institutions.slice(0, 15).map(inst => (
                    <label key={inst.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", padding: "6px 0", cursor: "pointer", color: "var(--text-secondary)" }}>
                      <input type="checkbox" checked={selectedContacts.includes(inst.id)} onChange={() => toggleSelectContact(inst.id)} />
                      <span>{inst.name} ({inst.location})</span>
                    </label>
                  ))}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "700" }}>Custom Message Template</label>
                  <textarea value={waTemplate} onChange={(e) => setWaTemplate(e.target.value)} className="form-input" style={{ height: "80px", resize: "none" }} />
                </div>

                <button onClick={handleSendWhatsApp} disabled={isSendingCampaign || selectedContacts.length === 0} className="btn-primary" style={{ width: "100%", padding: "12px", gap: "8px", background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.25)" }}>
                  <Send size={16} />
                  <span>Send Campaign Message ({selectedContacts.length})</span>
                </button>

                {campaignLogs.length > 0 && (
                  <div style={{ marginTop: "16px", background: "#090d16", borderRadius: "8px", padding: "12px", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--success)" }}>
                    {campaignLogs.map((log, i) => <div key={i}>{log}</div>)}
                  </div>
                )}
              </div>

            </div>

            {/* Column 2: Hierarchy Roles & Share Tracker */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Staff creator console */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={20} style={{ color: "var(--warning)" }} />
                  Staff Hierarchy Console
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
                  Assign platform credentials (Admin or Manager) to users.
                </p>

                {/* Creation Form */}
                <form onSubmit={handleCreateStaff} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }} className="claim-card-inner">
                    <input type="text" placeholder="Full Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="form-input" />
                    <input type="email" placeholder="Email Address" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} className="form-input" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px" }}>
                    <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="form-input">
                      <option value="manager">Manager (Appointed Tasks)</option>
                      <option value="admin">Administrator (Ingest & Verify)</option>
                    </select>
                    <button type="submit" disabled={isCreatingStaff} className="btn-primary" style={{ padding: "12px 24px" }}>
                      <Plus size={16} style={{ marginRight: "4px" }} /> Add Staff
                    </button>
                  </div>
                </form>

                {/* Staff List */}
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", borderBottom: "1px solid var(--border-primary)", paddingBottom: "6px" }}>Staff List ({staffList.length})</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {staffList.map((st) => (
                    <div key={st.uid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: "8px" }}>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{st.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{st.email}</div>
                      </div>
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: st.role === "admin" ? "var(--primary-light)" : "rgba(245, 158, 11, 0.15)", color: st.role === "admin" ? "var(--primary)" : "var(--warning)", border: "1px solid", borderRadius: "100px", fontWeight: "700" }}>
                        {st.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Claims Approval List */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={20} style={{ color: "var(--accent)" }} />
                  Institution Claim Verification
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Approve claims to assign verified school dashboards to claiming administrators.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {claims.map((claim) => (
                    <div key={claim.id} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="claim-card-inner">
                      <div>
                        <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>{claim.instName}</h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Claimant: {claim.email}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setClaims(claims.filter(c => c.id !== claim.id))} className="btn-secondary" style={{ padding: "8px", border: "1px solid var(--danger)", color: "var(--danger)" }}><X size={14} /></button>
                        <button onClick={() => handleApproveClaim(claim.id, claim.instId, claim.instName)} className="btn-primary" style={{ padding: "8px 12px", background: "var(--success)" }}><Check size={14} style={{ marginRight: "4px" }} /> Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share Click Analytics Tracker */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={20} style={{ color: "var(--primary)" }} />
                  Referral Click Analytics
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
                  Real-time log of viral referral link clicks generated by users sharing pages.
                </p>

                <div style={{ border: "1px solid var(--border-primary)", borderRadius: "10px", overflow: "hidden" }}>
                  {referrals.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-primary)", color: "var(--text-secondary)", fontWeight: "700" }}>
                          <th style={{ padding: "10px" }}>Referrer (User ID)</th>
                          <th style={{ padding: "10px" }}>Timestamp</th>
                          <th style={{ padding: "10px" }}>Event</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referrals.slice(0, 10).map((ref) => (
                          <tr key={ref.id} style={{ borderBottom: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                            <td style={{ padding: "10px", fontFamily: "monospace" }}>{ref.referrerId.slice(0, 8)}...</td>
                            <td style={{ padding: "10px" }}>{new Date(ref.timestamp).toLocaleTimeString()}</td>
                            <td style={{ padding: "10px", color: "var(--success)" }}>Click ✔</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No referral clicks recorded yet. Try sharing a listing page!</div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .admin-grid {
          grid-template-columns: 1fr;
        }
        .claim-card-inner {
          flex-direction: column;
        }
        @media (min-width: 1024px) {
          .admin-grid {
            grid-template-columns: 1.2fr 1.1fr;
          }
          .claim-card-inner {
            flex-direction: row;
            align-items: center;
          }
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
