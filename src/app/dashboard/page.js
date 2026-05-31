"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StudentDashboard from "../../components/dashboards/StudentDashboard";
import TeacherDashboard from "../../components/dashboards/TeacherDashboard";
import EmployerDashboard from "../../components/dashboards/EmployerDashboard";
import InstitutionDashboard from "../../components/dashboards/InstitutionDashboard";
import { Loader, Lock, GraduationCap, Users, Briefcase, Landmark, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardRouter() {
  const { user, profile, loading, loginWithGoogle, saveUserProfile, login, signup, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Removed aggressive auto-redirect to avoid glitchy UI experience

  // Loading state
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <Loader className="spinner" size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3>Loading Your Profile...</h3>
          </div>
        </main>
        <Footer />
        <style jsx global>{`
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Not Logged In - Render Login CTA
  if (!user) {
    const handleEmailAuth = async (e) => {
      e.preventDefault();
      if (!authEmail || !authPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (authMode === "register" && !authName) {
        setError("Please enter your name.");
        return;
      }
      setError("");
      setAuthLoading(true);
      try {
        if (authMode === "login") {
          await login(authEmail, authPassword);
        } else {
          // Pass empty role so they are pushed to the role selection screen next
          await signup(authEmail, authPassword, authName, "");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Authentication failed");
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)", padding: "16px", borderRadius: "50%", display: "inline-flex", marginBottom: "16px" }}>
                <Lock size={32} />
              </div>
              <h2 style={{ fontSize: "1.75rem", marginBottom: "8px", fontFamily: "var(--font-display)" }}>
                {authMode === "login" ? "Welcome Back" : "Create an Account"}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                {authMode === "login" ? "Sign in to access your dashboard." : "Join EduConnect to manage your profile."}
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {authMode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Full Name</label>
                  <input 
                    type="text" 
                    value={authName} 
                    onChange={(e) => setAuthName(e.target.value)} 
                    placeholder="John Doe"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", fontSize: "0.95rem" }}
                  />
                </div>
              )}
              
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Email Address</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", fontSize: "0.95rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Password</label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="••••••••"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-primary)", outline: "none", fontSize: "0.95rem" }}
                  required
                />
              </div>

              <button type="submit" disabled={authLoading} className="btn-primary" style={{ padding: "14px", marginTop: "8px", display: "flex", justifyContent: "center" }}>
                {authLoading ? <Loader className="spinner" size={20} /> : (authMode === "login" ? "Sign In" : "Register")}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border-secondary)" }}></div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-secondary)" }}></div>
            </div>

            <button 
              onClick={loginWithGoogle} 
              type="button"
              style={{ 
                width: "100%", padding: "14px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#374151", fontWeight: "600",
                cursor: "pointer", transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.target.style.background = "#f9fafb"}
              onMouseOut={(e) => e.target.style.background = "#ffffff"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button 
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setError("");
                }}
                style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
              >
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Logged In but No Profile Role Selected yet (Fallback helper)
  if (!profile || !profile.role) {
    const handleRoleSubmit = async () => {
      if (!selectedRole) {
        setError("Please select a role.");
        return;
      }
      setError("");
      setRoleLoading(true);
      try {
        await saveUserProfile(
          user.uid,
          user.displayName || "Google User",
          user.email,
          selectedRole
        );
      } catch (err) {
        console.error(err);
        setError("Failed to register profile role.");
      } finally {
        setRoleLoading(false);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="glass-card" style={{ maxWidth: "520px", width: "100%", padding: "40px" }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "8px", fontFamily: "var(--font-display)", textAlign: "center" }}>Complete Your Profile</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "32px", textAlign: "center" }}>
              Please select your role in the ecosystem to unlock your dashboard.
            </p>

            {error && (
              <div style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "20px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
              <div 
                onClick={() => setSelectedRole("student")}
                style={{
                  border: selectedRole === "student" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "student" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <GraduationCap size={24} style={{ margin: "0 auto 8px auto", color: selectedRole === "student" ? "var(--primary)" : "var(--text-muted)" }} />
                <h4 style={{ fontWeight: "700" }}>Student</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Timelines & Placements</p>
              </div>

              <div 
                onClick={() => setSelectedRole("teacher")}
                style={{
                  border: selectedRole === "teacher" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "teacher" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <Users size={24} style={{ margin: "0 auto 8px auto", color: selectedRole === "teacher" ? "var(--primary)" : "var(--text-muted)" }} />
                <h4 style={{ fontWeight: "700" }}>Teacher</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Faculty & Portfolios</p>
              </div>

              <div 
                onClick={() => setSelectedRole("employer")}
                style={{
                  border: selectedRole === "employer" ? "2px solid var(--primary)" : "1px solid var(--border-primary)",
                  background: selectedRole === "employer" ? "var(--primary-light)" : "var(--bg-secondary)",
                  borderRadius: "12px", padding: "16px", textAlign: "center", cursor: "pointer", transition: "all 0.2s"
                }}
                className="col-span-2"
              >
                <Briefcase size={24} style={{ margin: "0 auto 8px auto", color: selectedRole === "employer" ? "var(--primary)" : "var(--text-muted)" }} />
                <h4 style={{ fontWeight: "700" }}>Employer</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Post Jobs & Hire Talent</p>
              </div>
            </div>

            <button onClick={handleRoleSubmit} disabled={roleLoading} className="btn-primary" style={{ width: "100%", padding: "14px" }}>
              {roleLoading ? <Loader className="spinner" size={20} /> : "Complete Registration"}
            </button>
          </div>
        </main>
        <Footer />
        <style jsx>{`
          .col-span-2 { grid-column: span 2; }
        `}</style>
      </div>
    );
  }

  // Staff Accounts
  if (profile.role === "super_admin" || profile.role === "admin" || profile.role === "manager") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "40px", textAlign: "center" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "16px", borderRadius: "50%", display: "inline-flex", margin: "0 auto 20px auto" }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px", fontFamily: "var(--font-display)" }}>Staff Account Detected</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "32px" }}>
              You are logged in with administrative privileges. Please proceed to the staff console to manage the platform.
            </p>
            <button 
              onClick={() => router.push("/admin")} 
              className="btn-primary" 
              style={{ width: "100%", padding: "14px", display: "inline-flex", gap: "10px", justifyContent: "center", marginBottom: "12px" }}
            >
              Go to Admin Panel
            </button>
            <button 
              onClick={async () => {
                alert("Executing Nuclear Logout Sequence...");
                setIsLoggingOut(true);
                await logout();
                router.push("/");
                router.refresh();
                setTimeout(() => { window.location.href = "/"; }, 100);
              }}
              disabled={isLoggingOut}
              style={{ width: "100%", padding: "12px", background: "transparent", border: "1px solid var(--border-primary)", color: "var(--text-secondary)", borderRadius: "8px", cursor: isLoggingOut ? "not-allowed" : "pointer", fontWeight: "600", display: "inline-flex", justifyContent: "center", gap: "8px" }}
            >
              {isLoggingOut ? <Loader className="spinner" size={18} /> : null}
              {isLoggingOut ? "Logging out..." : "Sign Out"}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Role Routing
  return (
    <>
      {profile.role === "student" && <StudentDashboard />}
      {profile.role === "teacher" && <TeacherDashboard />}
      {profile.role === "employer" && <EmployerDashboard />}
      {profile.role === "institution_admin" && <InstitutionDashboard />}
    </>
  );
}
