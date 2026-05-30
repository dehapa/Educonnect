"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Trash2, Edit, Save, X, Layout, Layers, Settings, Image as ImageIcon, Video, Type, Share2, Grid } from "lucide-react";

export default function WidgetManager() {
  const [pages, setPages] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters for viewing widgets
  const [filterPageId, setFilterPageId] = useState("home");
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    pageId: "home", // the slug of the page
    area: "main_content",
    type: "hero",
    order: 0,
    title: "", // internal title for admin
    
    // Dynamic parameters based on type
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    
    gridCategory: "all",
    gridCount: 4,
    gridFilter: "latest",
    
    htmlContent: "",
    
    adPlacement: "banner_standard",
    
    youtubeId: "",
    
    socialPlatform: "facebook",
    socialUrl: ""
  });

  const fetchData = async () => {
    try {
      // Fetch Pages
      const pSnapshot = await getDocs(collection(db, "pages"));
      const pData = pSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ensure "home" exists in the list even if not in DB yet for fallback
      if (!pData.find(p => p.slug === "home")) {
        pData.push({ id: "home_mock", slug: "home", title: "Home Page (Default)" });
      }
      setPages(pData);

      // Fetch Widgets
      const wSnapshot = await getDocs(collection(db, "widgets"));
      const wData = wSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setWidgets(wData.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error("Error fetching widgets data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build the clean payload
      const payload = {
        pageId: formData.pageId,
        area: formData.area,
        type: formData.type,
        order: Number(formData.order),
        title: formData.title || `${formData.type} module`,
        updatedAt: new Date().toISOString()
      };

      // Inject specific parameters based on type
      if (formData.type === "hero") {
        payload.heroTitle = formData.heroTitle;
        payload.heroSubtitle = formData.heroSubtitle;
        payload.heroImage = formData.heroImage;
      } else if (formData.type === "grid") {
        payload.gridCategory = formData.gridCategory;
        payload.gridCount = Number(formData.gridCount);
        payload.gridFilter = formData.gridFilter;
      } else if (formData.type === "html") {
        payload.htmlContent = formData.htmlContent;
      } else if (formData.type === "ad") {
        payload.adPlacement = formData.adPlacement;
      } else if (formData.type === "youtube") {
        payload.youtubeId = formData.youtubeId;
      } else if (formData.type === "social") {
        payload.socialPlatform = formData.socialPlatform;
        payload.socialUrl = formData.socialUrl;
      }

      if (editingId) {
        await updateDoc(doc(db, "widgets", editingId), payload);
      } else {
        await addDoc(collection(db, "widgets"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Error saving widget: " + err.message);
    }
  };

  const handleEdit = (widget) => {
    setFormData({
      pageId: widget.pageId || "home",
      area: widget.area || "main_content",
      type: widget.type || "hero",
      order: widget.order || 0,
      title: widget.title || "",
      
      heroTitle: widget.heroTitle || "",
      heroSubtitle: widget.heroSubtitle || "",
      heroImage: widget.heroImage || "",
      gridCategory: widget.gridCategory || "all",
      gridCount: widget.gridCount || 4,
      gridFilter: widget.gridFilter || "latest",
      htmlContent: widget.htmlContent || "",
      adPlacement: widget.adPlacement || "banner_standard",
      youtubeId: widget.youtubeId || "",
      socialPlatform: widget.socialPlatform || "facebook",
      socialUrl: widget.socialUrl || ""
    });
    setEditingId(widget.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Remove this widget from the page?")) {
      try {
        await deleteDoc(doc(db, "widgets", id));
        fetchData();
      } catch (err) {
        alert("Error deleting widget: " + err.message);
      }
    }
  };

  const renderWidgetIcon = (type) => {
    switch (type) {
      case "hero": return <ImageIcon size={16} color="#3b82f6" />;
      case "grid": return <Grid size={16} color="#8b5cf6" />;
      case "html": return <Type size={16} color="#10b981" />;
      case "ad": return <Layers size={16} color="#f59e0b" />;
      case "youtube": return <Video size={16} color="#ef4444" />;
      case "social": return <Share2 size={16} color="#ec4899" />;
      default: return <Settings size={16} />;
    }
  };

  // Filter widgets by selected page
  const filteredWidgets = widgets.filter(w => w.pageId === filterPageId);

  // Group filtered widgets by Area
  const mainContentWidgets = filteredWidgets.filter(w => w.area === "main_content");
  const leftSidebarWidgets = filteredWidgets.filter(w => w.area === "left_sidebar");
  const rightSidebarWidgets = filteredWidgets.filter(w => w.area === "right_sidebar");

  return (
    <div className="tab-pane fade-in">
      <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 className="tab-title">Widget Manager (CMS)</h2>
          <p className="tab-subtitle">Build dynamic layouts by assigning modules to page areas.</p>
        </div>
        <button className="action-btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: showForm ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Add New Widget"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
            {editingId ? "Edit Widget Settings" : "Configure New Widget"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Widget Title (Admin only)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Homepage Top Banner" style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Assign to Page</label>
                <select value={formData.pageId} onChange={e => setFormData({...formData, pageId: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: "white" }}>
                  {pages.map(p => (
                    <option key={p.id} value={p.slug}>/{p.slug} - {p.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Widget Area / Zone</label>
                <select value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: "white" }}>
                  <option value="main_content">Main Content (Center)</option>
                  <option value="left_sidebar">Left Sidebar</option>
                  <option value="right_sidebar">Right Sidebar</option>
                  <option value="top_header">Top Full-Width Header</option>
                  <option value="bottom_footer">Bottom Full-Width Footer</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Display Order</label>
                <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>Lower numbers appear first (e.g. 0 is top)</p>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1", background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "1rem", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>Widget Type</label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {[
                    { id: "hero", label: "Hero Banner", icon: <ImageIcon size={16}/> },
                    { id: "grid", label: "Dynamic Grid", icon: <Grid size={16}/> },
                    { id: "html", label: "Custom HTML", icon: <Type size={16}/> },
                    { id: "ad", label: "Ad Banner", icon: <Layers size={16}/> },
                    { id: "youtube", label: "YouTube Embed", icon: <Video size={16}/> },
                    { id: "social", label: "Social Stream", icon: <Share2 size={16}/> }
                  ].map(type => (
                    <button 
                      key={type.id} 
                      type="button"
                      onClick={() => setFormData({...formData, type: type.id})}
                      style={{ 
                        display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", 
                        background: formData.type === type.id ? "#eff6ff" : "white", 
                        border: formData.type === type.id ? "2px solid #3b82f6" : "1px solid #cbd5e1",
                        color: formData.type === type.id ? "#1d4ed8" : "#475569",
                        borderRadius: "8px", cursor: "pointer", fontWeight: "500", transition: "all 0.2s"
                      }}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DYNAMIC PARAMETER SECTION */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#1e293b", marginBottom: "16px" }}>Widget Parameters</h4>
              
              {formData.type === "hero" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Headline Title</label>
                    <input type="text" value={formData.heroTitle} onChange={e => setFormData({...formData, heroTitle: e.target.value})} placeholder="Welcome to EduConnect" style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Subtitle</label>
                    <input type="text" value={formData.heroSubtitle} onChange={e => setFormData({...formData, heroSubtitle: e.target.value})} placeholder="Find the best institutions..." style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Background Image URL</label>
                    <input type="url" value={formData.heroImage} onChange={e => setFormData({...formData, heroImage: e.target.value})} placeholder="https://..." style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                  </div>
                </div>
              )}

              {formData.type === "grid" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Data Source Category</label>
                    <select value={formData.gridCategory} onChange={e => setFormData({...formData, gridCategory: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white" }}>
                      <option value="institutions">Institutions</option>
                      <option value="jobs">Jobs</option>
                      <option value="students">Students</option>
                      <option value="teachers">Teachers</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Number of items to show</label>
                    <input type="number" min="1" max="20" value={formData.gridCount} onChange={e => setFormData({...formData, gridCount: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Filtering Rule</label>
                    <select value={formData.gridFilter} onChange={e => setFormData({...formData, gridFilter: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white" }}>
                      <option value="latest">Latest Added</option>
                      <option value="featured">Featured Only (Gold Star)</option>
                      <option value="random">Randomize</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.type === "html" && (
                <div className="form-group">
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Rich Text / HTML Content</label>
                  <textarea value={formData.htmlContent} onChange={e => setFormData({...formData, htmlContent: e.target.value})} placeholder="<h2>Hello</h2><p>Welcome to our site...</p>" style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", minHeight: "150px", fontFamily: "monospace", fontSize: "0.9rem" }} />
                </div>
              )}

              {formData.type === "ad" && (
                <div className="form-group">
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Target Ad Placement</label>
                  <select value={formData.adPlacement} onChange={e => setFormData({...formData, adPlacement: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white" }}>
                    <option value="banner_standard">Standard Horizontal Banner</option>
                    <option value="sidebar_square">Sidebar Square</option>
                    <option value="hero_billboard">Hero Billboard</option>
                    <option value="in_feed">In-Feed Grid Square</option>
                  </select>
                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>The widget will automatically fetch a live advertisement from the Ad Manager matching this size.</p>
                </div>
              )}

              {formData.type === "youtube" && (
                <div className="form-group">
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>YouTube Video ID or Link</label>
                  <input type="text" value={formData.youtubeId} onChange={e => setFormData({...formData, youtubeId: e.target.value})} placeholder="e.g. dQw4w9WgXcQ" style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                </div>
              )}

              {formData.type === "social" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Platform</label>
                    <select value={formData.socialPlatform} onChange={e => setFormData({...formData, socialPlatform: e.target.value})} style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white" }}>
                      <option value="facebook">Facebook Feed</option>
                      <option value="twitter">Twitter / X Stream</option>
                      <option value="instagram">Instagram Grid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Page URL / Handle</label>
                    <input type="text" value={formData.socialUrl} onChange={e => setFormData({...formData, socialUrl: e.target.value})} placeholder="https://facebook.com/educonnect" style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="action-btn-primary" style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <Save size={18} />
                {editingId ? "Update Widget" : "Save Widget"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WIDGET LAYOUT VIEWER */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#1e293b" }}>Site Layout Designer</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "500" }}>Viewing Page:</span>
            <select value={filterPageId} onChange={e => setFilterPageId(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: "#f8fafc", fontWeight: "600", color: "#1e293b" }}>
              {pages.map(p => (
                <option key={p.id} value={p.slug}>/{p.slug} - {p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading widgets...</p>
        ) : (
          <div style={{ display: "flex", gap: "20px", background: "#f1f5f9", padding: "20px", borderRadius: "8px", minHeight: "400px" }}>
            
            {/* Left Sidebar */}
            <div style={{ width: "250px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", letterSpacing: "1px", marginBottom: "4px" }}>Left Sidebar</div>
              {leftSidebarWidgets.length === 0 ? (
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>Empty Zone</div>
              ) : (
                leftSidebarWidgets.map(w => (
                  <WidgetCard key={w.id} widget={w} onEdit={handleEdit} onDelete={handleDelete} renderIcon={renderWidgetIcon} />
                ))
              )}
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", letterSpacing: "1px", marginBottom: "4px" }}>Main Content</div>
              {mainContentWidgets.length === 0 ? (
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>Empty Main Content Zone</div>
              ) : (
                mainContentWidgets.map(w => (
                  <WidgetCard key={w.id} widget={w} onEdit={handleEdit} onDelete={handleDelete} renderIcon={renderWidgetIcon} />
                ))
              )}
            </div>

            {/* Right Sidebar */}
            <div style={{ width: "250px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "#64748b", letterSpacing: "1px", marginBottom: "4px" }}>Right Sidebar</div>
              {rightSidebarWidgets.length === 0 ? (
                <div style={{ border: "2px dashed #cbd5e1", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem" }}>Empty Zone</div>
              ) : (
                rightSidebarWidgets.map(w => (
                  <WidgetCard key={w.id} widget={w} onEdit={handleEdit} onDelete={handleDelete} renderIcon={renderWidgetIcon} />
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function WidgetCard({ widget, onEdit, onDelete, renderIcon }) {
  return (
    <div style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "relative", transition: "transform 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        {renderIcon(widget.type)}
        <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#1e293b", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{widget.title}</span>
        <span style={{ fontSize: "0.7rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>Order: {widget.order}</span>
      </div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ textTransform: "capitalize" }}>{widget.type} Module</span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => onEdit(widget)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", padding: "2px" }}><Edit size={14} /></button>
          <button onClick={() => onDelete(widget.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}
