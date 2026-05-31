"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export default function SearchWidget({ placeholder }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("jobs");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("loc", location);
    
    router.push(`/${category}?${params.toString()}`);
  };

  return (
    <div style={{ background: "var(--bg-tertiary, #1e293b)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-primary, #334155)", width: "100%" }}>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        
        {/* Category Dropdown */}
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "white", outline: "none", flex: "1 1 120px" }}
        >
          <option value="jobs">Jobs</option>
          <option value="institutions">Institutions</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="companies">Companies</option>
        </select>
        
        {/* Keyword Input */}
        <div style={{ position: "relative", flex: "2 1 200px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input 
            type="text" 
            placeholder={placeholder || "Search..."}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "white", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Location Input */}
        <div style={{ position: "relative", flex: "2 1 150px" }}>
          <MapPin size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input 
            type="text" 
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "white", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "8px", flex: "1 1 120px", background: "#2563eb", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}>
          Search
        </button>

      </form>
    </div>
  );
}
