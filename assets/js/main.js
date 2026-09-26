(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var closeBtn = document.querySelector('[data-menu-close]');
  var root = document.documentElement;

  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!root.classList.contains('menu-open'));
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', function () { setMenu(false); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* en-tête qui se compacte légèrement au scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
      lastY = window.scrollY;
    }, { passive: true });
  }
})();
