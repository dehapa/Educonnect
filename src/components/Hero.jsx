"use client";

import { GraduationCap, Briefcase, Users, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section style={{ position: "relative", padding: "100px 0 80px 0", overflow: "hidden" }}>
      {/* Background blobs */}
      <div className="radial-bg"></div>

      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "60px", alignItems: "center" }}>
        
        {/* Hero Left Content */}
        <div className="animate-fade-in-up" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Badge */}
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            background: "var(--primary-light)", 
            border: "1px solid var(--primary-glow)", 
            color: "var(--primary)", 
            padding: "6px 16px", 
            borderRadius: "100px", 
            fontSize: "0.85rem", 
            fontWeight: "600",
            marginBottom: "24px"
          }}>
            <CheckCircle size={14} />
            <span>Verified Educational Directory & Placement Platform</span>
          </div>

          {/* Headline */}
          <h1 style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
            lineHeight: "1.1", 
            marginBottom: "24px",
            fontFamily: "var(--font-display)",
            fontWeight: "900"
          }}>
            Connecting <span style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Education</span> with <span style={{ background: "linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Employment</span>
          </h1>

          {/* Subtext */}
          <p style={{ 
            color: "var(--text-secondary)", 
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)", 
            lineHeight: "1.6", 
            marginBottom: "40px", 
            maxWidth: "680px",
            marginRight: "auto",
            marginLeft: "auto"
          }}>
            A unified digital ecosystem for students, teachers, institutions, and employers. Discover verified institutes in Odisha & India, claim directories, and apply for campus-verified careers.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginBottom: "60px" }}>
            <a href="#search" className="btn-primary" style={{ gap: "8px", padding: "14px 28px", fontSize: "1rem" }}>
              Explore Institutions
            </a>
            <a href="#register" className="btn-secondary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
              Join the Ecosystem
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "24px", 
            background: "var(--card-bg)", 
            border: "1px solid var(--card-border)", 
            borderRadius: "var(--radius-xl)", 
            padding: "24px", 
            maxWidth: "650px", 
            marginRight: "auto", 
            marginLeft: "auto",
            boxShadow: "var(--shadow-lg)"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--primary)", display: "flex", justifyContent: "center", marginBottom: "8px" }}><GraduationCap size={28} /></div>
              <h3 style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: "800" }}>2,500+</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Verified Schools</p>
            </div>
            <div style={{ textAlign: "center", borderRight: "1px solid var(--border-primary)", borderLeft: "1px solid var(--border-primary)" }}>
              <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: "8px" }}><Users size={28} /></div>
              <h3 style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: "800" }}>45,000+</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Students & Teachers</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "var(--success)", display: "flex", justifyContent: "center", marginBottom: "8px" }}><Briefcase size={28} /></div>
              <h3 style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontWeight: "800" }}>1,200+</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "600" }}>Active Placements</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
