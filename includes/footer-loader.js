fetch('/includes/footer.html')
  .then(function(r) { return r.text(); })
  .then(function(html) {
    var placeholder = document.getElementById('footer-placeholder');
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var nodes = doc.body.childNodes;
    var scripts = [];
    while (nodes.length > 0) {
      var node = document.adoptNode(nodes[0]);
      if (node.nodeName === 'SCRIPT') {
        scripts.push(node.textContent);
      } else {
        placeholder.parentNode.insertBefore(node, placeholder);
      }
    }
    placeholder.parentNode.removeChild(placeholder);
    scripts.forEach(function(code) {
      var s = document.createElement('script');
      s.textContent = code;
      document.body.appendChild(s);
    });
  });
