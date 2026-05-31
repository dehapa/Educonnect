"use client";
import { useState } from "react";
import { collection, addDoc, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export default function SetupPage() {
  const [status, setStatus] = useState("Idle");

  const seedWidgets = async () => {
    setStatus("Seeding...");
    try {
      const widgetsRef = collection(db, 'widgets');

      // 1. Clear existing home widgets
      const q = query(widgetsRef, where('pageId', '==', 'home'));
      const existing = await getDocs(q);
      for (const docSnapshot of existing.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      
      // 2. Add new layout widgets
      const newWidgets = [
        {
          pageId: "home",
          area: "top_header",
          type: "hero",
          order: 0,
          title: "Main Hero Banner",
          heroTitle: "Welcome to EduConnect",
          heroSubtitle: "Find the best institutions, courses, and jobs to accelerate your career.",
          heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          pageId: "home",
          area: "main_content",
          type: "grid",
          order: 1,
          title: "Featured Institutions",
          gridCategory: "institutions",
          gridCount: 6,
          gridFilter: "latest",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          pageId: "home",
          area: "main_content",
          type: "grid",
          order: 2,
          title: "Latest Jobs",
          gridCategory: "jobs",
          gridCount: 6,
          gridFilter: "latest",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          pageId: "home",
          area: "main_content",
          type: "html",
          order: 3,
          title: "Welcome Text",
          htmlContent: "<div style='text-align: center; padding: 40px;'><h2 style='color: #f8fafc'>Join our growing community</h2><p style='color: #94a3b8; font-size: 1.1rem'>Whether you are a student looking for the right path, or an employer looking for talent, EduConnect is here.</p></div>",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          pageId: "home",
          area: "right_sidebar",
          type: "network-feed",
          order: 0,
          title: "Community Feed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          pageId: "home",
          area: "right_sidebar",
          type: "adsense",
          order: 1,
          title: "Sidebar AdSense",
          adClient: "ca-pub-123456789", // Placeholder
          adSlot: "987654321", // Placeholder
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const widget of newWidgets) {
        await addDoc(widgetsRef, widget);
      }

      setStatus("Success! Homepage layout seeded. You can now delete this page.");
    } catch (error) {
      console.error(error);
      setStatus("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", background: "#0B1120", color: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Homepage Setup Tool</h1>
      <p style={{ color: "#94a3b8", marginBottom: "20px" }}>
        Since the backend script was blocked by Firebase security rules, this temporary page runs securely inside your authenticated browser session to set up the default homepage layout.
      </p>
      
      <button 
        onClick={seedWidgets}
        style={{ padding: "12px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "1.1rem" }}
      >
        Seed Homepage Layout Now
      </button>

      <div style={{ marginTop: "24px", padding: "16px", background: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
        <strong>Status:</strong> <span style={{ color: status.includes("Success") ? "#10b981" : status.includes("Error") ? "#ef4444" : "#f8fafc" }}>{status}</span>
      </div>
    </div>
  );
}
