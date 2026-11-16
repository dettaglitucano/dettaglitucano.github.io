/* Dettagli – scripts do site */
(function () {
  'use strict';

  /* ---------- Cabeçalho sólido ao rolar ---------- */
  var header = document.getElementById('topo');
  var onScroll = function () { header.classList.toggle('solid', window.scrollY > 40); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var menu = document.getElementById('menu');
  var toggle = document.querySelector('.menu-toggle');
  var setMenu = function (open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); } });

  /* ---------- Animação de entrada ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- Galeria de fotos ---------- */
  var lb = document.getElementById('lb');
  if (!lb) return;
  var img = lb.querySelector('.lb-img');
  var tit = lb.querySelector('.lb-info strong');
  var cont = lb.querySelector('.lb-info span');
  var th = lb.querySelector('.lb-thumbs');
  var btnFechar = lb.querySelector('.lb-fechar');
  var btnPrev = lb.querySelector('.lb-prev');
  var btnNext = lb.querySelector('.lb-next');
  var fotos = [], i = 0, toqueX = null, origem = null;

  /* Aceita apenas caminhos locais da pasta assets (evita injeção via data-fotos) */
  var seguro = function (url) { return /^assets\/[\w.-]+\.(jpe?g|png|webp)$/i.test(url); };

  var mostrar = function (n) {
    i = (n + fotos.length) % fotos.length;
    img.src = fotos[i];
    img.alt = tit.textContent + ' – foto ' + (i + 1) + ' de ' + fotos.length;
    cont.textContent = (i + 1) + ' de ' + fotos.length;
    Array.prototype.forEach.call(th.children, function (t, k) {
      t.classList.toggle('ativo', k === i);
      t.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
  };

  var abrir = function (el) {
    fotos = el.dataset.fotos.split(',').map(function (s) { return s.trim(); }).filter(seguro);
    if (!fotos.length) return;
    origem = el;
    tit.textContent = el.dataset.titulo || '';
    th.textContent = '';
    fotos.forEach(function (f, k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Ver foto ' + (k + 1));
      var t = document.createElement('img');
      t.src = f; t.alt = '';
      b.appendChild(t);
      b.addEventListener('click', function () { mostrar(k); });
      th.appendChild(b);
    });
    var multi = fotos.length > 1;
    btnPrev.hidden = btnNext.hidden = th.hidden = !multi;
    mostrar(0);
    lb.classList.add('aberto');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    btnFechar.focus();
  };

  var fechar = function () {
    lb.classList.remove('aberto');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (origem) origem.focus();
  };

  document.querySelectorAll('[data-fotos]').forEach(function (el) {
    el.addEventListener('click', function () { abrir(el); });
  });
  btnFechar.addEventListener('click', fechar);
  btnPrev.addEventListener('click', function () { mostrar(i - 1); });
  btnNext.addEventListener('click', function () { mostrar(i + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('aberto')) return;
    if (e.key === 'Escape') fechar();
    else if (e.key === 'ArrowLeft' && fotos.length > 1) mostrar(i - 1);
    else if (e.key === 'ArrowRight' && fotos.length > 1) mostrar(i + 1);
    else if (e.key === 'Tab') {
      /* Mantém o foco dentro da galeria */
      var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden && b.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  img.addEventListener('touchstart', function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
  img.addEventListener('touchend', function (e) {
    if (toqueX === null || fotos.length < 2) return;
    var d = e.changedTouches[0].clientX - toqueX;
    if (Math.abs(d) > 40) mostrar(i + (d < 0 ? 1 : -1));
    toqueX = null;
  });
})();
