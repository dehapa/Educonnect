const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

const oldStart = c.indexOf('{/* CRAWLER VIEW */}');
const oldEnd = c.indexOf('{/* TAB 3: STUDENTS VIEW */}');

if (oldStart !== -1 && oldEnd !== -1) {
  const stateTarget = 'const [scraperLog, setScraperLog] = useState([]);';
  const stateIdx = c.indexOf(stateTarget);
  if (stateIdx === -1) throw 'State not found';
  
  const stateEnd = stateIdx + stateTarget.length;
  const newState = `
  // Job Crawler State
  const [jobQuery, setJobQuery] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [isInternationalJob, setIsInternationalJob] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [jobScraperLog, setJobScraperLog] = useState([]);

  const runJobScraper = async () => {
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
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] ✅ \${data.message}\`, ...prev]);
        alert(data.message);
      } else {
        setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] ❌ ERROR: \${data.error}\`, ...prev]);
        alert("Crawler Error: " + data.error);
      }
    } catch (error) {
      setJobScraperLog(prev => [\`[\${new Date().toLocaleTimeString()}] ❌ Network Error: \${error.message}\`, ...prev]);
    } finally {
      setIsScrapingJobs(false);
    }
  };
`;

  c = c.substring(0, stateEnd) + newState + c.substring(stateEnd);

  // Recalculate indices because we added state
  const updatedStart = c.indexOf('{/* CRAWLER VIEW */}');
  const updatedEnd = c.indexOf('{/* TAB 3: STUDENTS VIEW */}');

  const newHtml = fs.readFileSync('C:/Users/SHYAM/.gemini/antigravity-ide/brain/e39d1751-d0a9-48ba-99e5-08d1d3c15d59/scratch/crawlerTabCheck.js', 'utf8');
  
  // Extract JSX from crawlerTabCheck.js
  let crawlerJsx = newHtml.substring(newHtml.indexOf('{/* CRAWLER VIEW */}'));
  // Trim the trailing standard export default if any, or just cut the last div correctly
  // Wait, crawlerTabCheck.js has `export default function CrawlerTab() { return ( <> ... </> ); }`
  // So it has `<>` at the start and `</>` at the end.
  const jsxStart = crawlerJsx.indexOf('{/* CRAWLER VIEW */}');
  const jsxEnd = crawlerJsx.lastIndexOf('</>');
  crawlerJsx = crawlerJsx.substring(jsxStart, jsxEnd).trim() + '\\n\\n          ';

  c = c.substring(0, updatedStart) + crawlerJsx + c.substring(updatedEnd);

  // Add AlertCircle to lucide-react imports if missing
  if (!c.includes('AlertCircle')) {
    c = c.replace('import { ', 'import { AlertCircle, ');
  }

  fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
  console.log('Successfully injected crawler without corruption!');
} else {
  console.log('Bounds not found');
}
