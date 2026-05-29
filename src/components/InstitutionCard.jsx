"use client";

import { MapPin, ArrowRight, Award, CheckCircle, Lock } from "lucide-react";

export default function InstitutionCard({ institution, onClaim }) {
  const { 
    id, 
    name, 
    type, 
    location, 
    rating, 
    isVerified, 
    isClaimed, 
    coursesCount, 
    studentsCount, 
    description,
    logo
  } = institution;

  // Format type labels
  const typeLabels = {
    "play-school": "Play School",
    "high-school": "High School",
    "university": "University",
    "coaching": "Coaching Center",
    "technical": "Technical Institute"
  };

  return (
    <div className="glass-card animate-fade-in-up" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      
      {/* Card Header Media */}
      <div style={{ 
        height: "140px", 
        background: "linear-gradient(135deg, var(--primary-light) 0%, rgba(6, 182, 212, 0.05) 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid var(--border-primary)"
      }}>
        {/* Verification Status */}
        <div style={{ position: "absolute", top: "16px", left: "16px" }}>
          {isVerified ? (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--success-light)", border: "1px solid var(--success)", color: "var(--success)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
              <CheckCircle size={12} />
              <span>Verified</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--bg-tertiary)", border: "1px solid var(--border-secondary)", color: "var(--text-muted)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
              <Lock size={12} />
              <span>Unclaimed</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid var(--warning)", color: "var(--warning)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "700" }}>
          ★ {rating.toFixed(1)}
        </div>

        {/* Logo Icon */}
        <div style={{ 
          width: "70px", 
          height: "70px", 
          background: "var(--bg-secondary)", 
          borderRadius: "16px", 
          border: "1px solid var(--border-primary)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontSize: "2rem",
          boxShadow: "var(--shadow-md)"
        }}>
          {logo || "🏫"}
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Badges Row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", padding: "4px 10px", background: "var(--bg-tertiary)", borderRadius: "6px", color: "var(--text-secondary)", fontWeight: "600" }}>
            {typeLabels[type] || type}
          </span>
          <span style={{ fontSize: "0.75rem", padding: "4px 10px", background: "var(--bg-tertiary)", borderRadius: "6px", color: "var(--text-secondary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={12} />
            {location.charAt(0).toUpperCase() + location.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "8px", fontWeight: "700" }}>
          {name}
        </h3>

        {/* Description */}
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "20px", flex: 1 }}>
          {description || "Provides top quality education and overall development facilities for students in Odisha."}
        </p>

        {/* Stats Row */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-primary)", paddingTop: "16px", marginBottom: "20px", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
          <span>📚 {coursesCount} Courses</span>
          <span>👥 {studentsCount}+ Students</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          {!isClaimed && (
            <button 
              onClick={() => onClaim && onClaim(id)} 
              className="btn-secondary" 
              style={{ flex: 1, padding: "10px", fontSize: "0.85rem", gap: "4px" }}
            >
              Claim Listing
            </button>
          )}
          <a 
            href={`/institutions/${id}`} 
            className="btn-primary" 
            style={{ 
              flex: isClaimed ? 1 : 1.2, 
              padding: "10px", 
              fontSize: "0.85rem", 
              gap: "6px",
              background: isClaimed ? undefined : "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
              boxShadow: isClaimed ? undefined : "0 4px 14px 0 rgba(6, 182, 212, 0.25)"
            }}
            onClick={(e) => e.preventDefault()} // Just mock link click for now
          >
            <span>View Profile</span>
            <ArrowRight size={14} />
          </a>
        </div>

      </div>

    </div>
  );
}
