"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Star, MapPin, ChevronRight, Briefcase, GraduationCap, Users, BookOpen, Calendar, ArrowRight } from "lucide-react";

export default function Home() {
  const [institutions, setInstitutions] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // MOCK DATA FOR NEW SECTIONS
  const mockEducators = [
    { id: 1, name: "Dr. Rajesh Singh", title: "Physics Expert", rating: 4.9, reviews: 124, image: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { id: 2, name: "Mrs. Pooja Sharma", title: "Mathematics", rating: 4.8, reviews: 98, image: "https://i.pravatar.cc/150?u=a042581f4e29026704e" },
    { id: 3, name: "Mr. Amit Verma", title: "Computer Science", rating: 4.7, reviews: 85, image: "https://i.pravatar.cc/150?u=a042581f4e29026704f" },
    { id: 4, name: "Ms. Neha Gupta", title: "English Literature", rating: 4.9, reviews: 112, image: "https://i.pravatar.cc/150?u=a042581f4e29026704g" },
  ];

  const mockStudents = [
    { id: 1, name: "Rahul Das", subtitle: "Top Scorer, DAV", rating: 5.0, image: "https://i.pravatar.cc/150?u=a042581f4e29026704a" },
    { id: 2, name: "Priya Mallick", subtitle: "UI/UX Design", rating: 4.8, image: "https://i.pravatar.cc/150?u=a042581f4e29026704b" },
    { id: 3, name: "Rohan Patra", subtitle: "Full Stack Coding", rating: 4.9, image: "https://i.pravatar.cc/150?u=a042581f4e29026704c" },
    { id: 4, name: "Anjali Reddy", subtitle: "Engineering", rating: 4.7, image: "https://i.pravatar.cc/150?u=a042581f4e29026704h" },
  ];

  const mockCourses = [
    { id: 1, title: "Advanced React", provider: "Tech Academy", rating: 4.9, students: 1200 },
    { id: 2, title: "Business Strategy", provider: "Global Business", rating: 4.8, students: 850 },
    { id: 3, title: "UI/UX Development", provider: "Design Institute", rating: 4.7, students: 920 },
    { id: 4, title: "Digital Marketing", provider: "Marketing Pro", rating: 4.9, students: 1500 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch top institutions (limit to 4 for the homepage grid)
        const instQuery = query(collection(db, "institutions"), limit(4));
        const instSnapshot = await getDocs(instQuery);
        const instData = [];
        instSnapshot.forEach((doc) => {
          instData.push({ id: doc.id, ...doc.data() });
        });
        setInstitutions(instData);

        // Fetch top jobs
        const jobsQuery = query(collection(db, "jobs"), limit(4));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = [];
        jobsSnapshot.forEach((doc) => {
          jobsData.push({ id: doc.id, ...doc.data() });
        });
        setJobs(jobsData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dark-premium-theme">
      {/* GLOBAL DARK THEME STYLES SPECIFIC TO HOME PAGE */}
      <style dangerouslySetInnerHTML={{__html: \`
        .dark-premium-theme {
          background-color: #0B1120;
          color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
          padding-bottom: 60px;
        }
        
        .dark-premium-theme a {
          text-decoration: none;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 10px;
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 500;
          color: #f8fafc;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .view-all-link {
          color: #eab308;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.2s;
        }
        
        .view-all-link:hover {
          opacity: 0.8;
        }

        .grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        /* Glassmorphism Card Style */
        .glass-card {
          background: linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          border-color: rgba(234, 179, 8, 0.3);
        }

        .card-image-placeholder {
          height: 120px;
          background: linear-gradient(45deg, #1e293b, #334155);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.2);
        }

        .card-content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #f8fafc;
        }

        .card-subtitle {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0 0 12px 0;
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #eab308;
          font-size: 0.8rem;
          margin-bottom: 16px;
        }

        .card-action {
          margin-top: auto;
          background: rgba(30,58,138,0.3);
          border: 1px solid rgba(59,130,246,0.3);
          color: #60a5fa;
          text-align: center;
          padding: 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .card-action:hover {
          background: rgba(37,99,235,0.8);
          color: white;
        }
        
        .card-action.gold {
          background: rgba(133,77,14,0.3);
          border-color: rgba(202,138,4,0.3);
          color: #fbbf24;
        }
        
        .card-action.gold:hover {
          background: rgba(202,138,4,0.8);
          color: white;
        }

        /* Top Header Area */
        .premium-header {
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15,23,42,0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(90deg, #60a5fa, #eab308);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          gap: 20px;
        }
        
        .nav-links a {
          color: #94a3b8;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        
        .nav-links a:hover {
          color: #f8fafc;
        }
        
        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px;
        }
        
        /* Two column layout for bottom section */
        .split-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .list-item {
          display: flex;
          align-items: center;
          padding: 16px;
          background: linear-gradient(90deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.2) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          margin-bottom: 12px;
        }
        
        .list-item-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }
      \`}} />

      <header className="premium-header">
        <div className="logo">EduConnect Pro</div>
        <div className="nav-links">
          <Link href="/institutions">Institutes</Link>
          <Link href="/student">Students</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/admin">Admin Panel</Link>
        </div>
      </header>

      <div className="main-container">
        
        {/* TOP INSTITUTES */}
        <div className="section-header">
          <h2 className="section-title"><Landmark size={24} /> Top Institutes</h2>
          <Link href="/institutions" className="view-all-link">View Directory <ChevronRight size={16} /></Link>
        </div>
        <div className="grid-container">
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="glass-card" style={{height: "250px", opacity: 0.5}}></div>)
          ) : institutions.length > 0 ? (
            institutions.map((inst) => (
              <div key={inst.id} className="glass-card">
                <div className="card-image-placeholder">
                  {inst.logoUrl ? <img src={inst.logoUrl} style={{width: "100%", height: "100%", objectFit: "cover"}} /> : "No Image"}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{inst.name}</h3>
                  <p className="card-subtitle"><MapPin size={12} style={{display: "inline", marginRight: "4px"}}/>{inst.address?.city || inst.address?.state || "India"}</p>
                  <div className="card-rating">
                    <Star size={12} fill="#eab308" />
                    <Star size={12} fill="#eab308" />
                    <Star size={12} fill="#eab308" />
                    <Star size={12} fill="#eab308" />
                    <Star size={12} fill="#eab308" />
                    <span style={{color: "#94a3b8", marginLeft: "4px"}}>Verified</span>
                  </div>
                  <Link href={\`/institutions/\${inst.id}\`} className="card-action">Visit Profile</Link>
                </div>
              </div>
            ))
          ) : (
             <div style={{color: "#94a3b8"}}>No verified institutions found.</div>
          )}
        </div>

        {/* TOP EDUCATORS */}
        <div className="section-header" style={{marginTop: "50px"}}>
          <h2 className="section-title"><GraduationCap size={24} /> Top Educators</h2>
          <Link href="#" className="view-all-link">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="grid-container">
          {mockEducators.map((edu) => (
            <div key={edu.id} className="glass-card">
              <div className="card-image-placeholder" style={{height: "150px"}}>
                <img src={edu.image} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              </div>
              <div className="card-content">
                <h3 className="card-title">{edu.name}</h3>
                <p className="card-subtitle">{edu.title}</p>
                <div className="card-rating">
                  <Star size={12} fill="#eab308" />
                  <Star size={12} fill="#eab308" />
                  <Star size={12} fill="#eab308" />
                  <Star size={12} fill="#eab308" />
                  <Star size={12} fill="#eab308" />
                  <span style={{color: "#94a3b8", marginLeft: "4px"}}>{edu.rating} ({edu.reviews})</span>
                </div>
                <Link href="#" className="card-action">Connect</Link>
              </div>
            </div>
          ))}
        </div>

        {/* FEATURED STUDENTS & POPULAR COURSES (SPLIT) */}
        <div className="split-section" style={{marginTop: "50px"}}>
          
          {/* FEATURED STUDENTS */}
          <div>
            <div className="section-header">
              <h2 className="section-title"><Users size={24} /> Featured Students</h2>
              <Link href="#" className="view-all-link">View All <ChevronRight size={16} /></Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {mockStudents.map((student) => (
                <div key={student.id} className="glass-card" style={{flexDirection: "row", alignItems: "center"}}>
                  <img src={student.image} style={{width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px 0 0 8px"}} />
                  <div style={{padding: "10px"}}>
                    <h4 style={{margin: "0 0 4px 0", fontSize: "0.95rem", color: "#f8fafc"}}>{student.name}</h4>
                    <div style={{fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px"}}>{student.subtitle}</div>
                    <div style={{color: "#eab308", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "2px"}}><Star size={10} fill="#eab308"/> {student.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POPULAR COURSES */}
          <div>
            <div className="section-header">
              <h2 className="section-title"><BookOpen size={24} /> Popular Courses</h2>
              <Link href="#" className="view-all-link">Explore More <ChevronRight size={16} /></Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {mockCourses.map((course) => (
                <div key={course.id} className="glass-card">
                  <div className="card-content" style={{padding: "12px"}}>
                    <h4 style={{margin: "0 0 4px 0", fontSize: "0.95rem", color: "#f8fafc"}}>{course.title}</h4>
                    <div style={{fontSize: "0.8rem", color: "#94a3b8", marginBottom: "8px"}}>{course.provider}</div>
                    <div style={{color: "#eab308", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px"}}>
                      <Star size={10} fill="#eab308"/> {course.rating} ({course.students}+)
                    </div>
                    <Link href="#" className="card-action gold" style={{padding: "4px", fontSize: "0.75rem"}}>Enroll Now</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* JOB LISTINGS & KNOWLEDGE BASE (SPLIT) */}
        <div className="split-section" style={{marginTop: "50px", marginBottom: "50px"}}>
          
          {/* JOB LISTINGS */}
          <div>
            <div className="section-header">
              <h2 className="section-title"><Briefcase size={24} /> Job Listings</h2>
              <Link href="/jobs" className="view-all-link">View Portal <ChevronRight size={16} /></Link>
            </div>
            <div>
              {loading ? (
                <div style={{color: "#94a3b8"}}>Loading jobs...</div>
              ) : jobs.length > 0 ? (
                jobs.map(job => (
                  <div key={job.id} className="list-item">
                    <div className="list-item-icon">
                      {job.companyLogo ? <img src={job.companyLogo} style={{width: "100%", height: "100%", borderRadius: "50%"}} /> : <Briefcase size={20} color="#60a5fa" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc" }}>{job.title}</h4>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{job.companyName} • {job.location}</div>
                    </div>
                    <Link href={\`/jobs/\${job.id}\`} className="card-action" style={{ padding: "6px 12px" }}>Apply</Link>
                  </div>
                ))
              ) : (
                <div style={{color: "#94a3b8"}}>No jobs found.</div>
              )}
            </div>
          </div>

          {/* KNOWLEDGE BASE / EVENTS */}
          <div>
            <div className="section-header">
              <h2 className="section-title"><Calendar size={24} /> Knowledge Base & Updates</h2>
              <Link href="#" className="view-all-link">Read All <ChevronRight size={16} /></Link>
            </div>
            <div>
              <div className="list-item">
                <div className="list-item-icon"><ArrowRight size={20} color="#eab308" /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc" }}>How to Join EduConnect</h4>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>A complete guide for students and teachers to get verified.</div>
                </div>
                <Link href="#" className="card-action gold" style={{ padding: "6px 12px" }}>Read</Link>
              </div>
              <div className="list-item">
                <div className="list-item-icon"><ArrowRight size={20} color="#eab308" /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc" }}>Be a Franchisee</h4>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Partner with us to expand educational access in your region.</div>
                </div>
                <Link href="#" className="card-action gold" style={{ padding: "6px 12px" }}>Read</Link>
              </div>
              <div className="list-item">
                <div className="list-item-icon"><ArrowRight size={20} color="#eab308" /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", color: "#f8fafc" }}>Career Growth Webinar</h4>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Upcoming live session this Friday. Register now!</div>
                </div>
                <Link href="#" className="card-action gold" style={{ padding: "6px 12px" }}>Register</Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
