"use client";
import { useState, useEffect, use } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import WidgetRenderer from "../components/widgets/WidgetRenderer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { limit as firestoreLimit } from "firebase/firestore";
import ShareButtons from "../components/ShareButtons";
import SearchWidget from "../components/widgets/SearchWidget";

function DynamicDataFeed({ dataType, limit, displayStyle, title }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, dataType), firestoreLimit(limit || 2));
        const snapshot = await getDocs(q);
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data feed:", err);
      } finally {
        setLoading(false);
      }
    };
    if (dataType) fetchData();
  }, [dataType, limit]);

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading {dataType}...</div>;
  if (data.length === 0) return <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No {dataType} found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155", paddingBottom: "12px", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "white" }}>{title}</h3>
          <Link href={`/${dataType}`} style={{ fontSize: "0.85rem", color: "#94a3b8", textDecoration: "none" }}>See All {title.split(" ")[1] || ""} &gt;</Link>
        </div>
      )}

      {displayStyle === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "16px" }}>
          {data.map(item => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", background: "#1e293b", padding: "16px 12px", borderRadius: "12px", border: "1px solid #334155", textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", margin: "0 auto 12px auto", border: "2px solid #3b82f6" }}>
                {item.logo || item.logoUrl || item.image ? (
                  <img src={item.logo || item.logoUrl || item.image} alt={item.title || item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.2rem", color: "#94a3b8", fontWeight: "700" }}>{(item.title || item.name || "?").charAt(0)}</span>
                )}
              </div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: "700", color: "white" }}>{item.title || item.name}</h4>
              <p style={{ margin: "0 0 10px 0", fontSize: "0.75rem", color: "#94a3b8", flex: 1 }}>{item.location || item.category || dataType}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginBottom: "12px" }}>
                <span style={{ color: "#fbbf24", fontSize: "0.8rem" }}>★★★★★</span>
                <span style={{ color: "#64748b", fontSize: "0.7rem", alignSelf: "center" }}>({Math.floor(Math.random() * 50) + 10})</span>
              </div>
              <Link href={`/${dataType}/${item.id}`} style={{ padding: "6px 12px", background: "transparent", color: "#3b82f6", border: "1px solid #3b82f6", borderRadius: "6px", textDecoration: "none", fontSize: "0.75rem", fontWeight: "600", width: "100%", boxSizing: "border-box" }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {data.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", background: "#1e293b", padding: "16px", borderRadius: "12px", border: "1px solid #334155" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "8px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {item.logo || item.logoUrl || item.image ? (
                  <img src={item.logo || item.logoUrl || item.image} alt={item.title || item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.2rem", color: "#94a3b8", fontWeight: "700" }}>{(item.title || item.name || "?").charAt(0)}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "white" }}>{item.title || item.name}</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94a3b8" }}>{item.location || item.category || dataType}</p>
              </div>
              <Link href={`/${dataType}/${item.id}`} style={{ padding: "6px 16px", background: "#3b82f6", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "600" }}>
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const slug = "home";
  
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
          notFound();
          return;
        }

        const pDoc = pSnapshot.docs[0].data();
        
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

  const leftSidebar = widgets.filter(w => w.area === "left_sidebar");
  const rightSidebar = widgets.filter(w => w.area === "right_sidebar");
  const topHeaderWidgets = widgets.filter(w => w.area === "top_header");

  const layout = pageData.layout || "wide";
  const components = pageData.components || [];

  return (
    <div className="dark-premium-theme">
      {/* GLOBAL DARK THEME STYLES */}
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

        /* Page Builder Components */
        .pb-hero {
          position: relative;
          padding: 80px 20px;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 30px;
          min-height: 400px;
          background-size: cover;
          background-position: center;
          background-color: #1e293b;
        }
        .pb-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(11, 17, 32, 0.7);
          z-index: 1;
        }
        .pb-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        .pb-hero-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .pb-hero-subtitle {
          font-size: 1.25rem;
          color: #cbd5e1;
          margin-bottom: 32px;
          line-height: 1.6;
        }
        .pb-btn {
          display: inline-block;
          padding: 12px 28px;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: background 0.2s;
        }
        .pb-btn:hover { background: #2563eb; }

        .pb-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #94a3b8;
          margin-bottom: 30px;
          white-space: pre-wrap;
        }
      `}} />

      {/* Top Header Widgets */}
      {topHeaderWidgets.length > 0 && (
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
          {topHeaderWidgets.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
        </div>
      )}

      <div className="cms-layout">
        {(layout === "left-sidebar" || layout === "both-sidebars") && (
          <aside className="cms-sidebar">
            {leftSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
            {leftSidebar.length === 0 && <div style={{ color: "#475569", fontStyle: "italic", padding: "20px" }}>Empty Left Sidebar</div>}
          </aside>
        )}

        <main className="cms-main">
          {components.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              <h2>{pageData.title}</h2>
              <p>This page has no components configured in the Page Builder.</p>
            </div>
          ) : (
            components.map((comp, idx) => {
              if (comp.type === "hero") {
                return (
                  <div key={idx} className="pb-hero" style={{ backgroundImage: comp.props.imageUrl ? `url(${comp.props.imageUrl})` : 'none' }}>
                    <div className="pb-hero-content">
                      {comp.props.title && <h1 className="pb-hero-title">{comp.props.title}</h1>}
                      {comp.props.subtitle && <p className="pb-hero-subtitle">{comp.props.subtitle}</p>}
                      {comp.props.buttonText && comp.props.buttonLink && (
                        <Link href={comp.props.buttonLink} className="pb-btn">
                          {comp.props.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              }
              if (comp.type === "text") {
                return <div key={idx} className="pb-text">{comp.props.content}</div>;
              }
              if (comp.type === "image") {
                return (
                  <div key={idx} style={{ marginBottom: "30px", textAlign: "center" }}>
                    {comp.props.imageUrl ? (
                      <img src={comp.props.imageUrl} alt="Page Image" style={{ maxWidth: "100%", height: "auto", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }} />
                    ) : null}
                  </div>
                );
              }
              if (comp.type === "grid") {
                return (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: `repeat(${comp.props.columnCount || 2}, 1fr)`, gap: "24px", marginBottom: "30px" }}>
                    {(comp.props.columns || []).map((col, cIdx) => (
                      <div key={cIdx} style={{ display: "flex", flexDirection: "column" }}>
                        {col.type === "text" && (
                          <div className="pb-text" dangerouslySetInnerHTML={{ __html: col.props.content }} />
                        )}
                        {col.type === "image" && col.props.imageUrl && (
                          <img src={col.props.imageUrl} alt="" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
                        )}
                        {col.type === "search_bar" && (
                          <SearchWidget placeholder={col.props.placeholder} />
                        )}
                        {col.type === "data" && (
                          <DynamicDataFeed dataType={col.props.dataType} limit={col.props.limit} displayStyle={col.props.displayStyle} title={col.props.title} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })
          )}
          
          {/* Universal Share Component for all pages */}
          {pageData && (
            <div style={{ marginTop: "40px" }}>
              <ShareButtons title={pageData.title || slug} description={`Check out ${pageData.title || slug} on EduConnect!`} />
            </div>
          )}
        </main>

        {(layout === "right-sidebar" || layout === "both-sidebars") && (
          <aside className="cms-sidebar">
            {rightSidebar.map(widget => <WidgetRenderer key={widget.id} widget={widget} />)}
            {rightSidebar.length === 0 && <div style={{ color: "#475569", fontStyle: "italic", padding: "20px" }}>Empty Right Sidebar</div>}
          </aside>
        )}
      </div>
    </div>
  );
}
