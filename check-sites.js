#!/usr/bin/env node
// Site quality checker for all 3 generated sites
const fs = require('fs');
const path = require('path');

const sites = [
  { name: 'nappliancerepair', dir: 'C:/nappliancerepair' },
  { name: 'appliancerepairneary', dir: 'C:/appliancerepairneary' },
  { name: 'fixlifyservices', dir: 'C:/fixlifyservices' },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  if (!content.includes('<title>')) issues.push('NO title');
  if (!content.includes('meta name="description"')) issues.push('NO meta desc');
  if (!content.includes('<link rel="canonical"')) issues.push('NO canonical');
  if (!content.includes('@context')) issues.push('NO schema');
  if (!content.includes('LocalBusiness') && !content.includes('Article') && !content.includes('WebPage')) issues.push('NO entity type');
  if (content.includes('{{')) issues.push('UNFILLED VAR');

  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) {
    const len = titleMatch[1].length;
    if (len < 30) issues.push('title short(' + len + ')');
    if (len > 70) issues.push('title long(' + len + ')');
  }

  const descMatch = content.match(/name="description" content="([^"]+)"/);
  if (descMatch) {
    const len = descMatch[1].length;
    if (len < 100) issues.push('desc short(' + len + ')');
    if (len > 165) issues.push('desc long(' + len + ')');
  }

  return issues;
}

let totalPages = 0;
let totalIssues = 0;

for (const site of sites) {
  console.log('\n=== ' + site.name + ' ===');

  if (!fs.existsSync(site.dir)) {
    console.log('  DIR NOT FOUND');
    continue;
  }

  const files = fs.readdirSync(site.dir).filter(function(f) {
    return f.endsWith('.html') && f !== 'service-template.html';
  });
  console.log('  Pages: ' + files.length);
  totalPages += files.length;

  var siteIssues = 0;
  var errorFiles = [];

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var filePath = path.join(site.dir, file);
    var issues = checkFile(filePath);
    if (issues.length > 0) {
      siteIssues += issues.length;
      totalIssues += issues.length;
      errorFiles.push({ file: file, issues: issues });
    }
  }

  if (errorFiles.length === 0) {
    console.log('  OK - All pages pass');
  } else {
    console.log('  ISSUES in ' + errorFiles.length + ' files:');
    errorFiles.forEach(function(e) {
      console.log('    ' + e.file + ': ' + e.issues.join(', '));
    });
  }
}

console.log('\n=== SUMMARY ===');
console.log('Total pages: ' + totalPages);
console.log('Total issues: ' + totalIssues);
console.log(totalIssues === 0 ? 'ALL PASS' : 'ISSUES FOUND: ' + totalIssues);
