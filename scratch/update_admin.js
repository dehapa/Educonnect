const fs = require('fs');

let content = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Add Star import
if (!content.includes('Trash2, Star')) {
  content = content.replace('LayoutGrid, Trash2', 'LayoutGrid, Trash2, Star');
}

// 2. Add AdsManager import
if (!content.includes('import AdsManager')) {
  content = content.replace(
    'import { db } from "../../lib/firebase";',
    'import { db } from "../../lib/firebase";\nimport AdsManager from "./AdsManager";'
  );
}

// 3. Add handleToggleFeatured function
if (!content.includes('const handleToggleFeatured')) {
  const targetApproveJob = '  const handleApproveJob = async (jobId) => {';
  const replaceApproveJob = `  const handleToggleFeatured = async (collectionName, id, currentStatus) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { isFeatured: !currentStatus });
      fetchData();
      if (collectionName === "jobs") fetchJobs();
    } catch (err) {
      alert("Error updating featured status: " + err.message);
    }
  };

  const handleApproveJob = async (jobId) => {`;
  content = content.replace(targetApproveJob, replaceApproveJob);
}

// 4. Update Jobs Actions
const jobsTarget = `<button onClick={() => handleDeleteJob(job.id)} title="Delete Job" style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>`;
const jobsReplace = `<button onClick={() => handleToggleFeatured("jobs", job.id, job.isFeatured)} title="Toggle Featured" style={{ background: "transparent", border: \`1px solid \${job.isFeatured ? '#eab308' : '#cbd5e1'}\`, color: job.isFeatured ? '#eab308' : '#cbd5e1', padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Star size={16} fill={job.isFeatured ? '#eab308' : 'none'} />
                              </button>
                              <button onClick={() => handleDeleteJob(job.id)} title="Delete Job" style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>`;
content = content.replace(jobsTarget, jobsReplace);

// 5. Update Institutions Actions
const instTarget = `<a href={\`/institutions/\${inst.id}\`} target="_blank" rel="noopener noreferrer" className="table-action-btn-secondary" style={{ padding: "6px 8px", fontSize: "0.75rem" }}>View</a>`;
const instReplace = `<button onClick={() => handleToggleFeatured("institutions", inst.id, inst.isFeatured)} title="Toggle Featured" style={{ background: "transparent", border: \`1px solid \${inst.isFeatured ? '#eab308' : '#cbd5e1'}\`, color: inst.isFeatured ? '#eab308' : '#cbd5e1', padding: "4px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                  <Star size={14} fill={inst.isFeatured ? '#eab308' : 'none'} />
                                </button>
                                <a href={\`/institutions/\${inst.id}\`} target="_blank" rel="noopener noreferrer" className="table-action-btn-secondary" style={{ padding: "6px 8px", fontSize: "0.75rem" }}>View</a>`;
content = content.replace(instTarget, instReplace);

// 6. Update Students Actions
const studentTarget = `<a href={\`/student/\${stud.uid}\`} target="_blank" rel="noreferrer" className="table-action-btn-secondary">View Profile</a>`;
const studentReplace = `<div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => handleToggleFeatured("users", stud.uid, stud.isFeatured)} title="Toggle Featured" style={{ background: "transparent", border: \`1px solid \${stud.isFeatured ? '#eab308' : '#cbd5e1'}\`, color: stud.isFeatured ? '#eab308' : '#cbd5e1', padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Star size={16} fill={stud.isFeatured ? '#eab308' : 'none'} />
                              </button>
                              <a href={\`/student/\${stud.uid}\`} target="_blank" rel="noreferrer" className="table-action-btn-secondary" style={{ padding: "8px 12px", display: "flex", alignItems: "center" }}>View Profile</a>
                            </div>`;
content = content.replace(studentTarget, studentReplace);

// 7. Add Sidebar Tab
const sidebarTarget = `<button 
              className={\`sidebar-link \${activeTab === "settings" ? "active" : ""}\`}
              onClick={() => setActiveTab("settings")}
            >`;
const sidebarReplace = `<button 
              className={\`sidebar-link \${activeTab === "ads" ? "active" : ""}\`}
              onClick={() => setActiveTab("ads")}
            >
              <Play size={20} />
              <span>Ad Manager</span>
            </button>

            <button 
              className={\`sidebar-link \${activeTab === "settings" ? "active" : ""}\`}
              onClick={() => setActiveTab("settings")}
            >`;
content = content.replace(sidebarTarget, sidebarReplace);

// 8. Render AdsManager Component
const renderTarget = `{activeTab === "settings" && (`;
const renderReplace = `{activeTab === "ads" && <AdsManager />}

          {activeTab === "settings" && (`;
content = content.replace(renderTarget, renderReplace);

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', content);
console.log("Updated admin page successfully.");
