"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Plus, Trash2, Edit, Save, X, FileText, Link as LinkIcon, Eye, Image as ImageIcon, Layout, MoveUp, MoveDown, Copy } from "lucide-react";

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const defaultForm = {
    title: "",
    slug: "",
    description: "",
    status: "published",
    layout: "wide",
    isTemplate: false,
    components: []
  };

  const [formData, setFormData] = useState(defaultForm);

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
      setFormData(defaultForm);
      fetchPages();
    } catch (err) {
      alert("Error saving page: " + err.message);
    }
  };

  const handleEdit = (page) => {
    setFormData({
      title: page.title || "",
      slug: page.slug || "",
      description: page.description || "",
      status: page.status || "published",
      layout: page.layout || "wide",
      isTemplate: page.isTemplate || false,
      components: page.components || []
    });
    setEditingId(page.id);
    setShowForm(true);
  };

  const handleDelete = async (id, slug) => {
    if (slug === "home") {
      alert("You cannot delete the Home page.");
      return;
    }
    if (confirm("Delete this page? This will permanently remove it.")) {
      try {
        await deleteDoc(doc(db, "pages", id));
        fetchPages();
      } catch (err) {
        alert("Error deleting page: " + err.message);
      }
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = pages.find(p => p.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        layout: template.layout || "wide",
        components: JSON.parse(JSON.stringify(template.components || []))
      });
    }
  };

  // --- Component Builder Logic ---
  const addComponent = (type) => {
    const newComponent = { id: Date.now().toString(), type, props: {} };
    if (type === "hero") {
      newComponent.props = { title: "", subtitle: "", imageUrl: "", buttonText: "", buttonLink: "" };
    } else if (type === "text") {
      newComponent.props = { content: "" };
    }
    setFormData({ ...formData, components: [...formData.components, newComponent] });
  };

  const removeComponent = (index) => {
    const newComps = [...formData.components];
    newComps.splice(index, 1);
    setFormData({ ...formData, components: newComps });
  };

  const moveComponent = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === formData.components.length - 1) return;
    const newComps = [...formData.components];
    const temp = newComps[index];
    newComps[index] = newComps[index + direction];
    newComps[index + direction] = temp;
    setFormData({ ...formData, components: newComps });
  };

  const updateComponentProps = (index, key, value) => {
    const newComps = [...formData.components];
    newComps[index].props[key] = value;
    setFormData({ ...formData, components: newComps });
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `pages/hero/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      updateComponentProps(index, "imageUrl", url);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const templates = pages.filter(p => p.isTemplate);
  const normalPages = pages.filter(p => !p.isTemplate);

  return (
    <div className="tab-pane fade-in">
      <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 className="tab-title">Page Builder & CMS</h2>
          <p className="tab-subtitle">Design your pages using layouts and widgets.</p>
        </div>
        <button className="action-btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(defaultForm); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: showForm ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create New Page"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
            <span>{editingId ? "Edit Page/Template" : "Create New Page"}</span>
            <div style={{ fontSize: "0.9rem", display: "flex", gap: "12px", alignItems: "center", fontWeight: "500" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input type="checkbox" checked={formData.isTemplate} onChange={e => setFormData({...formData, isTemplate: e.target.checked})} />
                Save as Template
              </label>
            </div>
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
              
              {/* Basic Info */}
              {!editingId && templates.length > 0 && (
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Copy from Template (Optional)</label>
                  <select onChange={e => handleTemplateSelect(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                    <option value="">-- Select a template --</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Page Title</label>
                <div style={{ position: "relative" }}>
                  <FileText size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. About Us" style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
                </div>
              </div>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>URL Slug</label>
                <div style={{ position: "relative" }}>
                  <LinkIcon size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="about-us" disabled={formData.slug === "home"} style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: formData.slug === "home" ? "#f1f5f9" : "white" }} />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Page Layout</label>
                <div style={{ display: "flex", gap: "16px" }}>
                  {["wide", "left-sidebar", "right-sidebar", "both-sidebars"].map(lyt => (
                    <div 
                      key={lyt} 
                      onClick={() => setFormData({...formData, layout: lyt})}
                      style={{ flex: 1, padding: "16px", border: formData.layout === lyt ? "2px solid #3b82f6" : "1px solid #e2e8f0", borderRadius: "8px", textAlign: "center", cursor: "pointer", background: formData.layout === lyt ? "#eff6ff" : "white", fontWeight: formData.layout === lyt ? "700" : "500", color: formData.layout === lyt ? "#1d4ed8" : "#64748b" }}
                    >
                      <Layout size={24} style={{ margin: "0 auto 8px auto" }} />
                      <div style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>{lyt.replace("-", " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Page Builder Sections */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>Page Sections</h4>
              
              {formData.components.length === 0 ? (
                <div style={{ padding: "40px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
                  <p>This page has no content yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {formData.components.map((comp, idx) => (
                    <div key={comp.id} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <div style={{ background: "#f1f5f9", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontWeight: "700", fontSize: "0.85rem", color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>{comp.type} Section</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button type="button" onClick={() => moveComponent(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "#64748b" }}><MoveUp size={16} /></button>
                          <button type="button" onClick={() => moveComponent(idx, 1)} disabled={idx === formData.components.length - 1} style={{ background: "none", border: "none", cursor: idx === formData.components.length - 1 ? "not-allowed" : "pointer", color: "#64748b" }}><MoveDown size={16} /></button>
                          <button type="button" onClick={() => removeComponent(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div style={{ padding: "16px", background: "white", display: "flex", flexDirection: "column", gap: "12px" }}>
                        
                        {comp.type === "hero" && (
                          <>
                            <input type="text" placeholder="Hero Headline" value={comp.props.title} onChange={e => updateComponentProps(idx, "title", e.target.value)} style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                            <textarea placeholder="Hero Subtitle" value={comp.props.subtitle} onChange={e => updateComponentProps(idx, "subtitle", e.target.value)} style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", resize: "vertical" }} />
                            
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                              <div style={{ flex: 1, position: "relative" }}>
                                <ImageIcon size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "9px" }} />
                                <input type="text" placeholder="Image URL or Upload ->" value={comp.props.imageUrl} onChange={e => updateComponentProps(idx, "imageUrl", e.target.value)} style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                              </div>
                              <label style={{ background: "#f1f5f9", padding: "8px 16px", borderRadius: "6px", fontSize: "0.85rem", cursor: "pointer", border: "1px solid #cbd5e1", fontWeight: "600" }}>
                                {uploadingImage ? "Uploading..." : "Upload File"}
                                <input type="file" style={{ display: "none" }} accept="image/*" onChange={(e) => handleImageUpload(e, idx)} disabled={uploadingImage} />
                              </label>
                            </div>
                            <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "-6px 0 0 0" }}>Recommended size: 1920x1080px (Landscape)</p>

                            <div style={{ display: "flex", gap: "12px" }}>
                              <input type="text" placeholder="Button Text (e.g. Learn More)" value={comp.props.buttonText} onChange={e => updateComponentProps(idx, "buttonText", e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                              <input type="text" placeholder="Button Link URL (e.g. /jobs)" value={comp.props.buttonLink} onChange={e => updateComponentProps(idx, "buttonLink", e.target.value)} style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                            </div>
                          </>
                        )}

                        {comp.type === "text" && (
                          <textarea placeholder="Write content here..." value={comp.props.content} onChange={e => updateComponentProps(idx, "content", e.target.value)} rows="5" style={{ padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", resize: "vertical" }} />
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => addComponent("hero")} style={{ padding: "8px 16px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#3b82f6" }}>+ Add Hero</button>
                <button type="button" onClick={() => addComponent("text")} style={{ padding: "8px 16px", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#3b82f6" }}>+ Add Text Block</button>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
              <button type="submit" className="action-btn-primary" style={{ padding: "10px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <Save size={18} />
                {editingId ? "Update Page" : "Save Page"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pages List */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Title</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>URL Slug</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Type</th>
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
                    <div style={{ fontWeight: "600", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                      {page.title}
                      {page.isTemplate && <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>Template</span>}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <a href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "#3b82f6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", background: "#eff6ff", padding: "4px 8px", borderRadius: "4px" }}>
                      <LinkIcon size={14} /> /{page.slug}
                    </a>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "999px", fontWeight: "500", textTransform: "capitalize" }}>
                      {(page.layout || "wide").replace("-", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {!page.isTemplate && (
                        <a href={page.slug === "home" ? "/" : `/${page.slug}`} target="_blank" rel="noreferrer" style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#475569", borderRadius: "6px", cursor: "pointer", display: "inline-flex" }} title="View Page">
                          <Eye size={16} />
                        </a>
                      )}
                      {page.isTemplate && (
                        <button onClick={() => {
                          setFormData({ ...defaultForm, layout: page.layout, components: JSON.parse(JSON.stringify(page.components || [])), title: page.title + " (Copy)" });
                          setShowForm(true);
                        }} style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#10b981", borderRadius: "6px", cursor: "pointer" }} title="Create Page from Template">
                          <Copy size={16} />
                        </button>
                      )}
                      <button onClick={() => handleEdit(page)} style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#3b82f6", borderRadius: "6px", cursor: "pointer" }} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(page.id, page.slug)} disabled={page.slug === "home"} style={{ padding: "8px", background: "white", border: "1px solid #fca5a5", color: page.slug === "home" ? "#fca5a5" : "#ef4444", borderRadius: "6px", cursor: page.slug === "home" ? "not-allowed" : "pointer" }} title="Delete">
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
                    addDoc(collection(db, "pages"), { title: "Home Page", slug: "home", layout: "wide", components: [], isTemplate: false, status: "published", createdAt: new Date().toISOString() }).then(() => fetchPages());
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
