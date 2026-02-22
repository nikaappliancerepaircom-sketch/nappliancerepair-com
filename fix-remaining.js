const fs = require('fs');

function trimDesc(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  const m = c.match(/name="description" content="([^"]+)"/);
  if (m && m[1].length > 165) {
    const trimmed = m[1].substring(0, 158).trim() + '...';
    c = c.replace(/name="description" content="[^"]+"/, 'name="description" content="' + trimmed + '"');
    fs.writeFileSync(filePath, c);
    console.log('Fixed desc in ' + filePath + ': ' + m[1].length + ' -> ' + trimmed.length);
  }
}

function fixTitle(filePath, newTitle) {
  let c = fs.readFileSync(filePath, 'utf8');
  c = c.replace(/<title>[^<]+<\/title>/, '<title>' + newTitle + '</title>');
  fs.writeFileSync(filePath, c);
  console.log('Fixed title: ' + newTitle.length + ' chars');
}

trimDesc('C:/nappliancerepair/pricing.html');
trimDesc('C:/fixlifyservices/about.html');
fixTitle('C:/fixlifyservices/contact.html', 'Contact Fixlify Appliance Services | Toronto GTA');
