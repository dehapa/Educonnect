"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButtons({ institutionName, institutionId }) {
  const { user, profile } = useAuth();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate referral link dynamically based on authenticated user ID
    const baseUrl = window.location.origin;
    const path = institutionId ? `/institutions/${institutionId}` : "";
    const refParam = user ? `?ref=${user.uid}` : "";
    setShareUrl(`${baseUrl}${path}${refParam}`);
  }, [user, institutionId]);

  const shareText = `Explore "${institutionName || "EduConnect"}" - The educational and employment ecosystem platform of Odisha. Connect and claim directories here:`;

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: "24px 0", padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Share2 size={16} style={{ color: "var(--primary)" }} />
        <span>Share & Help Us Grow (Viral Loop)</span>
      </h4>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
        Logged in shares will generate a unique code. Admins track your conversions!
      </p>

      {/* Buttons container */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        
        {/* WhatsApp Button */}
        <button 
          onClick={handleShareWhatsApp}
          className="btn-primary heartbeat"
          style={{
            background: "#25D366",
            boxShadow: "0 4px 14px 0 rgba(37, 211, 102, 0.25)",
            padding: "10px 20px",
            fontSize: "0.85rem",
            gap: "8px"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.13 1.952 11.5 1.952 6.064 1.952 1.64 6.321 1.636 11.751c-.001 1.77.462 3.498 1.341 5.025l-1.002 3.655 3.754-.984z" />
          </svg>
          <span>Share WhatsApp</span>
        </button>

        {/* Facebook Button */}
        <button 
          onClick={handleShareFacebook}
          className="btn-primary heartbeat"
          style={{
            background: "#1877F2",
            boxShadow: "0 4px 14px 0 rgba(24, 119, 242, 0.25)",
            padding: "10px 20px",
            fontSize: "0.85rem",
            gap: "8px"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Share Facebook</span>
        </button>

        {/* Copy Link Button */}
        <button 
          onClick={handleCopyLink}
          className="btn-secondary"
          style={{
            padding: "10px 20px",
            fontSize: "0.85rem",
            gap: "8px"
          }}
        >
          {copied ? <Check size={16} style={{ color: "var(--success)" }} /> : <Share2 size={16} />}
          <span>{copied ? "Link Copied!" : "Copy Link"}</span>
        </button>

      </div>
    </div>
  );
}
