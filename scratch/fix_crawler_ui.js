const fs = require('fs');

let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');

// The literal string that got injected accidentally
const target = '\\n\\n          {/* TAB 3: STUDENTS VIEW */}';
const targetIndex = c.indexOf(target);

if (targetIndex !== -1) {
  // Read the correct JSX
  const crawlerJsx = fs.readFileSync('C:/Users/SHYAM/.gemini/antigravity-ide/brain/e39d1751-d0a9-48ba-99e5-08d1d3c15d59/scratch/crawlerTabCheck.js', 'utf8');
  
  // Replace the target with the JSX + the proper Tab 3 comment
  const replacement = crawlerJsx + '\n\n          {/* TAB 3: STUDENTS VIEW */}';
  
  c = c.substring(0, targetIndex) + replacement + c.substring(targetIndex + target.length);
  
  fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c, 'utf8');
  console.log('Fixed Crawler UI!');
} else {
  console.log('Target string not found');
}
