const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

const oldSidebar = `            <button 
              className={\`sidebar-link \${activeTab === "crawler" ? "active" : ""}\`}
              onClick={() => setActiveTab("crawler")}
            >
              <Database size={20} />
              <span>Data Crawler</span>
            </button>`;

const newSidebar = `            <button 
              className={\`sidebar-link \${activeTab === "places_crawler" ? "active" : ""}\`}
              onClick={() => setActiveTab("places_crawler")}
            >
              <Database size={20} />
              <span>Places Crawler</span>
            </button>

            <button 
              className={\`sidebar-link \${activeTab === "jobs_crawler" ? "active" : ""}\`}
              onClick={() => setActiveTab("jobs_crawler")}
            >
              <Briefcase size={20} />
              <span>Jobs Crawler</span>
            </button>`;

c = c.replace(oldSidebar, newSidebar);

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
console.log('Fixed buttons!');
