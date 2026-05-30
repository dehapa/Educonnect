const fs = require('fs');

let content = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Add state
const stateToAdd = `
  const [jobsList, setJobsList] = useState([]);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
`;
content = content.replace('  const [jobsList, setJobsList] = useState([]);', stateToAdd);

// 2. Add handleUpdateJob
const updateJobFn = `
  // Update Job Details
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob || !editingJob.id) return;
    
    try {
      const jobRef = doc(db, "jobs", editingJob.id);
      await updateDoc(jobRef, {
        title: editingJob.title,
        description: editingJob.description,
        employerName: editingJob.employerName || "",
        companyName: editingJob.employerName || "",
        location: editingJob.location,
        salary: editingJob.salary || "",
        salaryRange: editingJob.salary || "",
        type: editingJob.type,
        applyLink: editingJob.applyLink || ""
      });
      
      setJobsList(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...editingJob } : j));
      setShowEditJobModal(false);
      setEditingJob(null);
      alert("Job details updated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error updating job.");
    }
  };

  // Job Approval Handler`;

content = content.replace('  // Job Approval Handler', updateJobFn);

// 3. Update Jobs Table actions
const actionsOriginal = `                              {!(job.status === "active" || job.isApproved) ? (
                                <button onClick={() => handleApproveJob(job.id)} className="table-btn-approve">Approve</button>
                              ) : (
                                <button onClick={() => handleRejectJob(job.id)} className="table-btn-reject">Deactivate</button>
                              )}`;
                              
const actionsNew = `                              <button onClick={() => {
                                setEditingJob(job);
                                setShowEditJobModal(true);
                              }} className="table-btn-primary" style={{ background: "#3b82f6", borderColor: "#2563eb", padding: "6px 12px", borderRadius: "6px", color: "white", cursor: "pointer", fontSize: "0.85rem" }}>Edit/View</button>
                              {!(job.status === "active" || job.isApproved) ? (
                                <button onClick={() => handleApproveJob(job.id)} className="table-btn-approve">Approve</button>
                              ) : (
                                <button onClick={() => handleRejectJob(job.id)} className="table-btn-reject">Deactivate</button>
                              )}`;
content = content.replace(actionsOriginal, actionsNew);

// 4. Add Edit Job Modal at the end of the modals (just before closing </div>)
const editModalHtml = `
          {/* Edit Job Modal */}
          {showEditJobModal && editingJob && (
            <div className="modal-backdrop">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Edit / Review Job Listing</h3>
                  <button onClick={() => setShowEditJobModal(false)} className="close-modal-btn"><X size={18} /></button>
                </div>
                <form onSubmit={handleUpdateJob} className="modal-form">
                  <div className="form-grid">
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Job Title / Position *</label>
                      <input type="text" value={editingJob.title || ""} onChange={(e) => setEditingJob({...editingJob, title: e.target.value})} className="dashboard-input" required />
                    </div>
                    <div>
                      <label className="form-label">Company/Employer Name</label>
                      <input type="text" value={editingJob.employerName || editingJob.companyName || ""} onChange={(e) => setEditingJob({...editingJob, employerName: e.target.value, companyName: e.target.value})} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Location</label>
                      <input type="text" value={editingJob.location || ""} onChange={(e) => setEditingJob({...editingJob, location: e.target.value})} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Salary/Package</label>
                      <input type="text" value={editingJob.salary || editingJob.salaryRange || ""} onChange={(e) => setEditingJob({...editingJob, salary: e.target.value, salaryRange: e.target.value})} className="dashboard-input" />
                    </div>
                    <div>
                      <label className="form-label">Job Type</label>
                      <select value={editingJob.type || "Full-time"} onChange={(e) => setEditingJob({...editingJob, type: e.target.value})} className="dashboard-select">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Direct Apply Link (External)</label>
                      <input type="url" value={editingJob.applyLink || ""} onChange={(e) => setEditingJob({...editingJob, applyLink: e.target.value})} className="dashboard-input" placeholder="https://" />
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>If provided, the Apply button on the public page will link directly here.</div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Job Description / SEO Details</label>
                      <textarea 
                        value={editingJob.description || ""} 
                        onChange={(e) => setEditingJob({...editingJob, description: e.target.value})} 
                        className="dashboard-textarea" 
                        rows="6"
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowEditJobModal(false)} className="action-btn-secondary">Cancel</button>
                    <button type="submit" className="action-btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}
`;

const insertionPoint = '        </div>\n      </div>\n    </div>\n  );\n}';
content = content.replace(insertionPoint, editModalHtml + '\n' + insertionPoint);

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', content);
console.log("Job edit UI injected successfully.");
