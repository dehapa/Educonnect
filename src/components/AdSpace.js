"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AdSpace({ location = "", category = "all", style = {} }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adsRef = collection(db, "advertisements");
        let q;
        
        // 1. First try to find a highly targeted ad (Location + Category)
        if (location) {
          q = query(adsRef, where("targetLocation", "==", location), where("targetCategory", "==", category));
          let snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const ads = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
            setAd(ads[Math.floor(Math.random() * ads.length)]);
            return;
          }
          
          // 2. Fallback to Location + "all" category
          q = query(adsRef, where("targetLocation", "==", location), where("targetCategory", "==", "all"));
          snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const ads = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
            setAd(ads[Math.floor(Math.random() * ads.length)]);
            return;
          }
        }

        // 3. Fallback to Global + Category
        q = query(adsRef, where("targetLocation", "==", ""), where("targetCategory", "==", category));
        let snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const ads = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
          setAd(ads[Math.floor(Math.random() * ads.length)]);
          return;
        }

        // 4. Final Fallback to Global + "all"
        q = query(adsRef, where("targetLocation", "==", ""), where("targetCategory", "==", "all"));
        snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const ads = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
          setAd(ads[Math.floor(Math.random() * ads.length)]);
        }

      } catch (err) {
        console.error("Error loading ad space:", err);
      }
    };
    
    fetchAd();
  }, [location, category]);

  if (!ad) return null;

  return (
    <div className="ad-space" style={{ 
      margin: "20px 0", 
      borderRadius: "12px", 
      overflow: "hidden", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      position: "relative",
      ...style 
    }}>
      <a href={ad.linkUrl} target="_blank" rel="noreferrer" style={{ display: "block" }}>
        <img src={ad.adImage} alt={ad.title} style={{ width: "100%", height: "auto", display: "block" }} />
      </a>
      <div style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "rgba(0,0,0,0.5)",
        color: "white",
        fontSize: "0.7rem",
        padding: "2px 6px",
        borderRadius: "4px",
        backdropFilter: "blur(4px)"
      }}>
        Sponsored
      </div>
    </div>
  );
}
