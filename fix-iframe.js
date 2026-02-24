const fs = require('fs');
const path = require('path');

const ROOT = 'C:/nappliancerepair';

const NEW_IFRAME = `<iframe id="fixlify-booking-nicks-appliance-repair-b8c8ce" src="https://hub.fixlify.app/book/nicks-appliance-repair-b8c8ce?embed=true" style="width:100%;height:600px;border:none;display:block;" title="Book a Service" loading="lazy" allowtransparency="true"></iframe>
<script>
window.addEventListener('message',function(e){if(e.data&&e.data.type==='fixlify-resize'){var el=document.getElementById('fixlify-booking-nicks-appliance-repair-b8c8ce');if(el)el.style.height=e.data.height+'px';}});
</script>`;

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      results = results.concat(getAllHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllHtmlFiles(ROOT);
let changed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('hub.fixlify.app/book/nicks-appliance-repair-b8c8ce')) continue;
  if (content.includes('fixlify-booking-nicks-appliance-repair-b8c8ce') && content.includes('fixlify-resize')) continue;
  
  const original = content;
  
  // Remove old resize script if present
  content = content.replace(/<script>\s*window\.addEventListener\('message',function\(e\)\{if\(e\.data&&e\.data\.type===.fixlify-resize.\)[\s\S]*?<\/script>/g, '');
  
  // Replace old iframe tag
  content = content.replace(/<iframe[^>]*hub\.fixlify\.app\/book\/nicks-appliance-repair-b8c8ce[^>]*>[\s\S]*?<\/iframe>/g, NEW_IFRAME);
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Updated:', file.replace(ROOT + '/', ''));
  }
}

console.log(`\nDone! Updated ${changed} files out of ${files.length} HTML files.`);
