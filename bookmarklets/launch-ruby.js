(function() {
  delete window.iAdvize;
  window.iAdvizeInterface ||= [];
  window.iAdvizeInterface.config = {
    lang: 'fr',
    sid: '7316'
  };
  window.iAdvizeInterface.push((iAdvize) => {
    iAdvize.navigate('_blank');
    setTimeout(function() {
      iAdvize.navigate('ruby');
    }, 1000);
  });
  var script = document.createElement('script');
  script.src = 'https://halc.iadvize.com/iadvize.js';
  document.body.appendChild(script)
})();
