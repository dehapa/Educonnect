const fs = require('fs');
let c = fs.readFileSync('L:/Edu-employment project/src/app/admin/page.js', 'utf8');
c = c.replace('import { AlertCircle, useState, useEffect } from "react";', 'import { useState, useEffect } from "react";');
const lucideIndex = c.indexOf('from "lucide-react";');
if (lucideIndex !== -1) {
  // Find the closest 'import {' before lucideIndex
  const importStart = c.lastIndexOf('import { ', lucideIndex);
  if (importStart !== -1) {
    c = c.substring(0, importStart) + 'import { AlertCircle, ' + c.substring(importStart + 9);
  }
}
fs.writeFileSync('L:/Edu-employment project/src/app/admin/page.js', c);
console.log('Fixed imports!');
