'use strict';
const { readJSON, esc, t, img, writePage, writeFile, paragraphs, slugPath } = require('./lib');
const { page } = require('./layout');

const site = readJSON('site.json');
const home = readJSON('home.json');
const presentation = readJSON('presentation.json');
const team = readJSON('team.json');
const spectacles = readJSON('spectacles.json');
const miseEnScene = readJSON('mise-en-scene.json');
const surMesure = readJSON('sur-mesure.json');
const actionsCulturelles = readJSON('actions-culturelles.json');
const stages = readJSON('stages.json');
const presse = readJSON('presse.json');
const collectifGM = readJSON('collectif-grand-maximum.json');
const agenda = readJSON('agenda.json');
const actus = readJSON('actus.json');

const showBySlug = {};
spectacles.forEach(s => showBySlug[s.slug] = s);

function video(v) {
  if (!v) return '';
  const src = v.provider === 'vimeo'
    ? `https://player.vimeo.com/video/${v.id}?dnt=1`
    : `https://www.youtube.com/embed/${v.id}${v.start ? `?start=${v.start}` : ''}`;
  return `<div class="video-embed" style="position:relative;padding-top:56.25%;background:#000">
    <iframe src="${src}" title="${esc(v.title || '')}" style="position:absolute;inset:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
  ${v.title ? `<p class="muted" style="font-size:.85rem;margin-top:8px">${esc(v.title)}</p>` : ''}`;
}

function showNavStrip(currentSlug) {
  const items = spectacles.map(s => `<a class="link" href="/spectacles/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>${esc(s.title)}</a>`).join('\n');
  return `<nav class="tag-cloud" aria-label="Autres spectacles">${items}</nav>`;
}

/* ---------------- ACCUEIL ---------------- */
function renderHome() {
  const showCards = spectacles.slice(0, 6).map(s => `
    <a class="show-card" href="/spectacles/${s.slug}/">
      <div class="show-card__frame">${img(s.hero_image, s.title)}</div>
      <div class="show-card__label"><span class="tag">Spectacle</span><h3>${esc(s.title)}</h3></div>
    </a>`).join('\n');

  const upcoming = agenda.sections.filter(s => !/^AGENDA/i.test(s.title)).flatMap(s => s.entries.map(e => ({ section: s.title, text: e })))
    .slice(0, 6);
  const upcomingHtml = upcoming.map(u => `<div class="listing-row"><time>${esc(u.section)}</time><div>${esc(u.text)}</div></div>`).join('\n');

  const latestActus = actus.slice(0, 3).map(p => `
    <a class="listing-row" href="${actuPath(p)}">
      <time>${formatDate(p.date)}</time>
      <h3>${esc(p.title)}</h3>
      <span class="go">Lire →</span>
    </a>`).join('\n');

  const pressPicks = presse.slice(0, 3).map(p => `
    <div class="press-quote">
      <blockquote>« ${esc(truncate(p.quote, 220))} »</blockquote>
      <cite><b>${esc(p.source)}</b>${p.date ? `, ${esc(p.date)}` : ''} — ${esc(p.show)}</cite>
    </div>`).join('\n');

  const body = `
  <section class="hero">
    <div class="hero__media">${img(spectacles[0].hero_image, home.hero_title, { eager: true })}</div>
    <div class="hero__body">
      <p class="eyebrow" style="color:var(--paper-3)">${esc(home.hero_kicker)}</p>
      <h1 class="h-display">${esc(home.hero_title)}</h1>
      <p class="lede" style="color:rgba(245,239,226,.86);max-width:52ch;margin-top:18px">${esc(home.hero_intro)}</p>
      <p class="hero__credit">${esc(home.hero_credit)}</p>
    </div>
  </section>

  <section class="wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(home.sections_intro.shows)}</p>
      <h2 class="h-1 mt-1">${esc(home.sections_intro.shows_sub)}</h2>
    </div>
    <div class="grid grid--3">${showCards}</div>
    <p class="mt-3"><a class="link link--ember" href="/spectacles/">Voir tous les spectacles →</a></p>
  </section>

  <section class="wrap grid--asym grid">
    <div>
      <p class="eyebrow">Présentation</p>
      <h2 class="h-1 mt-1">${esc(presentation.paragraphs[0].split('.')[0])}.</h2>
      <div class="prose mt-2">${paragraphs(presentation.paragraphs.slice(1, 3))}</div>
      <p class="mt-2"><a class="link link--ember" href="/presentation/">Découvrir la compagnie →</a></p>
    </div>
    <div>${img(spectacles[1].hero_image, spectacles[1].title)}</div>
  </section>

  <section class="wrap">
    <div class="section-head">
      <p class="eyebrow">${esc(home.sections_intro.agenda)}</p>
      <h2 class="h-1 mt-1">Sur les routes</h2>
    </div>
    <div class="rule-list">${upcomingHtml}</div>
    <p class="mt-3"><a class="link link--ember" href="/agenda/">Tout l'agenda →</a></p>
  </section>

  <section class="wrap grid grid--2">
    <div>
      <p class="eyebrow">${esc(home.sections_intro.actus)}</p>
      <h2 class="h-2 mt-1">Actus</h2>
      <div class="rule-list mt-2">${latestActus}</div>
      <p class="mt-2"><a class="link link--ember" href="/actus/">Toutes les actus →</a></p>
    </div>
    <div>
      <p class="eyebrow">${esc(home.sections_intro.press)}</p>
      <h2 class="h-2 mt-1">Presse</h2>
      ${pressPicks}
      <p class="mt-2"><a class="link link--ember" href="/presse/">Toute la revue de presse →</a></p>
    </div>
  </section>

  <section class="callout callout--ink">
    <div class="wrap center">
      <p class="eyebrow" style="color:var(--ember)">Créations sur mesure</p>
      <h2 class="h-1 mt-1">Un projet, un événement à mettre en scène ?</h2>
      <p class="lede mt-2" style="color:rgba(245,239,226,.8)">Groupe Déjà écrit et met en scène des interventions théâtrales sur mesure, en entreprise comme dans l'espace public.</p>
      <p class="mt-3"><a class="btn btn--ember" href="/sur-mesure/">Découvrir le sur mesure</a> <a class="btn" style="border-color:var(--paper);color:var(--paper)" href="/contact/">Nous contacter</a></p>
    </div>
  </section>
  `;
  writePage('/', page(site, { title: null, path: '/', activeHref: '/', body }));
}

function truncate(s, n) { return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s; }

/* ---------------- PRESENTATION ---------------- */
function renderPresentation() {
  const body = `
  <div class="page-head">
    <p class="eyebrow">La compagnie</p>
    <h1 class="h-display mt-1">Présentation</h1>
  </div>
  <section class="wrap">
    <div class="prose lede">${paragraphs(presentation.paragraphs)}</div>
    <div class="mt-4">
      <p class="eyebrow">Soutiens &amp; réseaux</p>
      <div class="rule-list mt-2">${presentation.conventions.map(c => `<div style="padding:16px 0">${esc(c)}</div>`).join('')}</div>
    </div>
  </section>
  <section class="wrap grid grid--3">
    <div><h3 class="h-3">Sébastian Lazennec</h3><p class="muted mt-1">Responsable artistique</p><p class="mt-2"><a class="link" href="/sebastian-lazennec/">Sa trajectoire →</a></p></div>
    <div><h3 class="h-3">Équipe</h3><p class="muted mt-1">Artistes &amp; techniciens</p><p class="mt-2"><a class="link" href="/equipe/">Toute l'équipe →</a></p></div>
    <div><h3 class="h-3">Collectif Grand maximum</h3><p class="muted mt-1">Comédien·nes non professionnel·les</p><p class="mt-2"><a class="link" href="/collectif-grand-maximum/">En savoir plus →</a></p></div>
  </section>
  `;
  writePage('/presentation/', page(site, { title: 'Présentation', path: '/presentation/', activeHref: '/presentation/', body }));
}

/* ---------------- SEBASTIAN LAZENNEC ---------------- */
function renderSebastian() {
  const body = `
  <div class="page-head page-head--split">
    <div><p class="eyebrow">La compagnie</p><h1 class="h-display mt-1">Sébastian Lazennec</h1></div>
    <p class="lede">Responsable artistique, comédien, metteur en scène, auteur.</p>
  </div>
  <section class="wrap grid grid--asym">
    <div class="prose">${paragraphs(team.sebastian.paragraphs)}
      <p class="mt-3"><a class="link link--ember" href="/assets/${team.sebastian.cv_file}" target="_blank">${esc(team.sebastian.cv_label)} (PDF) →</a></p>
    </div>
    <div>${img('2023/03/R-.jpg', 'Sébastian Lazennec')}</div>
  </section>
  `;
  writePage('/sebastian-lazennec/', page(site, { title: 'Sébastian Lazennec', path: '/sebastian-lazennec/', activeHref: '/sebastian-lazennec/', body }));
}

/* ---------------- EQUIPE ---------------- */
function renderEquipe() {
  const roster = team.roster.map(m => `<div class="listing-row" style="grid-template-columns:1fr"><h3>${esc(m.name)}</h3><p class="muted mt-1" style="grid-column:1">${esc(m.role)}</p></div>`).join('\n');
  const spotlight = team.spotlight.map(p => `
    <div class="team-card">
      <div class="team-card__photo">${img(p.photo, p.name)}</div>
      <div>
        <h3>${esc(p.name)}</h3>
        ${p.credit ? `<p class="muted" style="font-size:.78rem">${esc(p.credit)}</p>` : ''}
        <p>${esc(truncate(p.bio, 480))}</p>
      </div>
    </div>`).join('\n');

  const body = `
  <div class="page-head">
    <p class="eyebrow">La compagnie</p>
    <h1 class="h-display mt-1">Équipe</h1>
  </div>
  <section class="wrap">
    <p class="eyebrow">${esc(team.spotlight_title)}</p>
    <div class="grid grid--2 mt-2">${spotlight}</div>
  </section>
  <section class="wrap">
    <p class="eyebrow">Toute l'équipe</p>
    <div class="rule-list mt-2">${roster}</div>
    <p class="muted mt-2">${esc(team.roster_note)}</p>
  </section>
  `;
  writePage('/equipe/', page(site, { title: 'Équipe', path: '/equipe/', activeHref: '/equipe/', body }));
}

/* ---------------- COLLECTIF GRAND MAXIMUM ---------------- */
function renderCGM() {
  const body = `
  <div class="page-head">
    <p class="eyebrow">La compagnie</p>
    <h1 class="h-display mt-1">Collectif Grand maximum</h1>
    <p class="lede mt-2">${esc(collectifGM.intro)}</p>
  </div>
  <section class="wrap grid grid--asym">
    <div class="prose">${paragraphs(collectifGM.paragraphs)}</div>
    <div>${img('2019/06/Grand-maximum-la-cene.jpg', 'Grand maximum')}</div>
  </section>
  <section class="callout">
    <div class="wrap">
      <h2 class="h-2">Grand maximum fête ses 20 ans</h2>
      <p class="mt-2">${esc(collectifGM.anniversary_note)}</p>
      <p class="mt-2"><a class="btn btn--ember" href="${esc(collectifGM.ticketing_url)}" target="_blank" rel="noopener">${esc(collectifGM.ticketing_label)}</a></p>
    </div>
  </section>
  <section class="wrap">
    <div class="prose">${paragraphs(collectifGM.outro)}</div>
    <p class="mt-2"><a class="link link--ember" href="${esc(collectifGM.external_url)}" target="_blank" rel="noopener">${esc(collectifGM.external_label)} →</a></p>
  </section>
  `;
  writePage('/collectif-grand-maximum/', page(site, { title: 'Collectif Grand maximum', path: '/collectif-grand-maximum/', activeHref: '/collectif-grand-maximum/', body }));
}

/* ---------------- MISE EN SCENE ---------------- */
function renderMiseEnScene() {
  const rows = miseEnScene.entries.map(e => `<div class="listing-row" style="grid-template-columns:140px 1fr"><time>${esc(e.year)}</time><div>${esc(e.text)}</div></div>`).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">La compagnie</p>
    <h1 class="h-display mt-1">Mises en scène</h1>
    <p class="lede mt-2">${esc(miseEnScene.intro)}</p>
  </div>
  <section class="wrap"><div class="rule-list">${rows}</div></section>
  `;
  writePage('/mise-en-scene/', page(site, { title: 'Mises en scène', path: '/mise-en-scene/', activeHref: '/mise-en-scene/', body }));
}

/* ---------------- SPECTACLES (listing) ---------------- */
function renderSpectaclesListing() {
  const cards = spectacles.map(s => `
    <a class="show-card" href="/spectacles/${s.slug}/">
      <div class="show-card__frame">${img(s.hero_image, s.title)}</div>
      <div class="show-card__label"><span class="tag">Spectacle</span><h3>${esc(s.title)}</h3></div>
    </a>`).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">Spectacles en tournée</p>
    <h1 class="h-display mt-1">Spectacles</h1>
    <p class="lede mt-2">Cliquez sur chaque image pour entrer et avoir les infos sur les spectacles en tournée.</p>
  </div>
  <section class="wrap"><div class="grid grid--3">${cards}</div></section>
  <section class="wrap">
    <p class="eyebrow">Laboratoires artistiques</p>
    <p class="prose mt-2">Groupe Déjà mène également des résidences exploratoires et laboratoires de création — retrouvez-les au fil de l'<a class="prose-link" href="/actus/">actualité</a> et de l'<a href="/agenda/">agenda</a>.</p>
  </section>
  `;
  writePage('/spectacles/', page(site, { title: 'Spectacles', path: '/spectacles/', activeHref: '/spectacles/', body }));
}

/* ---------------- SPECTACLE (detail) ---------------- */
function creditsBlock(credits) {
  if (!credits) return '';
  return `<dl class="credits mt-2">` + credits.map(c => `<dt>${esc(c.role)}</dt><dd>${esc(c.value)}</dd>`).join('') + `</dl>`;
}
function pressBlock(press) {
  if (!press) return '';
  return press.map(p => `<div class="press-quote"><blockquote>« ${esc(p.quote)} »</blockquote><cite><b>${esc(p.source)}</b></cite></div>`).join('\n');
}
function galleryBlock(images, title) {
  if (!images || !images.length) return '';
  return `<div class="gallery">${images.map(i => `<div class="gallery__item">${img(i, title)}</div>`).join('')}</div>`;
}

function renderSpectacleDetail(s) {
  const body = `
  <section class="hero" style="min-height:64vh">
    <div class="hero__media">${img(s.hero_image, s.title, { eager: true })}</div>
    <div class="hero__body">
      <p class="eyebrow hero__kicker">Spectacle</p>
      <h1 class="h-display">${esc(s.title)}</h1>
      ${s.tagline ? `<p class="lede mt-2" style="color:rgba(245,239,226,.86);max-width:56ch">${esc(s.tagline)}</p>` : ''}
      ${s.audience_note ? `<p class="hero__credit">${esc(s.audience_note)}</p>` : ''}
    </div>
  </section>

  <section class="wrap grid grid--asym">
    <div class="prose lede">
      ${s.kicker ? `<p class="eyebrow">${esc(s.kicker)}</p>` : ''}
      ${paragraphs(s.synopsis)}
      ${s.status_note ? `<p class="mt-2"><b>${esc(s.status_note)}</b></p>` : ''}
      ${s.acknowledgement ? `<p class="mt-2 muted">${esc(s.acknowledgement)}</p>` : ''}
    </div>
    <div>
      ${s.distinctions ? `<div class="callout mt-0"><p class="eyebrow">Distinctions</p><ul class="mt-2" style="display:flex;flex-direction:column;gap:8px">${s.distinctions.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>` : ''}
      ${s.dossier ? `<p class="mt-3"><a class="btn btn--ember" href="/assets/${s.dossier.file}" target="_blank">${esc(s.dossier.label)} (PDF)</a></p>` : ''}
      ${s.pedagogic_note ? `<p class="muted mt-2">${esc(s.pedagogic_note)}</p>` : ''}
      ${s.press_kit_file ? `<p class="mt-1"><a class="link" href="/assets/${s.press_kit_file}" target="_blank">Télécharger la revue de presse (PDF) →</a></p>` : ''}
    </div>
  </section>

  ${s.credits ? `<section class="wrap"><p class="eyebrow">L'équipe</p>${creditsBlock(s.credits)}</section>` : ''}

  ${s.video ? `<section class="wrap">${video(s.video)}</section>` : ''}
  ${s.video_2 ? `<section class="wrap tight">${video(s.video_2)}</section>` : ''}
  ${s.video_3 ? `<section class="wrap tight">${video(s.video_3)}</section>` : ''}

  ${s.press ? `<section class="wrap"><p class="eyebrow">Presse</p><div class="mt-2">${pressBlock(s.press)}</div></section>` : ''}

  ${s.testimonials ? `<section class="wrap"><p class="eyebrow">${esc(s.testimonials_title || '')}</p><div class="grid grid--2 mt-2">${s.testimonials.map(tst => `<div class="press-quote"><blockquote>« ${esc(tst.quote)} »</blockquote><cite>${esc(tst.author)}</cite></div>`).join('')}</div></section>` : ''}

  ${s.intention ? `<section class="wrap"><p class="eyebrow">${esc(s.intention_title || '')}</p><div class="prose mt-2">${paragraphs(s.intention)}</div></section>` : ''}

  ${s.residencies ? `<section class="wrap"><p class="eyebrow">${esc(s.residencies_title || 'Résidences')}</p><ul class="mt-2" style="columns:2;gap:32px">${s.residencies.map(r => `<li style="margin-bottom:6px">${esc(r)}</li>`).join('')}</ul></section>` : ''}

  ${s.run_regions ? `<section class="wrap"><p class="eyebrow">${esc(s.run_note || '')}</p><ul class="mt-2" style="columns:2;gap:32px">${s.run_regions.map(r => `<li style="margin-bottom:6px">${esc(r)}</li>`).join('')}</ul></section>` : ''}
  ${s.run_list ? `<section class="wrap"><p class="eyebrow">${esc(s.run_note || '')}</p><ul class="mt-2" style="columns:2;gap:32px">${s.run_list.map(r => `<li style="margin-bottom:6px">${esc(r)}</li>`).join('')}</ul></section>` : ''}
  ${s.run_note && !s.run_regions && !s.run_list ? `<section class="wrap"><p class="prose">${esc(s.run_note)}</p></section>` : ''}

  ${s.support_note ? `<section class="wrap"><p class="prose muted">${esc(s.support_note)}</p></section>` : ''}
  ${s.partners_note ? `<section class="wrap"><div class="prose muted">${paragraphs(s.partners_note)}</div></section>` : ''}
  ${s.variants_note ? `<section class="wrap tight"><p class="muted">${esc(s.variants_note)}</p></section>` : ''}

  ${s.gallery ? `<section class="wrap"><p class="eyebrow">Photographies</p><div class="mt-2">${galleryBlock(s.gallery, s.title)}</div></section>` : ''}

  <section class="wrap">
    <p class="eyebrow">Autres spectacles</p>
    <div class="mt-2">${showNavStrip(s.slug)}</div>
    <p class="mt-3"><a class="link" href="/spectacles/">← Retour page Spectacles</a></p>
  </section>
  `;
  writePage(`/spectacles/${s.slug}/`, page(site, { title: s.title, description: s.tagline, path: `/spectacles/${s.slug}/`, activeHref: '/spectacles/', body }));
}

/* ---------------- SUR MESURE ---------------- */
function renderSurMesureHub() {
  const h = surMesure.hub;
  const subLinks = surMesure.subpages.map(sp => `<a class="link link--ember" href="/sur-mesure/${sp.slug}/">${esc(sp.title)} →</a>`).join('<br><br>');
  const sections = h.sections.map(sec => `
    <div>
      <h3 class="h-3">${esc(sec.title)}</h3>
      <ul class="mt-2" style="display:flex;flex-direction:column;gap:10px">${sec.items.map(i => `<li class="prose">${esc(i)}</li>`).join('')}</ul>
    </div>`).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">${esc(h.kicker)}</p>
    <h1 class="h-display mt-1">${esc(h.title)}</h1>
  </div>
  <section class="wrap"><div class="prose lede">${paragraphs(h.intro)}</div></section>
  <section class="wrap callout"><p>${subLinks}</p></section>
  <section class="wrap"><div class="grid grid--2" style="row-gap:56px">${sections}</div></section>
  `;
  writePage('/sur-mesure/', page(site, { title: 'Créations sur mesure', path: '/sur-mesure/', activeHref: '/sur-mesure/', body }));
}

function renderSurMesureSub(sp) {
  let content = '';
  if (sp.entries) {
    content = sp.entries.map(e => `<div class="mt-3"><h3 class="h-3">${esc(e.title)}</h3><p class="prose mt-1">${esc(e.text)}</p></div>`).join('\n');
  } else if (sp.items) {
    content = `<div class="prose">${sp.intro ? `<p>${esc(sp.intro)}</p>` : ''}<ul class="mt-2" style="display:flex;flex-direction:column;gap:10px">${sp.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>${sp.outro ? `<p class="mt-2">${esc(sp.outro)}</p>` : ''}</div>`;
  }
  const body = `
  <div class="page-head">
    <p class="eyebrow">Sur mesure</p>
    <h1 class="h-display mt-1">${esc(sp.title)}</h1>
  </div>
  <section class="wrap">${content}
    <p class="mt-4"><a class="link" href="/sur-mesure/">← Retour page Sur mesure</a></p>
  </section>
  `;
  writePage(`/sur-mesure/${sp.slug}/`, page(site, { title: sp.title, path: `/sur-mesure/${sp.slug}/`, activeHref: '/sur-mesure/', body }));
}

/* ---------------- ACTIONS CULTURELLES ---------------- */
function renderActionsCulturelles() {
  const sections = actionsCulturelles.sections.map(sec => {
    let inner = '';
    if (sec.items) {
      inner = `<ul class="mt-2" style="display:flex;flex-direction:column;gap:10px">${sec.items.map(i => `<li class="prose">${esc(i)}</li>`).join('')}</ul>`;
    }
    if (sec.subsections) {
      inner = sec.subsections.map(sub => `
        <div class="mt-3">
          <h4 class="h-3" style="font-size:1.05rem">${esc(sub.title)}</h4>
          <ul class="mt-2" style="display:flex;flex-direction:column;gap:10px">${sub.items.map(i => `<li class="prose">${esc(i)}</li>`).join('')}</ul>
        </div>`).join('');
    }
    return `<div class="mt-4"><h3 class="h-2">${esc(sec.title)}</h3>${inner}${sec.see_also ? `<p class="muted mt-2">${esc(sec.see_also)}</p>` : ''}</div>`;
  }).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">Transmission</p>
    <h1 class="h-display mt-1">Actions culturelles</h1>
  </div>
  <section class="wrap"><div class="prose lede">${paragraphs(actionsCulturelles.intro)}</div></section>
  <section class="wrap">${sections}</section>
  <section class="callout"><div class="wrap"><p>${esc(actionsCulturelles.stages_note)} <a class="link link--ember" href="/stages/">Voir les stages →</a></p></div></section>
  `;
  writePage('/actions-culturelles/', page(site, { title: 'Actions culturelles', path: '/actions-culturelles/', activeHref: '/actions-culturelles/', body }));
}

/* ---------------- STAGES ---------------- */
function renderStages() {
  const years = stages.years.map(y => `
    <div class="mt-4">
      <h3 class="h-2">${esc(y.year)}</h3>
      ${y.note ? `<p class="muted mt-1">${esc(y.note)}</p>` : ''}
      <div class="rule-list mt-2">
        ${y.sessions.map(s => `
          <div style="padding:22px 0">
            <p class="eyebrow">${esc(s.dates)}${s.cancelled ? ' — annulé' : ''}</p>
            <h4 class="h-3 mt-1">${esc(s.title)}</h4>
            <p class="prose mt-1">${esc(s.text)}</p>
            <p class="muted mt-1" style="font-size:.85rem">${esc(s.speaker)}${s.place ? ` — ${esc(s.place)}` : ''}</p>
          </div>`).join('')}
      </div>
    </div>`).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">Transmission</p>
    <h1 class="h-display mt-1">Stages</h1>
    <p class="lede mt-2">${esc(stages.status_note)}</p>
  </div>
  <section class="wrap"><div class="prose">${paragraphs(stages.intro)}</div></section>
  <section class="wrap">${years}</section>
  `;
  writePage('/stages/', page(site, { title: 'Stages', path: '/stages/', activeHref: '/stages/', body }));
}

/* ---------------- PRESSE ---------------- */
function renderPresse() {
  const items = presse.map(p => `
    <div class="press-quote">
      <blockquote>« ${esc(p.quote)} »</blockquote>
      <cite><b>${esc(p.source)}</b>${p.date ? `, ${esc(p.date)}` : ''}${p.author ? ` — ${esc(p.author)}` : ''} · <i>${esc(p.show)}</i>${p.rating ? ` · ${esc(p.rating)}` : ''}</cite>
    </div>`).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">Actualités</p>
    <h1 class="h-display mt-1">Groupe Déjà dans la presse</h1>
  </div>
  <section class="wrap rule-list">${items}</section>
  `;
  writePage('/presse/', page(site, { title: 'Presse', path: '/presse/', activeHref: '/presse/', body }));
}

/* ---------------- AGENDA ---------------- */
function renderAgenda() {
  const sections = agenda.sections.map(s => {
    if (/^AGENDA/i.test(s.title)) {
      return `<div class="callout mt-4"><h2 class="h-2">${esc(s.title)}</h2><div class="prose mt-2">${paragraphs(s.entries)}</div></div>`;
    }
    return `<div class="mt-4"><h3 class="h-3">${esc(s.title)}</h3><div class="rule-list mt-2">${s.entries.map(e => `<div style="padding:14px 0">${esc(e)}</div>`).join('')}</div></div>`;
  }).join('\n');
  const body = `
  <div class="page-head">
    <p class="eyebrow">Actualités</p>
    <h1 class="h-display mt-1">Agenda &amp; tournées</h1>
  </div>
  <section class="wrap">${sections}</section>
  `;
  writePage('/agenda/', page(site, { title: 'Agenda & tournées', path: '/agenda/', activeHref: '/agenda/', body }));
}

/* ---------------- CONTACT ---------------- */
function renderContact() {
  const c = site.contact;
  const body = `
  <div class="page-head">
    <p class="eyebrow">Contact</p>
    <h1 class="h-display mt-1">${esc(c.orgName)}</h1>
  </div>
  <section class="wrap grid grid--asym">
    <div class="prose">
      <p>${esc(c.addressLines.join(' — '))}</p>
      <p class="mt-2">Tel : ${esc(c.phoneMobile)}<br>Bureau : ${esc(c.phoneOffice)}</p>
      <p class="mt-2"><a class="link link--ember" href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
      <div class="mt-3">
        ${c.team.map(m => `<p>${esc(m.name)} <span class="muted">/ ${esc(m.role)}</span></p>`).join('')}
      </div>
    </div>
    <form class="callout" action="mailto:${esc(c.email)}" method="post" enctype="text/plain">
      <div class="field"><label for="f-name">${esc(c.form.nameLabel)}</label><input id="f-name" name="nom" required></div>
      <div class="field"><label for="f-email">${esc(c.form.emailLabel)}</label><input id="f-email" name="email" type="email" required></div>
      <label class="check"><input type="checkbox" name="newsletter"> ${esc(c.form.consentLabel)}</label>
      <p class="mt-3"><button class="btn btn--solid" type="submit">Envoyer</button></p>
      <p class="muted mt-2" style="font-size:.8rem">${esc(c.form.successMessage)}</p>
    </form>
  </section>
  `;
  writePage('/contact/', page(site, { title: 'Contact', path: '/contact/', activeHref: '/contact/', body }));
}

/* ---------------- MENTIONS LEGALES ---------------- */
function renderMentionsLegales() {
  const l = site.legal;
  const body = `
  <div class="page-head"><p class="eyebrow">Informations</p><h1 class="h-display mt-1">Mentions légales</h1></div>
  <section class="wrap prose">
    <p><b>${esc(l.orgLine)}</b></p>
    <p>${esc(l.address)}<br>${esc(l.phone)}<br><a class="link" href="mailto:${esc(l.email)}">${esc(l.email)}</a></p>
    <p class="mt-2">${esc(l.siret)}<br>${esc(l.ape)}<br>${esc(l.tva)}<br>${esc(l.licences)}</p>
    <p class="mt-2">${esc(l.hosting)} / ${esc(l.webdesignLabel)} <a class="link" href="${esc(l.webdesignUrl)}" target="_blank" rel="noopener">${esc(l.webdesignUrl.replace('https://', ''))}</a></p>
    <p class="mt-2">${esc(l.publisher)}</p>
    <h2 class="h-2 mt-4">${esc(l.photoCreditsTitle)}</h2>
    <ul class="mt-2" style="display:flex;flex-direction:column;gap:6px">${l.photoCredits.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <h2 class="h-2 mt-4">${esc(l.privacyTitle)}</h2>
    <p class="mt-2">${esc(l.privacyText)}</p>
    <h2 class="h-2 mt-4">Conventions et adhésions</h2>
    <ul class="mt-2" style="display:flex;flex-direction:column;gap:6px">${site.partners.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
  </section>
  `;
  writePage('/mentions-legales/', page(site, { title: 'Mentions légales', path: '/mentions-legales/', activeHref: '/mentions-legales/', body }));
}

/* ---------------- ACTUS ---------------- */
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}
function actuPath(p) {
  return `/actus/${p.year}/${p.month}/${p.day}/${slugFromFile(p)}/`;
}
function slugFromFile(p) {
  const parts = p.slug_file.split('__');
  return parts.slice(3).join('__');
}

const PER_PAGE = 11;
function renderActusArchive() {
  const totalPages = Math.ceil(actus.length / PER_PAGE);
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const slice = actus.slice((pageNum - 1) * PER_PAGE, pageNum * PER_PAGE);
    const rows = slice.map(p => `
      <a class="listing-row" href="${actuPath(p)}">
        <time>${formatDate(p.date)}</time>
        <h3>${esc(p.title)}</h3>
        <span class="go">Lire →</span>
      </a>`).join('\n');

    const pag = [];
    if (pageNum > 1) pag.push(`<a href="${pageNum === 2 ? '/actus/' : `/actus/page/${pageNum - 1}/`}">‹</a>`);
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - pageNum) <= 2) {
        pag.push(i === pageNum ? `<span class="current">${i}</span>` : `<a href="${i === 1 ? '/actus/' : `/actus/page/${i}/`}">${i}</a>`);
      } else if (pag[pag.length - 1] !== '<span>…</span>') {
        pag.push('<span>…</span>');
      }
    }
    if (pageNum < totalPages) pag.push(`<a href="/actus/page/${pageNum + 1}/">›</a>`);

    const body = `
    <div class="page-head">
      <p class="eyebrow">Actualités</p>
      <h1 class="h-display mt-1">Actus</h1>
      <p class="lede mt-2">${actus.length} actualités depuis ${actus[actus.length - 1].year} — page ${pageNum} / ${totalPages}</p>
    </div>
    <section class="wrap">
      <div class="rule-list">${rows}</div>
      <nav class="pagination" aria-label="Pagination">${pag.join('')}</nav>
    </section>
    `;
    const outPath = pageNum === 1 ? '/actus/' : `/actus/page/${pageNum}/`;
    writePage(outPath, page(site, { title: pageNum === 1 ? 'Actus' : `Actus — page ${pageNum}`, path: outPath, activeHref: '/actus/', body }));
  }
}

function renderActuArticles() {
  actus.forEach((p, idx) => {
    const prev = actus[idx - 1];
    const next = actus[idx + 1];
    const imgs = p.images.filter(i => i !== p.featured_image);
    const body = `
    <div class="page-head">
      <p class="eyebrow">${formatDate(p.date)}${p.categories && p.categories.length ? ` · ${esc(p.categories.filter(c => c !== 'actualite' && c !== 'groupedeja').join(', '))}` : ''}</p>
      <h1 class="h-1 mt-1">${esc(p.title)}</h1>
    </div>
    ${p.featured_image ? `<section class="wrap"><div style="aspect-ratio:16/9;overflow:hidden">${img(relImg(p.featured_image), p.title, { eager: true })}</div></section>` : ''}
    <section class="wrap">
      <div class="prose lede">${paragraphs(p.paragraphs)}</div>
      ${imgs.length ? `<div class="gallery mt-4">${imgs.map(i => `<div class="gallery__item">${img(relImg(i), p.title)}</div>`).join('')}</div>` : ''}
    </section>
    <section class="wrap">
      <div class="rule-list" style="border-top:1px solid var(--ink-20)">
        <div style="display:flex;justify-content:space-between;padding:20px 0;gap:20px">
          <div>${prev ? `<a class="link" href="${actuPath(prev)}">← ${esc(truncate(prev.title, 50))}</a>` : ''}</div>
          <div>${next ? `<a class="link" href="${actuPath(next)}">${esc(truncate(next.title, 50))} →</a>` : ''}</div>
        </div>
      </div>
      <p class="mt-3"><a class="link link--ember" href="/actus/">← Toutes les actus</a></p>
    </section>
    `;
    writePage(actuPath(p), page(site, { title: p.title, path: actuPath(p), activeHref: '/actus/', body }));
  });
}
function relImg(fullUrl) {
  return fullUrl.replace('https://groupedeja.com/wp-content/uploads/', '');
}

/* ---------------- RUN ---------------- */
renderHome();
renderPresentation();
renderSebastian();
renderEquipe();
renderCGM();
renderMiseEnScene();
renderSpectaclesListing();
spectacles.forEach(renderSpectacleDetail);
renderSurMesureHub();
surMesure.subpages.forEach(renderSurMesureSub);
renderActionsCulturelles();
renderStages();
renderPresse();
renderAgenda();
renderContact();
renderMentionsLegales();
renderActusArchive();
renderActuArticles();

console.log('Site généré avec succès.');
