fetch('/includes/footer.html')
  .then(function(r) { return r.text(); })
  .then(function(html) {
    document.getElementById('footer-placeholder').outerHTML = html;
  });
