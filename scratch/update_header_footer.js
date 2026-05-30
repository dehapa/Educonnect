const fs = require('fs');

let content = fs.readFileSync('L:/Edu-employment project/src/app/page.js', 'utf8');

// 1. Add useAuth import
if (!content.includes('useAuth')) {
  content = content.replace(
    'import { db } from "../lib/firebase";',
    'import { db } from "../lib/firebase";\nimport { useAuth } from "../context/AuthContext";'
  );
}

// 2. Add const { user } = useAuth();
if (!content.includes('const { user } = useAuth();')) {
  content = content.replace(
    'export default function Home() {',
    'export default function Home() {\n  const { user } = useAuth();'
  );
}

// 3. Update Header HTML
const oldHeader = `<header className="premium-header">
        <div className="logo">EduConnect Pro</div>
        <div className="nav-links">
          <Link href="/institutions">Institutes</Link>
          <Link href="/student">Students</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/admin">Admin Panel</Link>
        </div>
      </header>`;

const newHeader = `<header className="premium-header">
        <div className="logo" style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
          <span>EduConnect Pro</span>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "500", textTransform: "uppercase", letterSpacing: "1px" }}>Empowering Futures</span>
        </div>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/institutions">Institutions</Link>
          <Link href="/student">Students</Link>
          <Link href="/educators">Educators</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="auth-section">
          {user ? (
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <span style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: "500" }}>Dashboard</span>
              <img 
                src={user.photoURL || "https://ui-avatars.com/api/?name=" + (user.displayName || "User") + "&background=random"} 
                alt="Profile" 
                style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #eab308", objectFit: "cover" }}
              />
            </Link>
          ) : (
            <Link href="/admin" className="login-btn">Login / Register</Link>
          )}
        </div>
      </header>`;

content = content.replace(oldHeader, newHeader);

// 4. Update Footer HTML and add CSS
const oldFooterSection = `        </div>

      </div>
    </div>`;

const newFooterSection = `        </div>

      </div>
      
      {/* PREMIUM FOOTER */}
      <footer className="premium-footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">EduConnect Pro</h3>
            <p className="footer-desc">
              EduConnect is a comprehensive digital ecosystem designed to seamlessly connect students, educators, institutions, and employers. Our objective is to streamline educational access and career growth through verified profiles and powerful networking tools.
            </p>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/institutions">Institutions</Link>
              <Link href="/student">Students</Link>
              <Link href="/educators">Educators</Link>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-heading">Resources</h4>
            <div className="footer-links">
              <Link href="/jobs">Job Portal</Link>
              <Link href="/courses">Courses</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>`;

content = content.replace(oldFooterSection, newFooterSection);

// Add missing CSS styles for header/footer
const styleTagEnd = `      \`}} />`;
const newStyles = `
        /* Additional Header Styles */
        .auth-section .login-btn {
          background: linear-gradient(90deg, #eab308, #ca8a04);
          color: #0f172a;
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .auth-section .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
          color: #0f172a;
        }
        
        /* Footer Styles */
        .premium-footer {
          background: #0f172a;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 60px 40px 20px 40px;
          margin-top: 40px;
        }
        .footer-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(90deg, #60a5fa, #eab308);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 16px 0;
        }
        .footer-desc {
          color: #94a3b8;
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 400px;
        }
        .footer-heading {
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links a {
          color: #94a3b8;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: #eab308;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: #64748b;
          font-size: 0.85rem;
        }
      \`}} />`;

content = content.replace(styleTagEnd, newStyles);

fs.writeFileSync('L:/Edu-employment project/src/app/page.js', content);
console.log("Successfully updated Header and Footer");
