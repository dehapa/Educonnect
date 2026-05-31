"use client";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AdSlot({ area, width = "100%", height = "auto", minHeight = "120px" }) {
  const [adContent, setAdContent] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const snap = await getDocs(collection(db, "advertisements"));
        const ads = snap.docs.map(doc => doc.data());
        // Find an active ad matching the requested area
        const targetAd = ads.find(ad => ad.area === area && ad.isActive);
        if (targetAd) {
          setAdContent(targetAd);
        }
      } catch (err) {
        console.error("Error fetching ad for slot:", err);
      }
    };
    fetchAd();
  }, [area]);

  return (
    <div style={{
      width: width,
      height: height,
      minHeight: minHeight,
      background: "#1e293b",
      border: "1px dashed #334155",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
      margin: "20px 0"
    }}>
      <div style={{
        position: "absolute",
        top: "4px",
        right: "8px",
        fontSize: "0.6rem",
        color: "#64748b",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "1px",
        zIndex: 2
      }}>
        Advertisement
      </div>
      
      {adContent ? (
        adContent.type === "image" ? (
          <a href={adContent.linkUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
            <img src={adContent.imageUrl} alt="Ad" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </a>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: adContent.code }} style={{ width: "100%", height: "100%" }} />
        )
      ) : (
        <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
          <span style={{ display: "block", fontSize: "0.85rem" }}>Space available for Advertisement</span>
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>AdSense Fallback</span>
        </div>
      )}
    </div>
  );
}
