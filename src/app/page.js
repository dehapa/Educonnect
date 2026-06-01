"use client";
import { useState, useEffect } from "react";
import { collection, query, getDocs, limit as firestoreLimit, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "2,500+", label: "Verified Institutions", icon: "🎓" },
    { value: "45,000+", label: "Students & Teachers", icon: "👥" },
    { value: "1,200+", label: "Active Job Listings", icon: "💼" },
    { value: "98%", label: "Placement Rate", icon: "✅" },
  ];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1px",
      background: "rgba(255,255,255,0.06)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.07)",
      marginTop: "48px",
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: "20px 16px",
          textAlign: "center",
          background: "rgba(11,17,32,0.6)",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{s.icon}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#ffffff", lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "4px", fontWeight: "500" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Hero Search ──────────────────────────────────────────────────────────────
function HeroSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("institutions");
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("loc", location);
    router.push(`/${category}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} style={{
      background: "rgba(255,255,255,0.07)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "20px",
      padding: "8px",
      display: "flex",
      gap: "0",
      alignItems: "center",
      maxWidth: "860px",
      margin: "32px auto 0",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    }}>
      {/* Category */}
      <select
        value={category}
        onChange={e => setCategory(e.target.value)}
        style={{
          padding: "14px 16px",
          background: "rgba(59,130,246,0.15)",
          border: "none",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          color: "#93c5fd",
          outline: "none",
          borderRadius: "14px 0 0 14px",
          fontWeight: "700",
          fontSize: "0.85rem",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <option value="institutions">Institutions</option>
        <option value="jobs">Jobs</option>
        <option value="teachers">Teachers</option>
        <option value="students">Students</option>
      </select>

      {/* Keyword */}
      <input
        type="text"
        placeholder="Search colleges, jobs, teachers..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        style={{
          flex: 2,
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          color: "#ffffff",
          outline: "none",
          fontSize: "0.95rem",
          minWidth: 0,
        }}
      />

      {/* Location */}
      <input
        type="text"
        placeholder="📍 City / State"
        value={location}
        onChange={e => setLocation(e.target.value)}
        style={{
          flex: 1,
          padding: "14px 16px",
          background: "transparent",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          border: "none",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          color: "#ffffff",
          outline: "none",
          fontSize: "0.9rem",
          minWidth: 0,
        }}
      />

      {/* Submit */}
      <button type="submit" style={{
        padding: "14px 28px",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "white",
        border: "none",
        borderRadius: "14px",
        fontWeight: "700",
        fontSize: "0.95rem",
        cursor: "pointer",
        flexShrink: 0,
        transition: "all 0.2s",
        boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
      }}>
        🔍 Search
      </button>
    </form>
  );
}

// ─── Quick Action Cards ───────────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    {
      icon: "🎓",
      title: "Find Your School",
      desc: "Explore 2,500+ verified institutions across India",
      link: "/institutions",
      color: "rgba(59,130,246,0.15)",
      border: "rgba(59,130,246,0.3)",
      accent: "#3b82f6",
      badge: "Popular",
    },
    {
      icon: "💼",
      title: "Explore Jobs",
      desc: "1,200+ active openings — teaching, corporate & more",
      link: "/jobs",
      color: "rgba(249,115,22,0.12)",
      border: "rgba(249,115,22,0.3)",
      accent: "#f97316",
      badge: "New",
    },
    {
      icon: "🤝",
      title: "Find Mentors",
      desc: "Connect with verified teachers & industry experts",
      link: "/teachers",
      color: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.3)",
      accent: "#10b981",
      badge: null,
    },
    {
      icon: "🌍",
      title: "Join Community",
      desc: "Network with students, alumni & professionals",
      link: "/students",
      color: "rgba(139,92,246,0.12)",
      border: "rgba(139,92,246,0.3)",
      accent: "#8b5cf6",
      badge: null,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    }}>
      {actions.map((a, i) => (
        <Link key={i} href={a.link} style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          background: a.color,
          border: `1px solid ${a.border}`,
          borderRadius: "20px",
          textDecoration: "none",
          color: "inherit",
          transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${a.border}`;
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
        >
          {a.badge && (
            <span style={{
              position: "absolute", top: "14px", right: "14px",
              background: a.accent, color: "white",
              fontSize: "0.65rem", fontWeight: "700", padding: "3px 8px",
              borderRadius: "100px", letterSpacing: "0.5px",
            }}>{a.badge}</span>
          )}
          <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{a.icon}</div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>{a.title}</h3>
          <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>{a.desc}</p>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", color: a.accent, fontSize: "0.82rem", fontWeight: "600" }}>
            Explore <span>→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Institution Card ─────────────────────────────────────────────────────────
function InstitutionCard({ item }) {
  return (
    <Link href={`/institutions/${item.id}`} style={{
      display: "flex", flexDirection: "column",
      background: "rgba(15,23,42,0.7)", borderRadius: "16px",
      border: "1px solid rgba(51,65,85,0.8)",
      overflow: "hidden", textDecoration: "none", color: "inherit",
      transition: "all 0.25s ease",
    }}
    onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.3)"; }}
    onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Image */}
      <div style={{ height: "130px", background: "linear-gradient(135deg, #1e293b, #0f172a)", position: "relative", overflow: "hidden" }}>
        {item.image || item.logo || item.logoUrl ? (
          <img src={item.image || item.logo || item.logoUrl} alt={item.name || item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "3rem", color: "#334155", fontWeight: "800" }}>{(item.name || item.title || "?").charAt(0)}</span>
          </div>
        )}
        {(item.isVerified || item.claimed) && (
          <div style={{ position: "absolute", top: "10px", right: "10px", background: "#10b981", borderRadius: "100px", padding: "3px 8px", fontSize: "0.65rem", fontWeight: "700", color: "white" }}>✓ Verified</div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "700", color: "#f1f5f9" }}>{item.name || item.title || "Institution"}</h4>
        <p style={{ margin: "0 0 12px", fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
          <span>📍</span> {item.location || item.city || item.category || "India"}
        </p>
        <div style={{ marginTop: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {item.category && <span style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", borderRadius: "100px", padding: "3px 10px", fontSize: "0.72rem", fontWeight: "600" }}>{item.category}</span>}
        </div>
      </div>
    </Link>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ item }) {
  return (
    <Link href={`/jobs/${item.id}`} style={{
      display: "flex", alignItems: "flex-start", gap: "14px",
      padding: "16px", background: "rgba(15,23,42,0.7)",
      borderRadius: "14px", border: "1px solid rgba(51,65,85,0.8)",
      textDecoration: "none", color: "inherit",
      transition: "all 0.2s ease",
    }}
    onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"; e.currentTarget.style.background = "rgba(249,115,22,0.05)"; }}
    onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.background = "rgba(15,23,42,0.7)"; }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(249,115,22,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.3rem" }}>
        {item.logo || item.logoUrl ? <img src={item.logo || item.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} /> : "💼"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ margin: "0 0 3px", fontSize: "0.92rem", fontWeight: "700", color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title || item.name || "Job Opening"}</h4>
        <p style={{ margin: "0 0 8px", fontSize: "0.78rem", color: "#64748b" }}>{item.company || item.institution || "Company"}</p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {item.location && <span style={{ background: "rgba(51,65,85,0.6)", color: "#94a3b8", borderRadius: "100px", padding: "2px 8px", fontSize: "0.7rem" }}>📍 {item.location}</span>}
          {item.type && <span style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c", borderRadius: "100px", padding: "2px 8px", fontSize: "0.7rem" }}>{item.type}</span>}
          {item.salary && <span style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", borderRadius: "100px", padding: "2px 8px", fontSize: "0.7rem" }}>💰 {item.salary}</span>}
        </div>
      </div>
    </Link>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, linkText, linkHref, accent = "#3b82f6" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
      <div>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: "800", color: "#f8fafc" }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, fontSize: "0.88rem", color: "#64748b" }}>{subtitle}</p>}
      </div>
      {linkHref && (
        <Link href={linkHref} style={{
          padding: "8px 18px",
          background: `rgba(${accent === "#3b82f6" ? "59,130,246" : "249,115,22"},0.15)`,
          color: accent,
          borderRadius: "100px",
          fontSize: "0.82rem",
          fontWeight: "700",
          textDecoration: "none",
          border: `1px solid ${accent}40`,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {linkText} →
        </Link>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [institutions, setInstitutions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingInst, setLoadingInst] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    // Fetch top institutions
    getDocs(query(collection(db, "institutions"), firestoreLimit(8)))
      .then(snap => setInstitutions(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoadingInst(false));

    // Fetch featured jobs
    getDocs(query(collection(db, "jobs"), firestoreLimit(6)))
      .then(snap => setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoadingJobs(false));
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .ec-home { background: #090d16; min-height: 100vh; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        .ec-hero { position: relative; padding: 100px 24px 60px; overflow: hidden; text-align: center; }
        .ec-hero-bg { position: absolute; inset: 0; z-index: 0; }
        .ec-hero-bg::before { content: ''; position: absolute; top: -30%; left: -10%; width: 70%; height: 70%; background: radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%); filter: blur(60px); }
        .ec-hero-bg::after { content: ''; position: absolute; top: -10%; right: -10%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%); filter: blur(60px); }
        .ec-hero-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; }
        .ec-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; padding: 6px 16px; border-radius: 100px; font-size: 0.8rem; font-weight: 600; margin-bottom: 24px; }
        .ec-hero-title { font-size: clamp(2.2rem, 5.5vw, 4rem); font-weight: 900; color: #ffffff; line-height: 1.1; letter-spacing: -0.03em; margin: 0 0 20px; }
        .ec-hero-title span { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .ec-hero-sub { font-size: clamp(1rem, 2vw, 1.2rem); color: #94a3b8; line-height: 1.7; margin: 0 auto 8px; max-width: 640px; }
        .ec-section { max-width: 1280px; margin: 0 auto; padding: 60px 24px; }
        .ec-section + .ec-section { padding-top: 0; }
        .ec-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.05); margin: 0 24px; max-width: calc(100% - 48px); }
        .ec-inst-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .ec-jobs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ec-promo { background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.10) 100%); border: 1px solid rgba(59,130,246,0.2); border-radius: 24px; padding: 48px; display: flex; align-items: center; gap: 40px; }
        .ec-skeleton { background: linear-gradient(90deg, rgba(30,41,59,0.8) 25%, rgba(51,65,85,0.4) 50%, rgba(30,41,59,0.8) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 768px) {
          .ec-hero { padding: 80px 16px 40px; }
          .ec-section { padding: 40px 16px; }
          .ec-jobs-grid { grid-template-columns: 1fr; }
          .ec-promo { flex-direction: column; padding: 28px; gap: 20px; }
          .ec-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div className="ec-home">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="ec-hero">
          <div className="ec-hero-bg" />
          <div className="ec-hero-inner">
            <div className="ec-badge">
              <span>🇮🇳</span> India's #1 Education & Employment Network
            </div>
            <h1 className="ec-hero-title">
              Connecting <span>Education</span><br />with <span>Employment</span>
            </h1>
            <p className="ec-hero-sub">
              Discover verified schools, engineering colleges & nursing institutions across Odisha & India.
              Find mentors, explore jobs, and build your career — all in one verified ecosystem.
            </p>

            <HeroSearch />

            {/* Stats */}
            <div className="ec-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", marginTop: "48px" }}>
              {[
                { value: "2,500+", label: "Verified Institutions", icon: "🎓" },
                { value: "45,000+", label: "Students & Teachers", icon: "👥" },
                { value: "1,200+", label: "Active Jobs", icon: "💼" },
                { value: "98%", label: "Placement Rate", icon: "✅" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "20px 12px", textAlign: "center", background: "rgba(9,13,22,0.7)" }}>
                  <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>{s.value}</div>
                  <div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: "3px", fontWeight: "500" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── QUICK ACTIONS ─────────────────────────────────────── */}
        <section className="ec-section" style={{ paddingTop: "20px" }}>
          <SectionHeader
            title="What are you looking for?"
            subtitle="Choose your path and we'll guide you forward"
          />
          <QuickActions />
        </section>

        <div className="ec-divider" style={{ margin: "0 auto", maxWidth: "1280px" }} />

        {/* ── TOP INSTITUTIONS ──────────────────────────────────── */}
        <section className="ec-section">
          <SectionHeader
            title="🎓 Top Institutions"
            subtitle="Explore verified schools, colleges & coaching centers"
            linkText="View All Institutions"
            linkHref="/institutions"
            accent="#3b82f6"
          />
          {loadingInst ? (
            <div className="ec-inst-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ec-skeleton" style={{ height: "220px" }} />
              ))}
            </div>
          ) : institutions.length > 0 ? (
            <div className="ec-inst-grid">
              {institutions.map(item => <InstitutionCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
              <div style={{ fontSize: "3rem" }}>🏫</div>
              <p style={{ marginTop: "12px" }}>No institutions listed yet. <Link href="/admin" style={{ color: "#3b82f6" }}>Add via Admin Panel →</Link></p>
            </div>
          )}
        </section>

        <div className="ec-divider" style={{ margin: "0 auto", maxWidth: "1280px" }} />

        {/* ── FEATURED JOBS ─────────────────────────────────────── */}
        <section className="ec-section">
          <SectionHeader
            title="💼 Featured Jobs"
            subtitle="Teaching, corporate & government job openings"
            linkText="Browse All Jobs"
            linkHref="/jobs"
            accent="#f97316"
          />
          {loadingJobs ? (
            <div className="ec-jobs-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ec-skeleton" style={{ height: "90px" }} />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="ec-jobs-grid">
              {jobs.map(item => <JobCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
              <div style={{ fontSize: "3rem" }}>💼</div>
              <p style={{ marginTop: "12px" }}>No jobs listed yet. <Link href="/admin" style={{ color: "#f97316" }}>Post a job →</Link></p>
            </div>
          )}
        </section>

        <div className="ec-divider" style={{ margin: "0 auto", maxWidth: "1280px" }} />

        {/* ── PROMO BANNER ──────────────────────────────────────── */}
        <section className="ec-section">
          <div className="ec-promo">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>For Institutions</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", margin: "0 0 12px", lineHeight: 1.2 }}>
                Is your institution listed?
              </h2>
              <p style={{ color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.6 }}>
                Claim your free listing on EduConnect and connect with thousands of students,
                teachers, and employers looking for verified institutions like yours.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/institutions" style={{ padding: "12px 24px", background: "#3b82f6", color: "white", borderRadius: "10px", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem" }}>
                  Find My Institution
                </Link>
                <Link href="/dashboard" style={{ padding: "12px 24px", background: "rgba(255,255,255,0.08)", color: "#f8fafc", borderRadius: "10px", fontWeight: "700", textDecoration: "none", fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.12)" }}>
                  Register Now
                </Link>
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <div style={{ fontSize: "6rem", lineHeight: 1 }}>🏫</div>
              <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#64748b" }}>2,500+ already listed</div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ────────────────────────────────────────── */}
        <section className="ec-section" style={{ paddingTop: 0 }}>
          <SectionHeader
            title="🔍 Browse by Category"
            subtitle="Filter institutions by type to find the right fit"
          />
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Engineering Colleges", icon: "⚙️", q: "engineering" },
              { label: "Nursing Colleges", icon: "🏥", q: "nursing" },
              { label: "Schools (K–12)", icon: "📚", q: "school" },
              { label: "Coaching Centers", icon: "🎯", q: "coaching" },
              { label: "Universities", icon: "🏛️", q: "university" },
              { label: "Polytechnic", icon: "🔧", q: "polytechnic" },
              { label: "Medical Colleges", icon: "⚕️", q: "medical" },
              { label: "Law Colleges", icon: "⚖️", q: "law" },
            ].map((c, i) => (
              <Link key={i} href={`/institutions?q=${c.q}`} style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", background: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(51,65,85,0.8)", borderRadius: "100px",
                color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "600",
                textDecoration: "none", transition: "all 0.2s",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.color = "#93c5fd"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(30,41,59,0.8)"; e.currentTarget.style.borderColor = "rgba(51,65,85,0.8)"; e.currentTarget.style.color = "#cbd5e1"; }}
              >
                <span>{c.icon}</span> {c.label}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}
