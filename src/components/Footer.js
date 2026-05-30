"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))) return null;
  return (
    <footer style={{ background: "#0B1120", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "60px", paddingBottom: "20px", color: "#94a3b8" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "40px", marginBottom: "60px" }}>
          
          {/* Column 1: Brand & About */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "#3b82f6", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyCenter: "center" }}>
                <BookOpen size={20} color="white" />
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>EduConnect</h2>
            </div>
            <p style={{ lineHeight: "1.6", fontSize: "0.95rem", marginBottom: "24px" }}>
              Our aim is to create a verified, transparent, and powerful digital ecosystem that connects students, teachers, institutions, and employers worldwide. Empowering education and employment through technology.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <SocialIcon label="FB" />
              <SocialIcon label="TW" />
              <SocialIcon label="IG" />
              <SocialIcon label="IN" />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "20px" }}>Quick Links</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink href="/" text="Home" />
              <FooterLink href="/institutions" text="Institutions Directory" />
              <FooterLink href="/students" text="Student Profiles" />
              <FooterLink href="/jobs" text="Job Openings" />
              <FooterLink href="/teachers" text="Verified Teachers" />
            </ul>
          </div>

          {/* Column 3: Legal & CMS */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "20px" }}>Information</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <FooterLink href="/about-us" text="About Us" />
              <FooterLink href="/contact" text="Contact Us" />
              <FooterLink href="/privacy" text="Privacy Policy" />
              <FooterLink href="/terms" text="Terms of Service" />
              <FooterLink href="/franchise" text="Be a Franchise" />
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#f8fafc", marginBottom: "20px" }}>Contact Us</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <MapPin size={18} color="#3b82f6" style={{ marginTop: "2px" }} />
                <span style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>123 Education Hub, Tech Park<br/>Bhubaneswar, Odisha 751024</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Phone size={18} color="#3b82f6" />
                <span style={{ fontSize: "0.95rem" }}>+91 98765 43210</span>
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Mail size={18} color="#3b82f6" />
                <span style={{ fontSize: "0.95rem" }}>support@educonnect.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", fontSize: "0.85rem" }}>
          <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} EduConnect. All rights reserved.</p>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
            <Link href="/sitemap" style={{ color: "#94a3b8", textDecoration: "none" }}>Sitemap</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}

function FooterLink({ href, text }) {
  return (
    <li>
      <Link 
        href={href} 
        style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }}
        onMouseOver={(e) => e.target.style.color = "#3b82f6"}
        onMouseOut={(e) => e.target.style.color = "#94a3b8"}
      >
        {text}
      </Link>
    </li>
  );
}

function SocialIcon({ label }) {
  return (
    <div 
      style={{ 
        width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", 
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
        fontSize: "0.85rem", fontWeight: "bold"
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "white"; }}
      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.color = "#94a3b8"; }}
    >
      {label}
    </div>
  );
}
