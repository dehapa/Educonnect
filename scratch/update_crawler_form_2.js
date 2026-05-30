const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

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
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "12px" }}>
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

const startUI = c.indexOf('<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>');
const endUIMarker = '<div style={{ background: "#fef3c7"';
const uiStartIdx = startUI;
const uiEndIdx = c.indexOf(endUIMarker, uiStartIdx);

if (uiStartIdx > -1 && uiEndIdx > -1) {
  c = c.substring(0, uiStartIdx) + newUI + '\\n\\n                    ' + c.substring(uiEndIdx);
  fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
  console.log('UI successfully updated!');
} else {
  console.log('Failed to find UI block!');
}
