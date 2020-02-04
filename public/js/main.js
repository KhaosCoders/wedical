;(function() {
  // load eruda
  var src = '/js/eruda.js';
  if (!/eruda=true/.test(window.location)
    && localStorage.getItem('active-eruda') != 'true') return;
  document.write('<scr'
    + 'ipt src="' + src + '"></scr'
    + 'ipt>');
  document.write('<scr'
    + 'ipt>eruda.init();</scr'
    + 'ipt>');
})();
