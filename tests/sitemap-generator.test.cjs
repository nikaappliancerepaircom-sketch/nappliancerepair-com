const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');

test('sitemap keeps served canonical pages and excludes redirects, fragments, drafts and duplicates', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'service-sitemap-test-'));
  const generator = fs.readFileSync(path.join(__dirname, '..', 'gen-sitemap-full.js'), 'utf8')
    .replace(/const DOMAIN = '[^']+';/, "const DOMAIN = 'https://example.com';");
  fs.writeFileSync(path.join(fixture, 'gen-sitemap-full.js'), generator);
  fs.writeFileSync(path.join(fixture, 'vercel.json'), JSON.stringify({redirects: [
    {source: '/moved', destination: '/ajax', permanent: true},
    {source: '/:path*', has: [{type: 'host', value: 'www.example.com'}], destination: 'https://example.com/:path*'},
  ]}));
  function page(file, canonical, extra = '') {
    const target = path.join(fixture, file);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, `<html><head>${extra}<link href="${canonical}" rel="canonical"></head><body>Page</body></html>`);
  }
  page('index.html', 'https://example.com/');
  page('ajax.html', 'https://example.com/ajax');
  page('olds.html', 'https://example.com/olds');
  page('blog/index.html', 'https://example.com/blog');
  page('moved.html', 'https://example.com/moved');
  page('duplicate.html', 'https://example.com/ajax');
  page('draft.html', 'https://example.com/draft', '<meta content="noindex, follow" name="robots">');
  page('includes/header.html', 'https://example.com/includes/header');
  page('_queue/future.html', 'https://example.com/_queue/future');
  page('broken.html', 'https://example.com/broken.html');
  page('multiple.html', 'https://example.com/multiple', '<link rel="canonical" href="https://example.com/ajax">');
  page('www.html', 'https://www.example.com/www');
  page('unpublished.html', 'https://example.com/unpublished');
  const published = ['/', '/ajax', '/olds', '/blog/index', '/moved', '/duplicate', '/draft', '/includes/header', '/_queue/future', '/broken', '/multiple', '/www'];
  fs.writeFileSync(path.join(fixture, 'sitemap.xml'), '<urlset>' + published.map(route => `<url><loc>https://example.com${route}</loc></url>`).join('') + '</urlset>');
  execFileSync(process.execPath, [path.join(fixture, 'gen-sitemap-full.js')]);
  const xml = fs.readFileSync(path.join(fixture, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(urls, ['https://example.com/', 'https://example.com/ajax', 'https://example.com/blog', 'https://example.com/olds']);
  assert.equal(xml.includes('<lastmod>'), false, 'Checkout timestamps must not pretend to be content modification dates');
});
