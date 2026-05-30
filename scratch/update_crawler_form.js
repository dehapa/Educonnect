const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Add new state variables for the Jobs Crawler
const oldStateStr = `  const [jobQuery, setJobQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [isInternationalJob, setIsInternationalJob] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [jobScraperLog, setJobScraperLog] = useState([]);`;

const newStateStr = `  const [jobQuery, setJobQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobState, setJobState] = useState("");
  const [jobIndustry, setJobIndustry] = useState("");
  const [jobType, setJobType] = useState("");
  const [isInternationalJob, setIsInternationalJob] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [jobScraperLog, setJobScraperLog] = useState([]);`;

c = c.replace(oldStateStr, newStateStr);

// 2. Update runJobScraper function
const oldRunFn = `const runJobScraper = async () => {
    if (!jobQuery) {
      alert("Please enter a job search query.");
      return;
    }
    
    setIsScrapingJobs(true);
    setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] Starting job crawler for: "\${jobQuery}" in "\${jobLocation || 'Any'}"...\`, ...prev]);
    
    try {
      const res = await fetch("/api/scrape-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          searchQuery: jobQuery, 
          location: jobLocation,
          isInternational: isInternationalJob
        })
      });`;

const newRunFn = `const runJobScraper = async () => {
    if (!jobQuery) {
      alert("Please enter a job search query.");
      return;
    }
    
    let finalQuery = jobQuery;
    if (jobIndustry) finalQuery += \` \${jobIndustry}\`;
    if (jobType) finalQuery += \` \${jobType}\`;
    
    let finalLocation = jobLocation;
    if (jobState) finalLocation = finalLocation ? \`\${finalLocation}, \${jobState}\` : jobState;
    
    setIsScrapingJobs(true);
    setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] Starting job crawler for: "\${finalQuery}" in "\${finalLocation || 'Any'}"...\`, ...prev]);
    
    try {
      const res = await fetch("/api/scrape-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          searchQuery: finalQuery, 
          location: finalLocation,
          isInternational: isInternationalJob
        })
      });`;

c = c.replace(oldRunFn, newRunFn);


// 3. Update the UI
const oldUI = `                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label className="form-label">Location (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Odisha, Bangalore, India" 
                            value={jobLocation} 
                            onChange={(e) => setJobLocation(e.target.value)} 
                            className="dashboard-input" 
                          />
                        </div>
                        <div>
                          <label className="form-label">Scope</label>
                          <select 
                            value={isInternationalJob ? "International" : "India"} 
                            onChange={(e) => setIsInternationalJob(e.target.value === "International")} 
                            className="dashboard-select"
                          >
                            <option value="India">India</option>
                            <option value="International">International</option>
                          </select>
                        </div>
                      </div>`;

const newUI = `                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                          <label className="form-label">Location (State)</label>
                          <select 
                            value={jobState} 
                            onChange={(e) => setJobState(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any State / Automatic</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">City/Town (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Bangalore, Bhubaneswar" 
                            value={jobLocation} 
                            onChange={(e) => setJobLocation(e.target.value)} 
                            className="dashboard-input" 
                          />
                        </div>
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <div>
                          <label className="form-label">Industry</label>
                          <select 
                            value={jobIndustry} 
                            onChange={(e) => setJobIndustry(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any Industry</option>
                            <option value="Education">Education & Teaching</option>
                            <option value="Healthcare">Healthcare & Medical</option>
                            <option value="Technology">IT & Software</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Finance">Finance & Banking</option>
                            <option value="Management">Business & Management</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Job Type</label>
                          <select 
                            value={jobType} 
                            onChange={(e) => setJobType(e.target.value)} 
                            className="dashboard-select"
                          >
                            <option value="">Any Type</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Scope</label>
                          <select 
                            value={isInternationalJob ? "International" : "India"} 
                            onChange={(e) => setIsInternationalJob(e.target.value === "International")} 
                            className="dashboard-select"
                          >
                            <option value="India">India</option>
                            <option value="International">International</option>
                          </select>
                        </div>
                      </div>`;

// Wait! Because the old UI string might have slightly different indentation in the file, let's use a regex replace or just precise string matching.
// Since the file is huge, let's write this specific UI update differently, replacing the chunk between the Location input and the Scope select.

const startUI = c.indexOf('<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>');
// Find the end of this div block by finding the button Trigger Job Sync.
// Wait, the structure is:
/*
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label className="form-label">Location (Optional)</label>
                        ...
                      </div>
                      <div>
                        <label className="form-label">Scope</label>
                        ...
                      </div>
                    </div>
                    
                    <div style={{ background: "#fffbeb", padding: "12px 16px", borderRadius: "8px", border: "1px solid #fde68a", color: "#b45309", fontSize: "0.9rem", display: "flex", alignItems: "flex-start", gap: "8px" }}>
*/

const endUIMarker = '<div style={{ background: "#fffbeb"';
const uiStartIdx = startUI;
const uiEndIdx = c.indexOf(endUIMarker, uiStartIdx);

if (uiStartIdx > -1 && uiEndIdx > -1) {
  c = c.substring(0, uiStartIdx) + newUI + '\\n\\n                    ' + c.substring(uiEndIdx);
  fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
  console.log('UI successfully updated!');
} else {
  console.log('Failed to find UI block!');
}

