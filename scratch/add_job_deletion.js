const fs = require('fs');
let content = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Add `deleteDoc` to firebase imports
content = content.replace('updateDoc, getDoc } from "firebase/firestore";', 'updateDoc, getDoc, deleteDoc } from "firebase/firestore";');

// 2. Add `Trash2` to lucide-react imports
content = content.replace('Menu, Database, List, LayoutGrid', 'Menu, Database, List, LayoutGrid, Trash2');

// 3. Add `selectedJobs` state
const stateToAdd = `
  const [jobsList, setJobsList] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);`;
content = content.replace('  const [jobsList, setJobsList] = useState([]);', stateToAdd);

// 4. Add Delete Functions above `handleApproveJob`
const deleteFns = `
  // Job Deletion Handlers
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to permanently delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobsList(prev => prev.filter(j => j.id !== jobId));
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    } catch (e) {
      console.error("Error deleting job:", e);
      alert("Failed to delete job");
    }
  };

  const handleBulkDeleteJobs = async () => {
    if (!window.confirm(\`Are you sure you want to permanently delete \${selectedJobs.length} jobs?\`)) return;
    try {
      await Promise.all(selectedJobs.map(jobId => deleteDoc(doc(db, "jobs", jobId))));
      setJobsList(prev => prev.filter(j => !selectedJobs.includes(j.id)));
      setSelectedJobs([]);
    } catch (e) {
      console.error("Error bulk deleting jobs:", e);
      alert("Failed to delete some jobs");
    }
  };
  
  // Job Approval Handler`;
content = content.replace('  // Job Approval Handler', deleteFns);

// 5. Add bulk delete button to header
const headerOriginal = `              <div className="tab-header">
                <h2>Job Placement Directory ({jobsList.length})</h2>
                <p>Manage job posts, audit vacancy requirements, and approve submissions from employers.</p>
              </div>`;
const headerNew = `              <div className="tab-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2>Job Placement Directory ({jobsList.length})</h2>
                  <p>Manage job posts, audit vacancy requirements, and approve submissions from employers.</p>
                </div>
                {selectedJobs.length > 0 && (
                  <button onClick={handleBulkDeleteJobs} className="btn-danger" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "8px", background: "#ef4444", color: "white", border: "none", cursor: "pointer", fontWeight: "600" }}>
                    <Trash2 size={18} /> Delete Selected ({selectedJobs.length})
                  </button>
                )}
              </div>`;
content = content.replace(headerOriginal, headerNew);

// 6. Add select all checkbox to table head
const thOriginal = `                    <tr>
                      <th>Job Position</th>`;
const thNew = `                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={jobsList.length > 0 && selectedJobs.length === jobsList.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedJobs(jobsList.map(j => j.id));
                            } else {
                              setSelectedJobs([]);
                            }
                          }}
                          style={{ cursor: "pointer", width: "16px", height: "16px" }}
                        />
                      </th>
                      <th>Job Position</th>`;
content = content.replace(thOriginal, thNew);

// 7. Add row checkbox and individual delete button
const trOriginal = `                        <tr key={job.id}>
                          <td>`;
const trNew = `                        <tr key={job.id}>
                          <td style={{ textAlign: "center" }}>
                            <input 
                              type="checkbox" 
                              checked={selectedJobs.includes(job.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedJobs(prev => [...prev, job.id]);
                                } else {
                                  setSelectedJobs(prev => prev.filter(id => id !== job.id));
                                }
                              }}
                              style={{ cursor: "pointer", width: "16px", height: "16px" }}
                            />
                          </td>
                          <td>`;
content = content.replace(trOriginal, trNew);

const tdColspanOriginal = `<td colSpan="5"`;
const tdColspanNew = `<td colSpan="6"`;
content = content.replace(tdColspanOriginal, tdColspanNew);

const deleteBtnInsertPoint = `                              ) : (
                                <button onClick={() => handleRejectJob(job.id)} className="table-btn-reject">Deactivate</button>
                              )}`;
const deleteBtnNew = `                              ) : (
                                <button onClick={() => handleRejectJob(job.id)} className="table-btn-reject">Deactivate</button>
                              )}
                              <button onClick={() => handleDeleteJob(job.id)} title="Delete Job" style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "6px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <Trash2 size={16} />
                              </button>`;
content = content.replace(deleteBtnInsertPoint, deleteBtnNew);

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', content);
console.log("Job deletion features injected successfully.");
