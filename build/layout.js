'use strict';
const { esc, img } = require('./lib');

function head(site, title, description, path) {
  const fullTitle = title ? `${title} — Groupe Déjà` : 'Groupe Déjà — Théâtre & interventions';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || 'Groupe Déjà, compagnie de théâtre dirigée par Sébastian Lazennec — Le Mans, Sarthe. Théâtre, interventions et créations sur mesure.')}">
<link rel="canonical" href="https://groupedeja.com${path || '/'}">
<link rel="icon" href="/assets/images/2018/10/cropped-groupe-deja-ICO-32x32.jpg" sizes="32x32">
<link rel="icon" href="/assets/images/2018/10/cropped-groupe-deja-ICO-192x192.jpg" sizes="192x192">
<link rel="apple-touch-icon" href="/assets/images/2018/10/cropped-groupe-deja-ICO-180x180.jpg">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<a class="skip-link" href="#main">Aller au contenu</a>
`;
}

function headerNav(site, activeHref) {
  const groups = site.nav.groups.map((g, i) => {
    const links = g.links.map(l => `<a href="${l.href}"${l.href === activeHref ? ' aria-current="page"' : ''}>${esc(l.label)}</a>`).join('\n');
    return `<div class="site-nav__col">\n<h4>${esc(g.label)}</h4>\n${links}\n</div>`;
  }).join('\n');

  return `<header class="site-header">
  <div class="site-header__bar">
    <a class="brand" href="/">
      ${img('2018/10/GroupeDejaLogoNoir_100px.png', 'Groupe Déjà', { eager: true })}
      <span class="brand__text">Groupe Déjà<span class="brand__tag">Théâtre &amp; interventions</span></span>
    </a>
    <button class="menu-toggle" data-menu-toggle aria-expanded="false" aria-controls="site-nav">
      <span class="bars"><span></span><span></span><span></span></span>
      Menu
    </button>
  </div>
</header>
<nav class="site-nav" id="site-nav">
  <button class="site-nav__close link" data-menu-close aria-label="Fermer le menu">Fermer ×</button>
  <div class="site-nav__inner">
    <div class="site-nav__list">
      <a href="/"${activeHref === '/' ? ' aria-current="page"' : ''}><span class="no">00</span> Accueil</a>
      <a href="/spectacles/"><span class="no">01</span> Spectacles</a>
      <a href="/presentation/"><span class="no">02</span> La compagnie</a>
      <a href="/sur-mesure/"><span class="no">03</span> Sur mesure</a>
      <a href="/agenda/"><span class="no">04</span> Agenda</a>
      <a href="/actus/"><span class="no">05</span> Actus</a>
      <a href="/contact/"><span class="no">06</span> Contact</a>
    </div>
    <div class="site-nav__side">
      ${groups}
      <div class="site-nav__col">
        <h4>Suivez Groupe Déjà</h4>
        ${site.socials.map(s => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('\n')}
      </div>
    </div>
  </div>
</nav>
`;
}

function footer(site) {
  const g = site.nav.groups;
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <h4>Groupe Déjà</h4>
        <p class="muted" style="max-width:34ch">${esc(site.contact.addressLines.join(' — '))}</p>
        <p class="mt-2"><a class="link link--ember" href="/contact/">${esc(site.footer.cta)}</a></p>
      </div>
      <div>
        <h4>La compagnie</h4>
        <ul>${g[0].links.map(l => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Spectacles &amp; sur mesure</h4>
        <ul>
          <li><a href="/spectacles/">Spectacles</a></li>
          <li><a href="/sur-mesure/">Sur mesure</a></li>
          <li><a href="/actions-culturelles/">Actions culturelles</a></li>
          <li><a href="/stages/">Stages</a></li>
        </ul>
      </div>
      <div>
        <h4>Suivre l'actualité</h4>
        <ul>
          <li><a href="/agenda/">Agenda &amp; tournées</a></li>
          <li><a href="/actus/">Actus</a></li>
          <li><a href="/presse/">Presse</a></li>
          <li><a href="/contact/">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© ${new Date().getFullYear()} Groupe Déjà — <a href="/mentions-legales/">Mentions légales</a></div>
      <div class="socials">
        ${site.socials.map(s => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}
      </div>
    </div>
  </div>
</footer>
<script src="/assets/js/main.js"></script>
</body>
</html>
`;
}

function page(site, { title, description, path, activeHref, body }) {
  return head(site, title, description, path) + headerNav(site, activeHref) + `<main id="main">${body}</main>` + footer(site);
}

module.exports = { page };
