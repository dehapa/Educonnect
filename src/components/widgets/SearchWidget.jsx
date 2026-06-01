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
    <div style={{ background: "var(--card-bg)", backdropFilter: "blur(12px)", padding: "8px 12px", borderRadius: "100px", border: "1px solid var(--card-border)", width: "100%", boxShadow: "var(--shadow-xl)", maxWidth: "800px", margin: "0 auto" }}>
      <form className="search-widget-form" onSubmit={handleSearch} style={{ display: "flex", gap: "8px", flexWrap: "nowrap", alignItems: "center" }}>
        
        {/* Category Dropdown */}
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: "12px 16px", borderRadius: "24px", border: "none", borderRight: "1px solid var(--border-primary)", background: "transparent", color: "var(--text-primary)", outline: "none", flex: "1 1 auto", cursor: "pointer", fontWeight: "600" }}
        >
          <option value="jobs">Jobs</option>
          <option value="institutions">Institutions</option>
          <option value="students">Students</option>
          <option value="teachers">Teachers</option>
          <option value="companies">Companies</option>
        </select>
        
        {/* Keyword Input */}
        <div style={{ position: "relative", flex: "2 1 auto", display: "flex", alignItems: "center" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder={placeholder || "What are you looking for?"}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 38px", border: "none", borderRight: "1px solid var(--border-primary)", background: "transparent", color: "var(--text-primary)", outline: "none", fontWeight: "500" }}
          />
        </div>

        {/* Location Input */}
        <div style={{ position: "relative", flex: "1 1 auto", display: "flex", alignItems: "center" }}>
          <MapPin size={18} style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Where?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: "12px 12px 12px 38px", border: "none", background: "transparent", color: "var(--text-primary)", outline: "none", fontWeight: "500" }}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-primary" style={{ padding: "12px 32px", borderRadius: "100px", flexShrink: 0, boxShadow: "0 4px 14px 0 var(--primary-glow)" }}>
          Search
        </button>

      </form>

    </div>
  );
}
