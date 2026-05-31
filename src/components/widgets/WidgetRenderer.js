"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import AdSpace from "../AdSpace";
import { Star, MapPin, ChevronRight, Briefcase, GraduationCap, Users } from "lucide-react";

import NetworkFeedWidget from "./NetworkFeedWidget";

export default function WidgetRenderer({ widget }) {
  if (!widget) return null;

  switch (widget.type) {
    case "hero":
      return <HeroWidget widget={widget} />;
    case "grid":
      return <DynamicGridWidget widget={widget} />;
    case "html":
      return <HtmlWidget widget={widget} />;
    case "ad":
      return <AdWidget widget={widget} />;
    case "youtube":
      return <YouTubeWidget widget={widget} />;
    case "social":
      return <SocialWidget widget={widget} />;
    case "adsense":
      return <AdSenseWidget widget={widget} />;
    case "network-feed":
      return <NetworkFeedWidget widget={widget} />;
    default:
      return null;
  }
}

function HeroWidget({ widget }) {
  return (
    <section 
      style={{
        position: "relative",
        background: `url(${widget.heroImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070'}) center/cover no-repeat`,
        padding: "80px 20px",
        borderRadius: "16px",
        marginBottom: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11, 17, 32, 0.75)" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "800", color: "#f8fafc", marginBottom: "16px", letterSpacing: "-0.02em", lineHeight: "1.2" }}>
          {widget.heroTitle}
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#cbd5e1", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px auto" }}>
          {widget.heroSubtitle}
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
          <Link href="/institutions" className="btn-primary" style={{ padding: "12px 24px", fontSize: "1.1rem", borderRadius: "8px", background: "#3b82f6", color: "white", textDecoration: "none", fontWeight: "600" }}>
            Explore Institutions
          </Link>
          <Link href="/jobs" className="btn-secondary" style={{ padding: "12px 24px", fontSize: "1.1rem", borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none", fontWeight: "600", border: "1px solid rgba(255,255,255,0.2)" }}>
            Find Jobs
          </Link>
        </div>
      </div>
    </section>
  );
}

function DynamicGridWidget({ widget }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        let colRef = collection(db, widget.gridCategory);
        let q = query(colRef, limit(widget.gridCount));
        
        if (widget.gridFilter === "featured") {
          q = query(colRef, where("isFeatured", "==", true), limit(widget.gridCount));
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (widget.gridFilter === "random") {
          setItems(data.sort(() => 0.5 - Math.random()));
        } else {
          setItems(data);
        }
      } catch (err) {
        console.error(`Error fetching grid data for ${widget.gridCategory}:`, err);
      } finally {
        setLoading(false);
      }
    };
    if (widget.gridCategory && widget.gridCategory !== "all") {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [widget]);

  // Handle fallback if they pick "all"
  if (widget.gridCategory === "all") return null;

  return (
    <section style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px", margin: 0, textTransform: "capitalize" }}>
          {widget.gridCategory === "institutions" ? <GraduationCap color="#3b82f6" /> : widget.gridCategory === "jobs" ? <Briefcase color="#8b5cf6" /> : <Users color="#10b981" />}
          {widget.title || `Featured ${widget.gridCategory}`}
        </h2>
        <Link href={`/${widget.gridCategory}`} style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
          View All <ChevronRight size={16} />
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "#64748b" }}>Loading {widget.gridCategory}...</p>
      ) : items.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {items.map(item => (
            <Link href={`/${widget.gridCategory}/${item.id}`} key={item.id} style={{ textDecoration: "none" }}>
              <div style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", overflow: "hidden", transition: "transform 0.2s", height: "100%" }}>
                {/* Generic Image Fallback */}
                <div style={{ height: "140px", background: "#0f172a", position: "relative" }}>
                  <img src={item.logo || item.image || item.photo || "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600"} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: "0.8" }} />
                  {item.isFeatured && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(234, 179, 8, 0.9)", color: "#451a03", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                      <Star size={12} fill="currentColor" /> FEATURED
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.name || item.title || item.fullName}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "12px" }}>
                    <MapPin size={14} />
                    <span>{item.city || item.location || "Multiple Locations"}</span>
                  </div>
                  {item.type && <span style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "500" }}>{item.type}</span>}
                  {item.employmentType && <span style={{ background: "rgba(139, 92, 246, 0.1)", color: "#a78bfa", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "500" }}>{item.employmentType}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "#64748b" }}>No {widget.gridCategory} found.</p>
      )}
    </section>
  );
}

function HtmlWidget({ widget }) {
  return (
    <section style={{ marginBottom: "40px", background: "#1e293b", padding: "24px", borderRadius: "12px", border: "1px solid #334155" }}>
      {widget.title && <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f8fafc", marginBottom: "16px" }}>{widget.title}</h2>}
      <div 
        className="html-widget-content"
        style={{ color: "#cbd5e1", lineHeight: "1.6" }}
        dangerouslySetInnerHTML={{ __html: widget.htmlContent }} 
      />
    </section>
  );
}

function AdWidget({ widget }) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <AdSpace placement={widget.adPlacement} />
    </section>
  );
}

function YouTubeWidget({ widget }) {
  // Extract video ID from URL or just use it directly
  let videoId = widget.youtubeId;
  if (videoId && videoId.includes("youtube.com")) {
    const url = new URL(videoId);
    videoId = url.searchParams.get("v");
  } else if (videoId && videoId.includes("youtu.be")) {
    videoId = videoId.split("youtu.be/")[1]?.split("?")[0];
  }

  if (!videoId) return null;

  return (
    <section style={{ marginBottom: "40px" }}>
      {widget.title && <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#f8fafc", marginBottom: "16px" }}>{widget.title}</h2>}
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", maxWidth: "100%", background: "#0f172a", borderRadius: "12px", border: "1px solid #334155" }}>
        <iframe 
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
          src={`https://www.youtube.com/embed/${videoId}`} 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen 
        />
      </div>
    </section>
  );
}

function SocialWidget({ widget }) {
  // A generic iframe or link based on platform
  return (
    <section style={{ marginBottom: "40px", background: "#1e293b", padding: "20px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "12px" }}>
        {widget.title || `Follow us on ${widget.socialPlatform}`}
      </h3>
      <a 
        href={widget.socialUrl} 
        target="_blank" 
        rel="noreferrer" 
        style={{ 
          display: "inline-block", padding: "10px 24px", 
          background: widget.socialPlatform === "facebook" ? "#1877F2" : widget.socialPlatform === "twitter" ? "#1DA1F2" : "#E1306C", 
          color: "white", textDecoration: "none", borderRadius: "8px", fontWeight: "600" 
        }}
      >
        View {widget.socialPlatform} Feed
      </a>
    </section>
  );
}

function AdSenseWidget({ widget }) {
  useEffect(() => {
    try {
      if (window && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  if (!widget.adClient || !widget.adSlot) {
    return (
      <section style={{ marginBottom: "40px", padding: "20px", background: "#1e293b", borderRadius: "12px", border: "1px dashed #475569", textAlign: "center", color: "#94a3b8" }}>
        Google AdSense Placeholder (Missing Client ID or Slot ID)
      </section>
    );
  }

  return (
    <section style={{ marginBottom: "40px", textAlign: "center" }}>
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client={widget.adClient}
           data-ad-slot={widget.adSlot}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </section>
  );
}
