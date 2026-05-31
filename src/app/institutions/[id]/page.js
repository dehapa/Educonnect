"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import ShareButtons from "../../../components/ShareButtons";
import { 
  Landmark, MapPin, Phone, Globe, Star, ArrowLeft, ShieldCheck, 
  Users, Award, BookOpen, UserCheck, RefreshCw, Send, CheckCircle2, ChevronRight
} from "lucide-react";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";

export default function InstitutionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [inst, setInst] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimDoc, setClaimDoc] = useState("");
  const [claimTier, setClaimTier] = useState("free");
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        // Fetch institution
        const docRef = doc(db, "institutions", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setInst({ id: docSnap.id, ...docSnap.data() });
          
          // Generate mockup courses based on type
          const category = docSnap.data().type;
          
          // Query students linked to this institution
          // (Simulated query, fallback to generic students if none in Firestore)
          try {
            const studentQuery = query(collection(db, "users"), where("role", "==", "student"), where("institutionId", "==", id));
            const studentSnap = await getDocs(studentQuery);
            const studentList = [];
            studentSnap.forEach(d => studentList.push(d.data()));
            
            if (studentList.length > 0) {
              setStudents(studentList);
            } else {
              // Mock students
              setStudents([
                { name: "Siddharth Mohanty", email: "siddharth@gmail.com", dept: "Science" },
                { name: "Priyanka Mishra", email: "priyanka@gmail.com", dept: "Arts" },
                { name: "Aman Patnaik", email: "aman@gmail.com", dept: "Commerce" }
              ]);
            }
          } catch(err) {
            console.error("Error fetching students:", err);
          }

          // Query teachers linked to this institution
          try {
            const teacherQuery = query(collection(db, "users"), where("role", "==", "teacher"), where("institutionId", "==", id));
            const teacherSnap = await getDocs(teacherQuery);
            const teacherList = [];
            teacherSnap.forEach(d => teacherList.push(d.data()));
            
            if (teacherList.length > 0) {
              setTeachers(teacherList);
            } else {
              // Mock teachers
              setTeachers([
                { name: "Dr. Ramesh Chandra Jena", subject: "Mathematics" },
                { name: "Mrs. Minati Senapati", subject: "Physics" }
              ]);
            }
          } catch(err) {
            console.error("Error fetching teachers:", err);
          }

        } else {
          setInst(null);
        }
      } catch (e) {
        console.error("Error fetching institution details:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimEmail || !claimDoc) {
      alert("Please provide all claiming documents and emails.");
      return;
    }
    setClaiming(true);
    try {
      // Add a claim request document to the 'claims' collection
      await addDoc(collection(db, "claims"), {
        instId: inst.id,
        instName: inst.name,
        email: claimEmail,
        documentUrl: claimDoc,
        tier: claimTier,
        status: "pending",
        userId: user ? user.uid : "anonymous",
        timestamp: new Date().toISOString()
      });
      
      setClaimSuccess(true);
      setTimeout(() => {
        setClaiming(false);
        setClaimSuccess(false);
        setClaimEmail("");
        setClaimDoc("");
      }, 3000);
    } catch (error) {
      console.error("Claim registration failed:", error);
      alert("Failed to submit claim request. Please try again.");
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
          <div style={{ textAlign: "center" }}>
            <RefreshCw className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3>Fetching Listing Details...</h3>
          </div>
        </main>
        <Footer />
        <style jsx global>{`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </>
    );
  }

  if (!inst) {
    return (
      <>
        <Header />
        <main style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", textAlign: "center" }}>
            <Landmark size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Listing Not Found</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              The institution profile you are looking for does not exist or may have been removed from our directories.
            </p>
            <button onClick={() => router.push("/")} className="btn-primary" style={{ width: "100%", gap: "8px" }}>
              <ArrowLeft size={16} /> Return to Directory
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Generate dynamic embed link for Google Map
  const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_KEY}&q=place_id:${inst.id}`;

  // Get courses based on institution type
  const getCourses = () => {
    if (inst.type === "university") {
      return ["B.Tech Computer Science", "M.Tech Software Engineering", "Bachelor of Business Administration (BBA)", "MBA Finance & Marketing", "B.Sc Physics Honours", "M.Sc Mathematics"];
    } else if (inst.type === "high-school") {
      return ["CBSE Secondary Education (Class IX - X)", "CBSE Higher Secondary Science (Class XI - XII)", "CBSE Higher Secondary Commerce", "State Board Matriculation"];
    } else if (inst.type === "coaching") {
      return ["JEE Main & Advanced Preparation", "NEET Medical Entrance Crash Course", "Foundation Course (Class VIII - X)", "OPSC/UPSC Civil Services Coaching"];
    }
    return ["Play School & Pre-School Program", "Early Childhood Development Program", "Montessori Activity Sessions"];
  };

  return (
    <>
      <Header />
      
      <main style={{ padding: "40px 0" }}>
        <div className="container">
          
          {/* Breadcrumb Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px" }}>
            <Link href={`/?country=${inst.country || "India"}`} className="breadcrumb-link" style={{ textDecoration: "none" }}>{inst.country || "India"}</Link>
            <ChevronRight size={14} />
            <Link href={`/?state=${inst.state || "Odisha"}`} className="breadcrumb-link" style={{ textDecoration: "none" }}>{inst.state || "Odisha"}</Link>
            <ChevronRight size={14} />
            {inst.district && (
              <>
                <Link href={`/?district=${inst.district}`} className="breadcrumb-link" style={{ textDecoration: "none" }}>{inst.district.charAt(0).toUpperCase() + inst.district.slice(1)}</Link>
                <ChevronRight size={14} />
              </>
            )}
            {inst.townOrBlock && (
              <>
                <Link href={`/?town=${inst.townOrBlock}`} className="breadcrumb-link" style={{ textDecoration: "none" }}>{inst.townOrBlock.charAt(0).toUpperCase() + inst.townOrBlock.slice(1)}</Link>
                <ChevronRight size={14} />
              </>
            )}
            <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>{inst.name}</span>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", marginBottom: "24px", fontWeight: "600", fontSize: "0.95rem" }}
            onMouseEnter={(e) => e.target.style.color = "var(--primary)"}
            onMouseLeave={(e) => e.target.style.color = "var(--text-secondary)"}
          >
            <ArrowLeft size={16} /> Back to Listings
          </button>

          {/* Institutional Banner Image */}
          <div style={{ 
            width: "100%", 
            height: "280px", 
            borderRadius: "16px", 
            overflow: "hidden", 
            marginBottom: "24px",
            position: "relative",
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
          }}>
            {inst.photoName ? (
              <img 
                src={`https://places.googleapis.com/v1/${inst.photoName}/media?key=${GOOGLE_MAPS_KEY}&maxHeightPx=600`}
                alt={inst.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255, 255, 255, 0.9)",
                flexDirection: "column",
                gap: "10px",
                padding: "20px",
                textAlign: "center"
              }}>
                <Landmark size={48} style={{ opacity: 0.8 }} />
                <span style={{ fontSize: "1.2rem", fontWeight: "700", letterSpacing: "0.05em" }}>{inst.name.toUpperCase()}</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>Verified Institutional Profile Directory</span>
              </div>
            )}
            
            <div style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(4px)",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: "600",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              Odisha Education Directory
            </div>
          </div>

          {/* Profile Header Block */}
          <div className="glass-card" style={{ padding: "32px", marginBottom: "40px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                
                {/* Logo/Icon */}
                <div style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem"
                }}>
                  {inst.logo || "🏫"}
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                    <h1 style={{ fontSize: "2rem", color: "var(--text-primary)" }}>{inst.name}</h1>
                    {inst.isVerified && (
                      <span style={{ background: "var(--success-light)", color: "var(--success)", display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
                        <ShieldCheck size={14} /> Verified
                      </span>
                    )}
                    {inst.isClaimed ? (
                      <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
                        Claimed
                      </span>
                    ) : (
                      <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--warning)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
                        Unclaimed Listing
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={16} /> {inst.address || inst.description}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}>
                      <Star size={16} fill="var(--warning)" color="var(--warning)" /> {inst.rating || "4.2"} Rating
                    </span>
                  </div>
                </div>
              </div>

              {/* Claim Action if Unclaimed */}
              {!inst.isClaimed && (
                <a href="#claim-section" className="btn-primary heartbeat" style={{ padding: "12px 24px" }}>
                  Claim Institution Listing
                </a>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }} className="details-grid">
            
            {/* Left Column: Course, Students, Teachers */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Description summary */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "16px" }}>About</h3>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "1rem" }}>
                  {inst.description}. This educational directory profile is generated using real maps data. You can explore courses, associated students, faculty grids, and campus placements details.
                </p>
              </div>

              {/* Courses Grid */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={20} style={{ color: "var(--primary)" }} />
                  <span>Programs & Courses</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                  {getCourses().map((course, idx) => (
                    <div key={idx} style={{ padding: "14px 18px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", fontWeight: "600", fontSize: "0.9rem" }}>
                      • {course}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Faculty Grid */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={20} style={{ color: "var(--accent)" }} />
                  <span>Faculty & Teachers ({teachers.length})</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {teachers.map((teach, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{teach.name}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--accent)", background: "rgba(6, 182, 212, 0.1)", padding: "4px 10px", borderRadius: "100px", fontWeight: "700" }}>
                        {teach.subject || "Teacher"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Students Grid */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <UserCheck size={20} style={{ color: "var(--success)" }} />
                  <span>Verified Students ({students.length})</span>
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {students.map((stud, idx) => (
                    <div key={idx} style={{ padding: "16px", background: "var(--bg-tertiary)", borderRadius: "10px", border: "1px solid var(--border-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.85rem" }}>
                        {stud.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700" }}>{stud.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stud.dept || "Student"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Contact info, Google maps, claim form, share */}
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              
              {/* Info Card */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>Institution Details</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  
                  {/* Address */}
                  {inst.address && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "0.9rem" }}>
                      <MapPin size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-muted)" }}>Address</div>
                        <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{inst.address}</div>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {inst.phone && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "0.9rem" }}>
                      <Phone size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-muted)" }}>Telephone</div>
                        <a href={`tel:${inst.phone}`} style={{ color: "var(--primary)", fontWeight: "600", display: "block", marginTop: "4px" }}>{inst.phone}</a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {inst.website && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", fontSize: "0.9rem" }}>
                      <Globe size={20} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: "700", color: "var(--text-muted)" }}>Website</div>
                        <a href={inst.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: "600", display: "block", marginTop: "4px", textDecoration: "underline" }}>
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Google Map Embed */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px" }}>Interactive Location Map</h4>
                {GOOGLE_MAPS_KEY ? (
                  <iframe 
                    width="100%" 
                    height="220" 
                    style={{ border: 0, borderRadius: "12px" }} 
                    loading="lazy" 
                    allowFullScreen 
                    src={mapEmbedUrl}
                  ></iframe>
                ) : (
                  <div style={{ height: "220px", background: "var(--bg-tertiary)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    Google Maps embed not configured.
                  </div>
                )}
              </div>

              {/* Viral loop sharing */}
              <ShareButtons title={inst.name} description={`Check out ${inst.name} on EduConnect!`} />

              {/* Claim section */}
              {!inst.isClaimed && (
                <div id="claim-section" className="glass-card" style={{ padding: "32px", border: "1px solid var(--warning)" }}>
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Award size={20} style={{ color: "var(--warning)" }} />
                    <span>Claim Verification</span>
                  </h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                    Are you the principal, administrator, or representative of this institution? Claim this listing to manage courses, verify students/teachers, and post campus jobs.
                  </p>

                  {claimSuccess ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--success-light)", color: "var(--success)", padding: "12px", borderRadius: "10px", fontSize: "0.85rem" }}>
                      <CheckCircle2 size={16} />
                      <span>Verification request submitted! A regional admin will review within 24 hours.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleClaimSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <input 
                        type="email" 
                        placeholder="Official email (e.g. admin@school.edu.in)" 
                        className="form-input" 
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        required 
                      />
                      <input 
                        type="text" 
                        placeholder="Link to verification document (ID Card, Authority letter)" 
                        className="form-input" 
                        value={claimDoc}
                        onChange={(e) => setClaimDoc(e.target.value)}
                        required 
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Select Listing Tier</label>
                        <select 
                          value={claimTier} 
                          onChange={(e) => setClaimTier(e.target.value)}
                          className="form-input"
                          style={{ cursor: "pointer" }}
                        >
                          <option value="free">Free Directory Listing (Standard Edit & Verifications)</option>
                          <option value="paid-tier-1">Paid Premium Listing (Featured Badge + Verifications)</option>
                          <option value="paid-tier-2">Paid Placement Listing (Featured Badge + Campus Job Posting)</option>
                        </select>
                      </div>
                      <button type="submit" disabled={claiming} className="btn-primary" style={{ width: "100%", gap: "8px", background: "linear-gradient(135deg, var(--warning) 0%, #d97706 100%)", boxShadow: "0 4px 14px 0 rgba(245, 158, 11, 0.25)" }}>
                        <Send size={16} />
                        <span>{claiming ? "Submitting..." : "Submit Claim Verification"}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .details-grid {
          grid-template-columns: 1fr;
        }
        .breadcrumb-link:hover {
          color: var(--primary);
          text-decoration: underline;
        }
        @media (min-width: 1024px) {
          .details-grid {
            grid-template-columns: 1.8fr 1.1fr;
          }
        }
      `}</style>
    </>
  );
}
