const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/jobs/page.js', 'utf8');

// The replacement logic:

// First, add new state variables
const stateVars = `  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filterType, setFilterType] = useState("All");`;

const newStateVars = `  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [filterState, setFilterState] = useState("");`;

c = c.replace(stateVars, newStateVars);

// Second, update filter logic
const filterLogic = `  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = job.location?.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesType = filterType === "All" || job.type?.toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesType;
  });`;

const newFilterLogic = `  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const searchLoc = filterState ? filterState : locationQuery;
    const matchesLocation = searchLoc === "" || job.location?.toLowerCase().includes(searchLoc.toLowerCase());
    
    const matchesType = filterType === "All" || job.type?.toLowerCase().includes(filterType.toLowerCase());
    
    // Industry match logic based on title/description keyword inference
    const matchesIndustry = filterIndustry === "All" || 
                           job.title?.toLowerCase().includes(filterIndustry.toLowerCase()) ||
                           job.companyName?.toLowerCase().includes(filterIndustry.toLowerCase()) ||
                           job.description?.toLowerCase().includes(filterIndustry.toLowerCase());
    
    return matchesSearch && matchesLocation && matchesType && matchesIndustry;
  });`;

c = c.replace(filterLogic, newFilterLogic);

// Third, update the sidebar
const oldSidebar = `          {/* Left Sidebar Filters */}
          <aside style={{ flex: "1 1 250px", maxWidth: "300px", background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} /> Filters
            </h3>
            
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Job Type</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["All", "Full-time", "Part-time", "Contract", "Internship"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", color: "#334155" }}>
                    <input 
                      type="radio" 
                      name="jobType" 
                      checked={filterType === type}
                      onChange={() => setFilterType(type)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </aside>`;

const newSidebar = `          {/* Left Sidebar Filters */}
          <aside style={{ flex: "1 1 250px", maxWidth: "300px", background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={18} /> Filters
            </h3>
            
            {/* Location State Filter */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Location (State)</h4>
              <select 
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
              >
                <option value="">All Locations</option>
                <option value="Odisha">Odisha</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="International">International (Outside India)</option>
              </select>
            </div>

            {/* Industry Filter */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Industry</h4>
              <select 
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none" }}
              >
                <option value="All">All Industries</option>
                <option value="Education">Education & Teaching</option>
                <option value="Healthcare">Healthcare & Medical</option>
                <option value="Technology">IT & Software</option>
                <option value="Engineering">Engineering</option>
                <option value="Finance">Finance & Banking</option>
                <option value="Management">Business & Management</option>
              </select>
            </div>
            
            {/* Job Type Filter */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569", marginBottom: "12px" }}>Job Type</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["All", "Full-time", "Part-time", "Contract", "Internship", "Freelance"].map(type => (
                  <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.95rem", color: "#334155" }}>
                    <input 
                      type="radio" 
                      name="jobType" 
                      checked={filterType === type}
                      onChange={() => setFilterType(type)}
                      style={{ accentColor: "var(--primary)" }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </aside>`;

c = c.replace(oldSidebar, newSidebar);

fs.writeFileSync('L:/Edu-employment project/src/app/jobs/page.js', c, 'utf8');
console.log('Updated Job Filters!');
