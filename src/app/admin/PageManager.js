"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Trash2, Edit, Save, X, FileText, Link as LinkIcon, Eye } from "lucide-react";

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "published"
  });

  const fetchPages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pages"));
      const pagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPages(pagesData);
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure slug format is clean
      const cleanSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
      
      const payload = {
        ...formData,
        slug: cleanSlug,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "pages", editingId), payload);
      } else {
        await addDoc(collection(db, "pages"), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: "", slug: "", description: "", status: "published" });
      fetchPages();
    } catch (err) {
      alert("Error saving page: " + err.message);
    }
  };

  const handleEdit = (page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description || "",
      status: page.status || "published"
    });
    setEditingId(page.id);
    setShowForm(true);
  };

  const handleDelete = async (id, slug) => {
    if (slug === "home") {
      alert("You cannot delete the Home page.");
      return;
    }
    if (confirm("Delete this page? This will not delete its associated widgets, but the page will be inaccessible.")) {
      try {
        await deleteDoc(doc(db, "pages", id));
        fetchPages();
      } catch (err) {
        alert("Error deleting page: " + err.message);
      }
    }
  };

  return (
    <div className="tab-pane fade-in">
      <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 className="tab-title">Page Manager</h2>
          <p className="tab-subtitle">Create and manage custom URLs (e.g. /about-us, /contact) for your CMS.</p>
        </div>
        <button className="action-btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", slug: "", description: "", status: "published" }); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: showForm ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create New Page"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
            {editingId ? "Edit Page" : "Create New Page"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Page Title</label>
                <div style={{ position: "relative" }}>
                  <FileText size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. About Us" style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
                </div>
              </div>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>URL Slug (e.g. about-us)</label>
                <div style={{ position: "relative" }}>
                  <LinkIcon size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="about-us" disabled={formData.slug === "home"} style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: formData.slug === "home" ? "#f1f5f9" : "white" }} />
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>This will be the web address: educonnect.com/<b>slug</b></p>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>SEO Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description for search engines..." style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", minHeight: "80px", resize: "vertical" }} />
              </div>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: "white" }}>
                  <option value="published">Published (Visible)</option>
                  <option value="draft">Draft (Hidden)</option>
                </select>
              </div>

            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="action-btn-primary" style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <Save size={18} />
                {editingId ? "Update Page" : "Save Page"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Page Title</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>URL / Slug</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Status</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading pages...</td></tr>
            ) : pages.length > 0 ? (
              pages.map(page => (
                <tr key={page.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{page.title}</div>
                    {page.description && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>{page.description.substring(0, 50)}...</div>}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <a href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "#3b82f6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", background: "#eff6ff", padding: "4px 8px", borderRadius: "4px" }}>
                      <LinkIcon size={14} /> /{page.slug}
                    </a>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: page.status === "published" ? "#dcfce7" : "#f1f5f9", color: page.status === "published" ? "#166534" : "#475569", borderRadius: "999px", fontWeight: "500" }}>
                      {page.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <a href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank" rel="noreferrer" style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "6px", cursor: "pointer", display: "inline-flex" }} title="View Page">
                        <Eye size={16} />
                      </a>
                      <button onClick={() => handleEdit(page)} style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#3b82f6", borderRadius: "6px", cursor: "pointer" }} title="Edit Details">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(page.id, page.slug)} disabled={page.slug === "home"} style={{ padding: "8px", background: "white", border: "1px solid #fca5a5", color: page.slug === "home" ? "#fca5a5" : "#ef4444", borderRadius: "6px", cursor: page.slug === "home" ? "not-allowed" : "pointer" }} title="Delete Page">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No pages found. <br/><br/>
                  <button onClick={() => {
                    addDoc(collection(db, "pages"), { title: "Home Page", slug: "home", status: "published", createdAt: new Date().toISOString() }).then(() => fetchPages());
                  }} className="action-btn-primary" style={{ padding: "8px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Initialize Default Home Page
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
