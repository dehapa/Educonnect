const fs = require('fs');
let content = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Add selectedCrawledJobs state
const stateOriginal = `  const [jobScraperLog, setJobScraperLog] = useState([]);
  const [recentlyCrawledJobs, setRecentlyCrawledJobs] = useState([]);`;
const stateNew = `  const [jobScraperLog, setJobScraperLog] = useState([]);
  const [recentlyCrawledJobs, setRecentlyCrawledJobs] = useState([]);
  const [selectedCrawledJobs, setSelectedCrawledJobs] = useState([]);`;
content = content.replace(stateOriginal, stateNew);

// 2. Add handleImportSelectedJobs function
const importFnInsert = `  const runJobScraper = async () => {`;
const importFnNew = `  const handleImportSelectedJobs = async () => {
    if (selectedCrawledJobs.length === 0) return;
    
    setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] Importing \${selectedCrawledJobs.length} selected jobs...\`, ...prev]);
    setIsScrapingJobs(true);
    
    try {
      let importedCount = 0;
      for (const jobId of selectedCrawledJobs) {
        const jobData = recentlyCrawledJobs.find(j => j.id === jobId);
        if (jobData) {
          const { id, ...jobToSave } = jobData;
          jobToSave.postedAt = new Date(); // Update timestamp on actual import
          
          const jobsRef = collection(db, "jobs");
          const docRef = await addDoc(jobsRef, jobToSave);
          
          setJobsList(prev => [{ id: docRef.id, ...jobToSave }, ...prev]);
          importedCount++;
        }
      }
      
      // Remove imported jobs from preview list
      setRecentlyCrawledJobs(prev => prev.filter(j => !selectedCrawledJobs.includes(j.id)));
      setSelectedCrawledJobs([]);
      
      setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] ✅ Successfully imported \${importedCount} jobs!\`, ...prev]);
      alert(\`Successfully imported \${importedCount} jobs!\`);
    } catch (error) {
      console.error("Error importing jobs:", error);
      setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] ❌ Failed to import jobs: \${error.message}\`, ...prev]);
      alert("Failed to import jobs. See log for details.");
    } finally {
      setIsScrapingJobs(false);
    }
  };

  const runJobScraper = async () => {`;
content = content.replace(importFnInsert, importFnNew);

// 3. Update UI title and add Import button
const crawlerUiOriginal = `                    <h3 style={{ marginTop: "30px", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>Recently Ingested Jobs</h3>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", textAlign: "left", color: "#64748b", fontWeight: "600" }}>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>JOB TITLE</th>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>COMPANY & LOCATION</th>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>SALARY/TYPE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentlyCrawledJobs.map((job) => (
                            <tr key={job.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "16px", fontWeight: "600", color: "#0f172a" }}>{job.title}</td>
                              <td style={{ padding: "16px" }}>
                                <div style={{ color: "#334155", fontWeight: "500" }}>{job.companyName}</div>
                                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>{job.location}</div>
                              </td>
                              <td style={{ padding: "16px" }}>
                                <div style={{ color: "#334155" }}>{job.salaryRange}</div>
                                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>{job.type}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>`;

const crawlerUiNew = `                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "30px", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                      <h3 style={{ margin: 0 }}>Preview Fetched Jobs</h3>
                      {selectedCrawledJobs.length > 0 && (
                        <button onClick={handleImportSelectedJobs} style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Check size={16} /> Import Selected ({selectedCrawledJobs.length})
                        </button>
                      )}
                    </div>
                    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", textAlign: "left", color: "#64748b", fontWeight: "600" }}>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", width: "40px", textAlign: "center" }}>
                              <input 
                                type="checkbox"
                                checked={recentlyCrawledJobs.length > 0 && selectedCrawledJobs.length === recentlyCrawledJobs.length}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedCrawledJobs(recentlyCrawledJobs.map(j => j.id));
                                  else setSelectedCrawledJobs([]);
                                }}
                                style={{ cursor: "pointer", width: "16px", height: "16px" }}
                              />
                            </th>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>JOB TITLE</th>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>COMPANY & LOCATION</th>
                            <th style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>SALARY/TYPE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentlyCrawledJobs.map((job) => (
                            <tr key={job.id} style={{ borderBottom: "1px solid #e2e8f0", background: selectedCrawledJobs.includes(job.id) ? "#f0fdf4" : "transparent" }}>
                              <td style={{ padding: "16px", textAlign: "center" }}>
                                <input 
                                  type="checkbox"
                                  checked={selectedCrawledJobs.includes(job.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedCrawledJobs(prev => [...prev, job.id]);
                                    else setSelectedCrawledJobs(prev => prev.filter(id => id !== job.id));
                                  }}
                                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                                />
                              </td>
                              <td style={{ padding: "16px", fontWeight: "600", color: "#0f172a" }}>{job.title}</td>
                              <td style={{ padding: "16px" }}>
                                <div style={{ color: "#334155", fontWeight: "500" }}>{job.companyName}</div>
                                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>{job.location}</div>
                              </td>
                              <td style={{ padding: "16px" }}>
                                <div style={{ color: "#334155" }}>{job.salaryRange}</div>
                                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>{job.type}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>`;

content = content.replace(crawlerUiOriginal, crawlerUiNew);

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', content);
console.log("Successfully updated admin/page.js with job preview workflow.");
