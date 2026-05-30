"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import WidgetRenderer from "../../components/widgets/WidgetRenderer";
import { notFound } from "next/navigation";

export default function DynamicPage({ params }) {
  const { slug } = params;
  
  const [pageData, setPageData] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check if the page exists in the 'pages' collection
        const pQuery = query(collection(db, "pages"), where("slug", "==", slug));
        const pSnapshot = await getDocs(pQuery);
        
        if (pSnapshot.empty) {
          // If page doesn't exist, we trigger 404
          notFound();
          return;
        }

        const pDoc = pSnapshot.docs[0].data();
        
        // If it's a draft, maybe we shouldn't show it unless admin. For now, we just show if it's published.
        if (pDoc.status === "draft") {
          notFound();
          return;
        }
        
        setPageData(pDoc);

        // 2. Fetch widgets for this pageId
        const wQuery = query(collection(db, "widgets"), where("pageId", "==", slug));
        const wSnapshot = await getDocs(wQuery);
        const wData = wSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setWidgets(wData.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching dynamic page:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="dark-premium-theme" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#94a3b8", fontSize: "1.2rem" }}>Loading {slug}...</p>
      </div>
    );
  }

  if (!pageData) return null;

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
        .cms-main { flex: 1; min-width: 0; }
        .cms-sidebar { width: 300px; flex-shrink: 0; }
        @media (max-width: 1024px) {
          .cms-layout { flex-direction: column; }
          .cms-sidebar { width: 100%; }
        }
      `}} />

      <div className="cms-layout">
        {leftSidebar.length > 0 && (
          <aside className="cms-sidebar">
            {leftSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
          </aside>
        )}

        <main className="cms-main">
          {mainContent.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              <h2>{pageData.title}</h2>
              <p>This page has no content widgets assigned to it yet.</p>
            </div>
          ) : (
            mainContent.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)
          )}
        </main>

        {rightSidebar.length > 0 && (
          <aside className="cms-sidebar">
            {rightSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
          </aside>
        )}
      </div>
    </div>
  );
}
