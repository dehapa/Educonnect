"use client";
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Plus, Trash2, MapPin, Tag, Image as ImageIcon, Link2, UploadCloud, CheckCircle2, Monitor } from "lucide-react";

export default function AdsManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    adImage: "",
    linkUrl: "",
    targetLocation: "",
    targetCategory: "all",
    placement: "banner_standard" // default size
  });

  const fetchAds = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "advertisements"));
      const adsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsData);

      // Extract unique images for the gallery
      const uniqueImages = [...new Set(adsData.map(ad => ad.adImage).filter(Boolean))];
      setGalleryImages(uniqueImages);
    } catch (err) {
      console.error("Error fetching ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `ad-banners/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        alert("Upload failed: " + error.message);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, adImage: downloadURL }));
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.adImage) {
      alert("Please upload or select an image for the advertisement.");
      return;
    }

    try {
      await addDoc(collection(db, "advertisements"), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      setShowForm(false);
      setFormData({ title: "", adImage: "", linkUrl: "", targetLocation: "", targetCategory: "all", placement: "banner_standard" });
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
    <div className="tab-pane fade-in">
      <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h2 className="tab-title">Ad Manager</h2>
          <p className="tab-subtitle">Create geo-targeted, size-specific advertisement banners.</p>
        </div>
        <button className="action-btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: showForm ? "#ef4444" : "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
          <Plus size={18} style={{ transform: showForm ? "rotate(45deg)" : "none", transition: "transform 0.2s" }} />
          {showForm ? "Cancel" : "Create New Ad"}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "20px" }}>Create Advertisement</h3>
          <form onSubmit={handleSubmit}>
            
            {/* Image Selection Section */}
            <div style={{ marginBottom: "24px", padding: "16px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
              <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Ad Creative (Image)</label>
              
              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="btn-secondary"
                  disabled={uploading}
                  style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center", background: "white", color: "#475569", border: "1px solid #cbd5e1", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
                >
                  <UploadCloud size={18} />
                  {uploading ? `Uploading ${Math.round(uploadProgress)}%` : "Upload from Device"}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  style={{ display: "none" }} 
                />
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "8px" }}>Or select from gallery:</p>
                  <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px" }}>
                    {galleryImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setFormData({...formData, adImage: img})}
                        style={{ 
                          width: "80px", height: "60px", flexShrink: 0, cursor: "pointer", 
                          borderRadius: "6px", overflow: "hidden", border: formData.adImage === img ? "3px solid #3b82f6" : "1px solid #cbd5e1",
                          position: "relative"
                        }}
                      >
                        <img src={img} alt="Gallery item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {formData.adImage === img && (
                          <div style={{ position: "absolute", top: "2px", right: "2px", background: "white", borderRadius: "50%" }}>
                            <CheckCircle2 size={14} color="#3b82f6" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Image Preview */}
              {formData.adImage && (
                <div style={{ marginTop: "16px", padding: "12px", background: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "8px" }}>Selected Creative:</p>
                  <img src={formData.adImage} alt="Selected Ad" style={{ width: "100%", maxHeight: "150px", objectFit: "contain", borderRadius: "4px" }} />
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Campaign Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Summer Coaching Discount" style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
              </div>
              
              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Destination Link</label>
                <div style={{ position: "relative" }}>
                  <Link2 size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input required type="url" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="https://..." style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Target Location</label>
                <div style={{ position: "relative" }}>
                  <MapPin size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <input type="text" value={formData.targetLocation} onChange={e => setFormData({...formData, targetLocation: e.target.value})} placeholder="e.g. Bhubaneswar (Leave blank for global)" style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none" }} />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Target Category</label>
                <div style={{ position: "relative" }}>
                  <Tag size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <select value={formData.targetCategory} onChange={e => setFormData({...formData, targetCategory: e.target.value})} style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", appearance: "none", background: "white" }}>
                    <option value="all">All Sections</option>
                    <option value="institutions">Institutions</option>
                    <option value="students">Students</option>
                    <option value="jobs">Jobs</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Ad Placement / Size</label>
                <div style={{ position: "relative" }}>
                  <Monitor size={18} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
                  <select value={formData.placement} onChange={e => setFormData({...formData, placement: e.target.value})} style={{ width: "100%", padding: "10px 12px 10px 38px", border: "1px solid #cbd5e1", borderRadius: "6px", outline: "none", appearance: "none", background: "white" }}>
                    <option value="banner_standard">Standard Horizontal Banner (e.g. 1200x200)</option>
                    <option value="sidebar_square">Sidebar Square (e.g. 300x300)</option>
                    <option value="hero_billboard">Hero Billboard (e.g. 1920x400)</option>
                    <option value="in_feed">In-Feed Grid Square (e.g. 600x600)</option>
                  </select>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>The site will automatically request the appropriate placement format based on where the ad is shown.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="action-btn-primary" disabled={uploading} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                Save Advertisement
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Creative</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Campaign</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>Targeting & Size</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", color: "#64748b", fontWeight: "600", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading advertisements...</td></tr>
            ) : ads.length > 0 ? (
              ads.map(ad => (
                <tr key={ad.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ width: "120px", height: "60px", background: "#f1f5f9", borderRadius: "6px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {ad.adImage ? (
                        <img src={ad.adImage} alt="Ad Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ImageIcon size={24} color="#94a3b8" />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>{ad.title}</div>
                    <a href={ad.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "#3b82f6", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Link2 size={12} /> Visit Link
                    </a>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        <MapPin size={12} /> {ad.targetLocation || "Global"}
                      </span>
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#e0e7ff", color: "#4338ca", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        <Tag size={12} /> {ad.targetCategory}
                      </span>
                      <span style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        <Monitor size={12} /> {ad.placement?.replace("_", " ") || "standard banner"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={() => handleDelete(ad.id)} style={{ padding: "8px", background: "white", border: "1px solid #fca5a5", color: "#ef4444", borderRadius: "6px", cursor: "pointer", transition: "all 0.2s" }} title="Delete Ad">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>No advertisements created yet. Click "Create New Ad" to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
