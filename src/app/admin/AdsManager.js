"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Trash2, MapPin, Tag, Image as ImageIcon, Link2 } from "lucide-react";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    adImage: "",
    linkUrl: "",
    targetLocation: "",
    targetCategory: "all"
  });

  const fetchAds = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "advertisements"));
      const adsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsData);
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "advertisements"), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setShowForm(false);
      setFormData({ title: "", adImage: "", linkUrl: "", targetLocation: "", targetCategory: "all" });
      fetchAds();
    } catch (err) {
      alert("Error adding ad: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this advertisement?")) {
      try {
        await deleteDoc(doc(db, "advertisements", id));
        fetchAds();
      } catch (err) {
        alert("Error deleting ad: " + err.message);
      }
    }
  };

  return (
    <div className="tab-content fade-in">
      <div className="tab-header">
        <div>
          <h2>Ad Manager</h2>
          <p>Create geo-targeted advertisement banners.</p>
        </div>
        <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} style={{ marginRight: "8px" }} />
          {showForm ? "Cancel" : "Create Ad"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ marginBottom: "20px" }}>
          <h3>Create New Advertisement</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Campaign Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Bhubaneswar Bookstore Promo" className="form-input" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ImageIcon size={18} color="#64748b" />
                  <input required type="text" value={formData.adImage} onChange={e => setFormData({...formData, adImage: e.target.value})} placeholder="https://..." className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Destination Link</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link2 size={18} color="#64748b" />
                  <input required type="text" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="https://..." className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Target Location</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={18} color="#64748b" />
                  <input type="text" value={formData.targetLocation} onChange={e => setFormData({...formData, targetLocation: e.target.value})} placeholder="e.g. Bhubaneswar (Leave blank for global)" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Target Category</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Tag size={18} color="#64748b" />
                  <select value={formData.targetCategory} onChange={e => setFormData({...formData, targetCategory: e.target.value})} className="form-input">
                    <option value="all">All Sections</option>
                    <option value="institutions">Institutions</option>
                    <option value="students">Students</option>
                    <option value="jobs">Jobs</option>
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" className="primary-btn" style={{ marginTop: "20px" }}>Save Advertisement</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ad Preview</th>
              <th>Campaign</th>
              <th>Targeting</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Loading ads...</td></tr>
            ) : ads.length > 0 ? (
              ads.map(ad => (
                <tr key={ad.id}>
                  <td>
                    <img src={ad.adImage} alt="Ad Preview" style={{ width: "120px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />
                  </td>
                  <td>
                    <div style={{ fontWeight: "600" }}>{ad.title}</div>
                    <a href={ad.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "#3b82f6" }}>Link ↗</a>
                  </td>
                  <td>
                    <div className="badge blue">{ad.targetLocation || "Global"}</div>
                    <div className="badge purple" style={{ marginTop: "4px" }}>{ad.targetCategory}</div>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(ad.id)} className="action-btn danger-outline" title="Delete Ad">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>No advertisements found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
