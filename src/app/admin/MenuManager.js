"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Trash2, Edit, Save, X, MoveUp, MoveDown, List as ListIcon } from "lucide-react";

export default function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultForm = {
    name: "",
    location: "header",
    status: "active",
    links: []
  };

  const [formData, setFormData] = useState(defaultForm);

  const fetchMenus = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "menus"));
      const menusData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenus(menusData);
    } catch (err) {
      console.error("Error fetching menus:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "menus", editingId), { ...formData, updatedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, "menus"), { ...formData, createdAt: new Date().toISOString() });
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(defaultForm);
      fetchMenus();
    } catch (err) {
      alert("Error saving menu: " + err.message);
    }
  };

  const handleEdit = (menu) => {
    setFormData({
      name: menu.name || "",
      location: menu.location || "header",
      status: menu.status || "active",
      links: menu.links || []
    });
    setEditingId(menu.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this menu? It will no longer show up on the site.")) {
      try {
        await deleteDoc(doc(db, "menus", id));
        fetchMenus();
      } catch (err) {
        alert("Error deleting menu: " + err.message);
      }
    }
  };

  // Link Builder Logic
  const addLink = () => {
    setFormData({ ...formData, links: [...formData.links, { label: "", url: "" }] });
  };

  const removeLink = (index) => {
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData({ ...formData, links: newLinks });
  };

  const moveLink = (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === formData.links.length - 1) return;
    const newLinks = [...formData.links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + direction];
    newLinks[index + direction] = temp;
    setFormData({ ...formData, links: newLinks });
  };

  const updateLink = (index, key, value) => {
    const newLinks = [...formData.links];
    newLinks[index][key] = value;
    setFormData({ ...formData, links: newLinks });
  };

  return (
    <div className="tab-pane fade-in">
      <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 className="tab-title">Menu Builder</h2>
          <p className="tab-subtitle">Create and assign navigation menus across your website.</p>
        </div>
        <button className="action-btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(defaultForm); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: showForm ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Create New Menu"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>
            {editingId ? "Edit Menu" : "Create New Menu"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #e2e8f0" }}>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Menu Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Main Header Menu" style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
              </div>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Location Assigned</label>
                <select value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", background: "white" }}>
                  <option value="header">Header Navigation</option>
                  <option value="footer_col_1">Footer Column 1</option>
                  <option value="footer_col_2">Footer Column 2</option>
                  <option value="sidebar">Sidebar Component</option>
                </select>
              </div>

            </div>

            {/* Links Builder */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>Menu Links</h4>
              
              {formData.links.length === 0 ? (
                <div style={{ padding: "30px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
                  <p>No links in this menu yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {formData.links.map((link, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f1f5f9", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button type="button" onClick={() => moveLink(idx, -1)} disabled={idx === 0} style={{ background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: "#64748b", padding: 0 }}><MoveUp size={14} /></button>
                        <button type="button" onClick={() => moveLink(idx, 1)} disabled={idx === formData.links.length - 1} style={{ background: "none", border: "none", cursor: idx === formData.links.length - 1 ? "not-allowed" : "pointer", color: "#64748b", padding: 0 }}><MoveDown size={14} /></button>
                      </div>
                      <input type="text" placeholder="Label (e.g. About Us)" value={link.label} onChange={e => updateLink(idx, "label", e.target.value)} required style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                      <input type="text" placeholder="URL (e.g. /about-us)" value={link.url} onChange={e => updateLink(idx, "url", e.target.value)} required style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px" }} />
                      <button type="button" onClick={() => removeLink(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "8px" }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              <button type="button" onClick={addLink} style={{ marginTop: "16px", padding: "8px 16px", background: "white", border: "1px dashed #3b82f6", borderRadius: "6px", cursor: "pointer", fontWeight: "600", color: "#3b82f6", width: "100%" }}>
                + Add Link Item
              </button>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
              <button type="submit" className="action-btn-primary" style={{ padding: "10px 24px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <Save size={18} />
                {editingId ? "Update Menu" : "Save Menu"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menus List */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Menu Name</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Location</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Links Count</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading menus...</td></tr>
            ) : menus.length > 0 ? (
              menus.map(menu => (
                <tr key={menu.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "16px", fontWeight: "600", color: "#1e293b" }}>{menu.name}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "999px", fontWeight: "500", textTransform: "capitalize" }}>
                      {menu.location.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}><ListIcon size={14} /> {menu.links ? menu.links.length : 0} items</div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => handleEdit(menu)} style={{ padding: "8px", background: "white", border: "1px solid #cbd5e1", color: "#3b82f6", borderRadius: "6px", cursor: "pointer" }} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(menu.id)} style={{ padding: "8px", background: "white", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: "6px", cursor: "pointer" }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No menus found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
