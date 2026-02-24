import json,os
CSS = open('C:/nappliancerepair/blog/_queue/nar_css.txt',encoding='utf-8').read()
D = 'C:/nappliancerepair/blog/_queue/'
Q = chr(34)
SVG = ('<svg width=' + Q + '18' + Q + ' height=' + Q + '18' + Q + ' viewBox=' + Q + '0 0 24 24' + Q + ' fill=' + Q + 'none' + Q + ' stroke=' + Q + 'currentColor' + Q + ' stroke-width=' + Q + '2.5' + Q + ' stroke-linecap=' + Q + 'round' + Q + ' stroke-linejoin=' + Q + 'round' + Q + '><path d=' + Q + 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' + Q + '/></svg>')
BIZ = json.dumps({"@context":"https://schema.org","@type":"LocalBusiness","name":"N Appliance Repair","telephone":"+14375241053","url":"https://nappliancerepair.com","address":{"@type":"PostalAddress","addressLocality":"Toronto","addressRegion":"Ontario","addressCountry":"CA"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"312","bestRating":"5"}},separators=(",",":"))
def mkbc(slug,label): return json.dumps({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://nappliancerepair.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://nappliancerepair.com/blog/index.html"},{"@type":"ListItem","position":3,"name":label,"item":"https://nappliancerepair.com/blog/"+slug+".html"}]},separators=(",",":"))
def fqh(faqs): return ''.join('<div class=' + Q + 'faq-item' + Q + '><div class=' + Q + 'faq-q' + Q + '>' + q + '</div><div class=' + Q + 'faq-a' + Q + '>' + a + '</div></div>' + chr(10) for q,a in faqs)
def mk(slug,title,desc,tag,date,mread,art_schema,faq_schema,body_html):
    bc = mkbc(slug,title)
    dq = chr(34)
    h = []
    h.append('<!DOCTYPE html>')
    h.append('<html lang=' + dq + 'en' + dq + '>')
    h.append('<head>')
    h.append('<meta charset=' + dq + 'UTF-8' + dq + '>')
    h.append('<meta name=' + dq + 'viewport' + dq + ' content=' + dq + 'width=device-width,initial-scale=1' + dq + '>')
    h.append('<title>' + title + ' | N Appliance Repair Blog</title>')
    h.append('<meta name=' + dq + 'description' + dq + ' content=' + dq + desc + dq + '>')
    h.append('<link rel=' + dq + 'canonical' + dq + ' href=' + dq + 'https://nappliancerepair.com/blog/' + slug + '.html' + dq + '>')
    h.append('<link rel=' + dq + 'preconnect' + dq + ' href=' + dq + 'https://fonts.googleapis.com' + dq + '>')
    h.append('<link rel=' + dq + 'preconnect' + dq + ' href=' + dq + 'https://fonts.gstatic.com' + dq + ' crossorigin>')
    h.append('<link href=' + dq + 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap' + dq + ' rel=' + dq + 'stylesheet' + dq + '>')
    h.append('<script type=' + dq + 'application/ld+json' + dq + '>' + art_schema + '</script>')
    h.append('<script type=' + dq + 'application/ld+json' + dq + '>' + BIZ + '</script>')
    h.append('<script type=' + dq + 'application/ld+json' + dq + '>' + faq_schema + '</script>')
    h.append('<script type=' + dq + 'application/ld+json' + dq + '>' + bc + '</script>')
    h.append('<meta property=' + dq + 'og:title' + dq + ' content=' + dq + title + dq + '>')
    h.append('<meta property=' + dq + 'og:description' + dq + ' content=' + dq + desc + dq + '>')
    h.append('<meta property=' + dq + 'og:type' + dq + ' content=' + dq + 'article' + dq + '>')
    h.append('<meta property=' + dq + 'og:url' + dq + ' content=' + dq + 'https://nappliancerepair.com/blog/' + slug + '.html' + dq + '>')
    h.append('<style>' + CSS + '</style>')
    h.append('</head>')
    h.append('<body>')
    h.append('<div id=' + dq + 'header-placeholder' + dq + '></div>')
    h.append('<script src=' + dq + '/includes/header-loader.js' + dq + ' defer></script>')
    h.append('<main id=' + dq + 'main-content' + dq + '>')
    h.append('<div class=' + dq + 'blog-container' + dq + '>')
    h.append('<nav class=' + dq + 'breadcrumb' + dq + '><a href=' + dq + '/' + dq + '>Home</a> <span>&rsaquo;</span> <a href=' + dq + '/blog/index.html' + dq + '>Blog</a> <span>&rsaquo;</span> ' + title + '</nav>')
    h.append('<header class=' + dq + 'article-header' + dq + '>')
    h.append('<div class=' + dq + 'article-tag' + dq + '>' + tag + '</div>')
    h.append('<h1>' + title + '</h1>')
    h.append('<div class=' + dq + 'article-meta' + dq + '>Published ' + date + ' &middot; By <strong>N Appliance Repair</strong> &middot; ' + str(mread) + ' min read</div>')
    h.append('</header>')
    h.append('<article class=' + dq + 'article-body' + dq + '>')
    h.append(body_html)
    h.append('</article>')
    h.append('</div>')
    h.append('</main>')
    h.append('<div id=' + dq + 'footer-placeholder' + dq + '></div>')
    h.append('<script src=' + dq + '/includes/footer-loader.js' + dq + ' defer></script>')
    h.append('</body>')
    h.append('</html>')
    return chr(10).join(h)
def wp(slug,title,desc,tag,date,mread,art_schema,faq_schema,body_html):
    html = mk(slug,title,desc,tag,date,mread,art_schema,faq_schema,body_html)
    path = D + slug + '.html'
    open(path,'w',encoding='utf-8').write(html)
    print('Wrote ' + path + ' (' + str(len(html)) + ' bytes)')

# Post 1: Samsung Fridge Problems Toronto
_s1 = "samsung-fridge-problems-toronto"
_t1 = "Samsung Fridge Problems Toronto: Top Issues and How to Fix Them"
_d1 = "Samsung fridge not cooling, making noise, or leaking in Toronto? Learn the most common Samsung refrigerator problems and when to call a repair tech."
_tag1 = "Samsung Repair"
_dt1 = "February 25, 2026"
_r1 = 7
_fa1 = '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is the most common Samsung refrigerator problem?","acceptedAnswer":{"@type":"Answer","text":"The most common issue is the ice maker failing or freezing over, often caused by a defrost sensor fault. This affects Samsung French door and side-by-side models."}},{"@type":"Question","name":"Why is my Samsung fridge not cooling?","acceptedAnswer":{"@type":"Answer","text":"A failed evaporator fan, clogged condenser coils, or a faulty temperature sensor are the top causes. Ice buildup on evaporator coils from defrost system failure is also very common."}},{"@type":"Question","name":"How much does Samsung fridge repair cost in Toronto?","acceptedAnswer":{"@type":"Answer","text":"Most Samsung fridge repairs in Toronto cost between 180 and 380 dollars, depending on the part. Call N Appliance Repair at (437) 524-1053 for an exact quote."}},{"@type":"Question","name":"Is it worth repairing a Samsung refrigerator?","acceptedAnswer":{"@type":"Answer","text":"Yes, if the fridge is under 10 years old and the repair cost is less than 50 percent of replacement value. Samsung parts are widely available and most repairs are completed same-day."}}]}'
_ar1 = '{"@context":"https://schema.org","@type":"Article","headline":"Samsung Fridge Problems Toronto: Top Issues and How to Fix Them","datePublished":"2026-02-25","dateModified":"2026-02-25","author":{"@type":"Organization","name":"N Appliance Repair"},"publisher":{"@type":"Organization","name":"N Appliance Repair","url":"https://nappliancerepair.com"},"description":"Samsung fridge not cooling, making noise, or leaking in Toronto? Learn the most common Samsung refrigerator problems."}'
