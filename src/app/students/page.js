"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { Users, GraduationCap, Search, MapPin } from "lucide-react";

export default function StudentsDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Filter out those who don't want to be shown or draft profiles, if needed
        setStudents(data);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "40px 20px", minHeight: "80vh", background: "var(--bg-primary)" }}>
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <Users size={32} style={{ color: "var(--primary)" }} />
            Student Directory
          </h1>
          <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
            Discover and connect with talented students across our network. View their academic history, skills, and get in touch.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
            <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search students by name or institution..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: "48px", width: "100%", borderRadius: "30px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid var(--border-primary)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
            <Users size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px auto" }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No students found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {filteredStudents.map(student => (
              <div key={student.id} className="glass-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", flex: 1, borderBottom: "1px solid var(--border-primary)" }}>
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "800", marginBottom: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
                    {(student.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", margin: "0 0 4px 0", color: "var(--text-primary)", textAlign: "center" }}>{student.name || "Anonymous Student"}</h3>
                  {student.schoolName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", marginTop: "8px" }}>
                      <GraduationCap size={14} /> {student.schoolName}
                    </div>
                  )}
                  {student.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
                      <MapPin size={12} /> {student.location}
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px", background: "var(--bg-secondary)" }}>
                  <Link href={`/student/${student.id}`} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.9rem", border: "1px solid var(--primary-light)" }}>
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
