"use client";

import { useState } from "react";
import { X, Landmark, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function SuggestionModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("high-school");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Odisha");
  const [district, setDistrict] = useState("");

  const ODISHA_DISTRICTS = [
    "Khordha", "Cuttack", "Puri", "Baleswar", "Ganjam", "Sambalpur", 
    "Sundargarh", "Angul", "Bhadrak", "Balangir", "Bargarh", "Boudh", 
    "Deogarh", "Dhenkanal", "Gajapati", "Jagatsinghpur", "Jajpur", 
    "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", 
    "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", 
    "Nuapada", "Rayagada", "Subarnapur"
  ];
  
  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];
  const [townOrBlock, setTownOrBlock] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !district || !townOrBlock) {
      setError("Please fill in all required fields (Name, Address, District, Town/Block).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Map display type to emoji logo
      const getEmoji = (t) => {
        if (t === "university") return "🎓";
        if (t === "high-school") return "🏫";
        if (t === "coaching") return "📚";
        return "🎒";
      };

      const suggestionData = {
        name,
        address,
        type,
        contact,
        country,
        state,
        district,
        townOrBlock,
        logo: getEmoji(type),
        status: "pending",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "suggestions"), suggestionData);
      setSuccess(true);
      setLoading(false);
      
      // Reset form
      setTimeout(() => {
        setName("");
        setAddress("");
        setType("high-school");
        setContact("");
        setDistrict("");
        setTownOrBlock("");
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (e) {
      console.error("Error submitting suggestion:", e);
      setError("Failed to submit suggestion. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "540px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-secondary)",
        boxShadow: "var(--shadow-xl)",
        padding: "32px",
        position: "relative",
        maxHeight: "90vh",
        overflowY: "auto",
        animation: "fadeInUp 0.3s ease forwards"
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)"
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ background: "rgba(79, 70, 229, 0.15)", color: "var(--primary)", padding: "10px", borderRadius: "10px" }}>
            <Landmark size={24} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)" }}>Suggest New Institution</h2>
        </div>
        
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
          Can't find your school, college, or coaching center? Provide the details below, and our administration will verify and add it.
        </p>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--danger)",
            color: "var(--danger)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "20px"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid var(--success)",
            color: "var(--success)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "20px"
          }}>
            <CheckCircle size={16} />
            <span>Suggestion submitted successfully! Thank you for improving the directory.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
              Institution Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. Buxi Jagabandhu English Medium School" 
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                Type <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <select 
                className="form-input" 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                style={{ cursor: "pointer" }}
              >
                <option value="play-school">Play School</option>
                <option value="high-school">High School</option>
                <option value="university">College / University</option>
                <option value="coaching">Coaching Center</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                Contact Number / Email
              </label>
              <input 
                type="text" 
                placeholder="e.g. +91 674 2310243" 
                className="form-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
              Full Address <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <textarea 
              placeholder="e.g. M-74, Dharma Vihar, Khandagiri, Bhubaneswar" 
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ height: "70px", resize: "none" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                Country <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <select 
                className="form-input"
                value={country}
                onChange={(e) => { setCountry(e.target.value); if (e.target.value === "International") { setState(""); setDistrict(""); } else { setState("Odisha"); } }}
              >
                <option value="India">India</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                State <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              {country === "India" ? (
                <select className="form-input" value={state} onChange={(e) => { setState(e.target.value); if (e.target.value !== "Odisha") setDistrict(""); }}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} required />
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                District <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              {state === "Odisha" ? (
                <select className="form-input" value={district} onChange={(e) => setDistrict(e.target.value)} required>
                  <option value="">Select District</option>
                  {ODISHA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <input type="text" placeholder="e.g. Khordha" className="form-input" value={district} onChange={(e) => setDistrict(e.target.value)} required />
              )}
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600" }}>
                Town / Block <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input 
                type="text" 
                placeholder="e.g. Bhubaneswar" 
                className="form-input"
                value={townOrBlock}
                onChange={(e) => setTownOrBlock(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary" 
              style={{ flex: 1, padding: "12px" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2, padding: "12px" }}
              disabled={loading}
            >
              {loading ? <Loader className="spinner" size={20} /> : "Submit Suggestion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
