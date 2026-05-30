const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

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

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c);
console.log('Successfully updated runJobScraper!');
