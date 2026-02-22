fetch('/includes/header.html')
  .then(function(r) { return r.text(); })
  .then(function(html) {
    var placeholder = document.getElementById('header-placeholder');
    // Parse same-origin header HTML safely using DOMParser
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var nodes = doc.body.childNodes;
    var scripts = [];
    // Insert parsed nodes before placeholder
    while (nodes.length > 0) {
      var node = document.adoptNode(nodes[0]);
      if (node.nodeName === 'SCRIPT') {
        scripts.push(node.textContent);
      } else {
        placeholder.parentNode.insertBefore(node, placeholder);
      }
    }
    placeholder.parentNode.removeChild(placeholder);
    // Re-create and execute scripts (DOMParser scripts don't auto-execute)
    scripts.forEach(function(code) {
      var s = document.createElement('script');
      s.textContent = code;
      document.body.appendChild(s);
    });
  });
