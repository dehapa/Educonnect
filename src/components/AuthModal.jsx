"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, GraduationCap, Briefcase, Users, Landmark, AlertCircle, Loader } from "lucide-react";
import { logAppEvent } from "../lib/firebase";

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithGoogle, saveUserProfile, user, logout } = useAuth();
  const [step, setStep] = useState("login"); // "login" | "role-select"
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.exists) {
        // User already has a profile, close modal
        setLoading(false);
        onClose();
      } else {
        // User is new, move to role selection step
        setPendingUser(result.user);
        setStep("role-select");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to log in with Google.");
      setLoading(false);
    }
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await saveUserProfile(
        pendingUser.uid,
        pendingUser.displayName || "Google User",
        pendingUser.email,
        selectedRole
      );
      
      logAppEvent("user_registered", { role: selectedRole });

      setLoading(false);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to save user profile.");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // If they cancel during role selection, log them out to prevent orphaned auth accounts
    if (step === "role-select") {
      await logout();
    }
    setStep("login");
    setPendingUser(null);
    setSelectedRole("");
    setError("");
    onClose();
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
      zIndex: 999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "480px",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-secondary)",
        boxShadow: "var(--shadow-xl)",
        padding: "32px",
        position: "relative",
        animation: "fadeInUp 0.3s ease forwards"
      }}>
        {/* Close Button */}
        <button 
          onClick={handleCancel}
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

        {step === "login" ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Welcome to EduConnect</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "32px" }}>
              Join the educational & employment network of Odisha & Pan-India.
            </p>

            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-primary)",
                background: "#ffffff",
                color: "#1f2937",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                fontWeight: "600",
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#f9fafb"}
              onMouseLeave={(e) => e.target.style.background = "#ffffff"}
            >
              {loading ? (
                <Loader className="spinner" size={20} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Sign in with Google</span>
            </button>

            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "24px" }}>
              By logging in, you agree to our Terms of Service & Privacy Policy.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "8px", fontFamily: "var(--font-display)", textAlign: "center" }}>Select Your Role</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", textAlign: "center" }}>
              Help us tailor your experience in the ecosystem.
            </p>

            {/* Role Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
              
              {/* Student */}
              <div 
                onClick={() => setSelectedRole("student")}
                style={{
                  border: selectedRole === "student" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "student" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ color: selectedRole === "student" ? "var(--primary)" : "var(--text-muted)", display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  <GraduationCap size={24} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Student</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Learn & placements</p>
              </div>

              {/* Teacher */}
              <div 
                onClick={() => setSelectedRole("teacher")}
                style={{
                  border: selectedRole === "teacher" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "teacher" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ color: selectedRole === "teacher" ? "var(--primary)" : "var(--text-muted)", display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  <Users size={24} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Teacher</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Profiles & teaching logs</p>
              </div>

              {/* Employer */}
              <div 
                onClick={() => setSelectedRole("employer")}
                style={{
                  border: selectedRole === "employer" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "employer" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ color: selectedRole === "employer" ? "var(--primary)" : "var(--text-muted)", display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  <Briefcase size={24} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Employer</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Post placement jobs</p>
              </div>

              {/* Admin (For Testing/Ingestion panel access) */}
              <div 
                onClick={() => setSelectedRole("admin")}
                style={{
                  border: selectedRole === "admin" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "admin" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ color: selectedRole === "admin" ? "var(--primary)" : "var(--text-muted)", display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  <Landmark size={24} />
                </div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700" }}>Admin</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Engine & Scrapers</p>
              </div>

            </div>

            <button 
              onClick={handleRoleSubmit}
              disabled={loading}
              className="btn-primary" 
              style={{ width: "100%", padding: "14px" }}
            >
              {loading ? <Loader className="spinner" size={20} /> : "Complete Registration"}
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
