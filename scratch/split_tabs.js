const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// 1. Replace Sidebar buttons
const oldSidebar = `            <li className="sidebar-item">
              <a 
                className={\`sidebar-link \${activeTab === "crawler" ? "active" : ""}\`}
                onClick={() => setActiveTab("crawler")}
              >
                <Database size={20} />
                <span>Data Crawler</span>
              </a>
            </li>`;

const newSidebar = `            <li className="sidebar-item">
              <a 
                className={\`sidebar-link \${activeTab === "places_crawler" ? "active" : ""}\`}
                onClick={() => setActiveTab("places_crawler")}
              >
                <Database size={20} />
                <span>Places Crawler</span>
              </a>
            </li>
            <li className="sidebar-item">
              <a 
                className={\`sidebar-link \${activeTab === "jobs_crawler" ? "active" : ""}\`}
                onClick={() => setActiveTab("jobs_crawler")}
              >
                <Briefcase size={20} />
                <span>Jobs Crawler</span>
              </a>
            </li>`;

c = c.replace(oldSidebar, newSidebar);

// 2. Split the Crawler View
// Currently it's wrapped in {activeTab === "crawler" && ( ... )}
// We need to change the top part to {activeTab === "places_crawler" && (
c = c.replace('{activeTab === "crawler" && (', '{activeTab === "places_crawler" && (');
c = c.replace('<h2>Data Crawlers</h2>', '<h2>Google Places Crawler</h2>');
c = c.replace('<p>Automated ingestion pipelines for Institutions and Jobs.</p>', '<p>Automated ingestion pipeline for Institutions.</p>');

// Now we need to find the start of the Job Crawler card to split the views
const jobCrawlerStart = '{/* SerpApi Job Crawler */}';
const jobCrawlerEnd = '</div>\\n              </div>\\n            </div>\\n          )}';

// Wait, doing this with regex/substring is safer
const parts = c.split('{/* SerpApi Job Crawler */}');
if (parts.length === 2) {
  const newPlacesEnd = '              </div>\\n            </div>\\n          )}\\n\\n';
  
  const newJobsStart = `          {/* JOB CRAWLER VIEW */}
          {activeTab === "jobs_crawler" && (
            <div className="tab-pane">
              <div className="tab-header">
                <h2>Jobs Crawler</h2>
                <p>Automated ingestion pipeline for Jobs.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", maxWidth: "800px" }}>
                {/* SerpApi Job Crawler */}`;
                
  c = parts[0] + newPlacesEnd + newJobsStart + parts[1];
}

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
console.log('Successfully split crawlers into two tabs!');
