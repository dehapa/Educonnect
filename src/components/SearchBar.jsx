"use client";

import { useState } from "react";
import { Search, MapPin, Layers } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  const locations = [
    { value: "", label: "All Locations (Odisha)" },
    { value: "bhubaneswar", label: "Bhubaneswar" },
    { value: "cuttack", label: "Cuttack" },
    { value: "rourkela", label: "Rourkela" },
    { value: "sambalpur", label: "Sambalpur" },
    { value: "puri", label: "Puri" },
  ];

  const categories = [
    { value: "", label: "All Categories" },
    { value: "play-school", label: "Play School" },
    { value: "high-school", label: "High School" },
    { value: "university", label: "University" },
    { value: "coaching", label: "Coaching Center" },
    { value: "technical", label: "Technical Institute" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query, location, category });
    }
  };

  return (
    <div id="search" style={{ padding: "40px 0 20px 0" }}>
      <div className="container">
        <form 
          onSubmit={handleSubmit}
          style={{ 
            background: "var(--card-bg)", 
            border: "1px solid var(--card-border)", 
            borderRadius: "var(--radius-lg)", 
            padding: "16px", 
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Main Input Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }} className="search-grid">
            
            {/* Search Input */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search style={{ position: "absolute", left: "16px", color: "var(--text-muted)" }} size={20} />
              <input 
                type="text" 
                placeholder="Search institutions, courses, or jobs..." 
                className="form-input" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: "48px" }}
              />
            </div>

            {/* Location Filter */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MapPin style={{ position: "absolute", left: "16px", color: "var(--text-muted)", zIndex: 10 }} size={20} />
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "48px", appearance: "none", cursor: "pointer" }}
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Layers style={{ position: "absolute", left: "16px", color: "var(--text-muted)", zIndex: 10 }} size={20} />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                style={{ paddingLeft: "48px", appearance: "none", cursor: "pointer" }}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Search CTA */}
            <button type="submit" className="btn-primary" style={{ padding: "12px" }}>
              <Search size={20} style={{ marginRight: "8px" }} />
              Search
            </button>

          </div>
        </form>
      </div>

      <style jsx global>{`
        .search-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .search-grid {
            grid-template-columns: 2fr 1fr 1fr auto;
          }
        }
      `}</style>
    </div>
  );
}
