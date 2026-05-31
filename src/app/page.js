"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import WidgetRenderer from "../components/widgets/WidgetRenderer";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function Home() {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const q = query(
          collection(db, "widgets"), 
          where("pageId", "==", "home")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by order since we don't have a composite index for pageId + order yet
        setWidgets(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching homepage widgets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  if (loading) {
    return (
      <div className="dark-premium-theme" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#94a3b8", fontSize: "1.2rem" }}>Loading EduConnect...</p>
      </div>
    );
  }

  const mainContent = widgets.filter(w => w.area === "main_content" || w.area === "top_header");
  const leftSidebar = widgets.filter(w => w.area === "left_sidebar");
  const rightSidebar = widgets.filter(w => w.area === "right_sidebar");

  return (
    <div className="dark-premium-theme">
      {/* GLOBAL DARK THEME STYLES SPECIFIC TO HOME PAGE */}
      <style dangerouslySetInnerHTML={{__html: `
        .dark-premium-theme {
          background-color: #0B1120;
          color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 60px;
        }
        .dark-premium-theme a { text-decoration: none; }
        .cms-layout { display: flex; gap: 30px; max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
        .cms-main { flex: 1; min-width: 0; order: 2; }
        .cms-sidebar { width: 300px; flex-shrink: 0; }
        .cms-sidebar.left-sidebar { order: 1; }
        .cms-sidebar.right-sidebar { order: 3; }
        @media (max-width: 1024px) {
          .cms-layout { flex-direction: column; }
          .cms-sidebar { width: 100%; }
          .cms-sidebar.left-sidebar { display: none; }
          .cms-main { order: 1; }
          .cms-sidebar.right-sidebar { order: 2; }
        }
      `}} />

      {widgets.length === 0 ? (
        <div style={{ maxWidth: "800px", margin: "100px auto", textAlign: "center", padding: "40px", background: "#1e293b", borderRadius: "16px", border: "1px dashed #334155" }}>
          <h1 style={{ fontSize: "2rem", color: "#f8fafc", marginBottom: "16px" }}>Welcome to your new CMS!</h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "24px" }}>
            Your homepage is currently empty because you haven't added any widgets yet.
          </p>
          <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#3b82f6", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "600" }}>
            <Settings size={20} /> Go to Widget Manager
          </Link>
        </div>
      ) : (
        <div className="cms-layout">
          {leftSidebar.length > 0 && (
            <aside className="cms-sidebar left-sidebar">
              {leftSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
            </aside>
          )}

          <main className="cms-main">
            {mainContent.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
          </main>

          {rightSidebar.length > 0 && (
            <aside className="cms-sidebar right-sidebar">
              {rightSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
