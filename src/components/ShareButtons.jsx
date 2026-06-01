"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Share2, Check } from "lucide-react";
import { logAppEvent } from "../lib/firebase";

export default function ShareButtons({ title, description }) {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = new URL(window.location.href);
      if (user) {
        currentUrl.searchParams.set("ref", user.uid);
      }
      setShareUrl(currentUrl.toString());
    }
  }, [user]);

  const shareText = title ? `Check out "${title}" on EduConnect!` : `Explore EduConnect - The educational and employment ecosystem platform of Odisha.`;

  const handleShareWhatsApp = () => {
    logAppEvent("share_link_clicked", { platform: "whatsapp", path: window.location.pathname });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    logAppEvent("share_link_clicked", { platform: "facebook", path: window.location.pathname });
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareLinkedIn = () => {
    logAppEvent("share_link_clicked", { platform: "linkedin", path: window.location.pathname });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  };

  const handleCopyLink = () => {
    logAppEvent("share_link_clicked", { platform: "copy_link", path: window.location.pathname });
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ margin: "24px 0", padding: "20px", background: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-primary)" }}>
      <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)" }}>
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
            gap: "8px",
            color: "white"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.729-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.13 1.952 11.5 1.952 6.064 1.952 1.64 6.321 1.636 11.751c-.001 1.77.462 3.498 1.341 5.025l-1.002 3.655 3.754-.984z" />
          </svg>
          <span>WhatsApp</span>
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
            gap: "8px",
            color: "white"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook</span>
        </button>

        {/* LinkedIn Button */}
        <button 
          onClick={handleShareLinkedIn}
          className="btn-primary heartbeat"
          style={{
            background: "#0A66C2",
            boxShadow: "0 4px 14px 0 rgba(10, 102, 194, 0.25)",
            padding: "10px 20px",
            fontSize: "0.85rem",
            gap: "8px",
            color: "white"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0zM7.12 20.452H3.558V9h3.562v11.452zM5.34 7.434a2.064 2.064 0 110-4.125 2.063 2.063 0 010 4.125zM20.452 20.452h-3.562v-5.569c0-1.328-.024-3.037-1.85-3.037-1.851 0-2.133 1.448-2.133 2.944v5.662H9.346V9h3.418v1.565h.048c.476-.9 1.637-1.85 3.37-1.85 3.606 0 4.27 2.372 4.27 5.455v6.282z"/>
          </svg>
          <span>LinkedIn</span>
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
