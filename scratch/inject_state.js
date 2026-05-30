const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

c = c.replace('const [jobLocation, setJobLocation] = useState("");', 'const [jobLocation, setJobLocation] = useState("");\\n  const [jobState, setJobState] = useState("");\\n  const [jobIndustry, setJobIndustry] = useState("");\\n  const [jobType, setJobType] = useState("");');

fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c);
console.log('Successfully injected state variables!');
