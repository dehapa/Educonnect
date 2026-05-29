import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)", padding: "60px 0 30px 0", marginTop: "80px" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          
          {/* Brand Info */}
          <div style={{ gridColumn: "span 2" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "800", fontSize: "1.4rem", fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: "16px" }}>
              <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyItems: "center", color: "#fff" }}>
                <GraduationCap size={24} />
              </div>
              <span>Edu<span style={{ color: "var(--primary)" }}>Connect</span></span>
            </Link>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "320px" }}>
              A unified digital ecosystem connecting students, teachers, institutions, and employers. Claim your presence, track your journey, and discover opportunities.
            </p>
          </div>

          {/* Quick Links: Platform */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)" }}>Platform</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", padding: 0 }}>
              <li><Link href="#institutions" style={{ color: "var(--text-secondary)" }} className="footer-link">Find Schools</Link></li>
              <li><Link href="#jobs" style={{ color: "var(--text-secondary)" }} className="footer-link">Explore Vacancies</Link></li>
              <li><Link href="#employers" style={{ color: "var(--text-secondary)" }} className="footer-link">For Employers</Link></li>
              <li><Link href="#pricing" style={{ color: "var(--text-secondary)" }} className="footer-link">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Quick Links: Resources */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)" }}>Resources</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", padding: 0 }}>
              <li><Link href="#docs" style={{ color: "var(--text-secondary)" }} className="footer-link">User Guides</Link></li>
              <li><Link href="#support" style={{ color: "var(--text-secondary)" }} className="footer-link">Help Center</Link></li>
              <li><Link href="#privacy" style={{ color: "var(--text-secondary)" }} className="footer-link">Privacy Policy</Link></li>
              <li><Link href="#terms" style={{ color: "var(--text-secondary)" }} className="footer-link">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Quick Links: Contact */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)" }}>Contact</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.95rem", padding: 0, color: "var(--text-secondary)" }}>
              <li>Email: contact@educonnect.com</li>
              <li>Support: +91 674 1234567</li>
              <li>Bhubaneswar, Odisha, India</li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            &copy; {new Date().getFullYear()} EduConnect. All rights reserved.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Built with ❤️ for Odisha and pan-India education.
          </p>
        </div>
      </div>

      <style jsx>{`
        :global(.footer-link:hover) {
          color: var(--primary) !important;
          padding-left: 4px;
        }
        .footer-link {
          transition: all 0.2s ease;
        }
      `}</style>
    </footer>
  );
}
