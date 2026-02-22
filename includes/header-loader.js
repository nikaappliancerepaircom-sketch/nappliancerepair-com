fetch('/includes/header.html')
  .then(function(r) { return r.text(); })
  .then(function(html) {
    document.getElementById('header-placeholder').outerHTML = html;
  });
