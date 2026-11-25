/* «Маленький принц» — © 2026 Полунин Лев */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  root.classList.add('js');

  /* ---------- header + mobile bar on scroll ---------- */
  var hdr = d.querySelector('.hdr'), mbar = d.querySelector('.mbar'), ticking = false;
  function onScroll() {
    var y = w.pageYOffset || root.scrollTop;
    hdr.classList.toggle('is-solid', y > 20);
    if (mbar) mbar.classList.toggle('is-on', y > 500);
    ticking = false;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- burger ---------- */
  var burger = d.getElementById('burger'), nav = d.getElementById('nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    d.body.classList.toggle('is-locked', open);
    hdr.classList.toggle('is-solid', open || (w.pageYOffset > 20));
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  w.addEventListener('resize', function () { if (w.innerWidth > 980 && nav.classList.contains('is-open')) setMenu(false); });

  /* ---------- price tabs ---------- */
  var tabs = [].slice.call(d.querySelectorAll('.tab'));
  function openTab(name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = d.getElementById(t.getAttribute('aria-controls'));
      if (p) { p.hidden = !on; p.classList.toggle('is-on', on); }
      if (on && focus) t.focus();
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { openTab(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); openTab(n.getAttribute('data-tab'), true); }
    });
  });
  [].forEach.call(d.querySelectorAll('[data-tab]:not(.tab)'), function (a) {
    a.addEventListener('click', function () {
      d.getElementById('price-tab-south').click();
      openTab(a.getAttribute('data-tab'));
    });
  });

  /* ---------- gacha capsules ---------- */
  var prizes = ['Красивая стрижка', 'Хорошее настроение', 'Игрушка или сладкий подарок'];
  var out = d.getElementById('gachaOut'), bag = [];
  [].forEach.call(d.querySelectorAll('.cap'), function (c) {
    c.addEventListener('click', function () {
      if (!bag.length) bag = prizes.slice().sort(function () { return Math.random() - 0.5; });
      c.classList.remove('is-open'); void c.offsetWidth; c.classList.add('is-open');
      out.textContent = bag.pop();
      setTimeout(function () { c.classList.remove('is-open'); }, 1800);
    });
  });

  /* ---------- horizontal strip: buttons + mouse drag ---------- */
  var strip = d.getElementById('strip');
  if (strip) {
    [].forEach.call(d.querySelectorAll('[data-strip]'), function (b) {
      b.addEventListener('click', function () {
        var dir = +b.getAttribute('data-strip');
        strip.scrollBy({ left: dir * Math.max(280, strip.clientWidth * 0.7), behavior: 'smooth' });
      });
    });
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('mousedown', function (e) { down = true; moved = false; sx = e.pageX; sl = strip.scrollLeft; });
    w.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - sx;
      if (Math.abs(dx) > 5) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    w.addEventListener('mouseup', function () { if (down) { down = false; strip.classList.remove('is-drag'); } });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  /* ---------- reviews slider (scroll-snap + controls) ---------- */
  var track = d.getElementById('track'), dotsBox = d.getElementById('dots'),
      prev = d.getElementById('prev'), next = d.getElementById('next');
  if (track) {
    var slides = [].slice.call(track.children), dots = [], pages = 1, per = 1, timer = null, current = 0;
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function build() {
      per = Math.max(1, Math.round(track.clientWidth / step()));
      pages = Math.max(1, slides.length - per + 1);
      dotsBox.innerHTML = ''; dots = [];
      for (var i = 0; i < pages; i++) {
        var b = d.createElement('button');
        b.type = 'button'; b.className = 'dot'; b.setAttribute('role', 'tab');
        b.setAttribute('aria-label', 'Отзыв ' + (i + 1) + ' из ' + pages);
        (function (n) { b.addEventListener('click', function () { go(n); restart(); }); })(i);
        dotsBox.appendChild(b); dots.push(b);
      }
      sync();
    }
    function go(n) {
      n = Math.max(0, Math.min(pages - 1, n));
      track.scrollTo({ left: slides[n].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    }
    function sync() {
      current = Math.round(track.scrollLeft / step());
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) current = pages - 1;
      dots.forEach(function (b, i) { b.classList.toggle('is-on', i === current); b.setAttribute('aria-selected', i === current ? 'true' : 'false'); });
      prev.disabled = current <= 0;
      next.disabled = current >= pages - 1;
    }
    var st;
    track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(sync, 60); }, { passive: true });
    prev.addEventListener('click', function () { go(current - 1); restart(); });
    next.addEventListener('click', function () { go(current + 1); restart(); });
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    });
    function auto() { go(current >= pages - 1 ? 0 : current + 1); }
    function restart() {
      clearInterval(timer);
      if (!w.matchMedia || !w.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(auto, 6500);
    }
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (ev) { track.addEventListener(ev, function () { clearInterval(timer); }, { passive: true }); });
    ['mouseleave', 'touchend', 'focusout'].forEach(function (ev) { track.addEventListener(ev, restart, { passive: true }); });
    var rt; w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
    build(); restart();
    d.addEventListener('visibilitychange', function () { if (d.hidden) clearInterval(timer); else restart(); });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var dets = [].slice.call(d.querySelectorAll('.acc details'));
  dets.forEach(function (x) {
    x.addEventListener('toggle', function () { if (x.open) dets.forEach(function (o) { if (o !== x) o.open = false; }); });
  });

  /* ---------- reveal on scroll ---------- */
  var els = d.querySelectorAll('.h2, .sub, .svc__card, .board, .tip, .gacha, .mosaic__i, .masters li, .acc details, .contacts__grid, .checks li, .team__photo');
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.classList.add('is-in'); io.unobserve(t);
        /* снимаем служебные классы, чтобы не мешать hover-анимациям */
        setTimeout(function () { t.classList.remove('rv-in', 'is-in'); t.style.transitionDelay = ''; }, 1100);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    [].forEach.call(els, function (el, i) {
      el.classList.add('rv-in');
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- year ---------- */
  var y = d.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  d.querySelectorAll('[data-branches]').forEach(function (group) {
    var branchTabs = Array.from(group.querySelectorAll('.branch-tab'));
    function selectBranch(index, focus) {
      branchTabs.forEach(function (tab, i) {
        var active = index === i;
        tab.classList.toggle('is-on', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        d.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      });
      if (focus) branchTabs[index].focus();
    }
    branchTabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { selectBranch(index); });
      tab.addEventListener('keydown', function (event) {
        var count = branchTabs.length;
        var next = {ArrowLeft: (index + count - 1) % count, ArrowRight: (index + 1) % count, Home: 0, End: count - 1}[event.key];
        if (next === undefined) return;
        event.preventDefault();
        selectBranch(next, true);
      });
    });
  });

  d.querySelectorAll('.branch-call, .social-menu').forEach(function (menu) {
    d.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) menu.open = false;
    });
    menu.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !menu.open) return;
      menu.open = false;
      menu.querySelector('summary').focus();
    });
  });

  var masterDialog = d.getElementById('master-dialog');
  var masterPhoto = d.getElementById('master-photo');
  var galleryTrack = d.getElementById('master-gallery-track');
  var galleryControls = d.getElementById('master-controls');
  var galleryCounter = d.getElementById('master-counter');
  var currentSlide = 0;
  function showMasterSlide(index) {
    currentSlide = (index + 2) % 2;
    galleryTrack.style.transform = 'translateX(-' + currentSlide * 100 + '%)';
    galleryCounter.textContent = (currentSlide + 1) + ' / 2';
  }
  d.getElementById('master-prev').addEventListener('click', function () { showMasterSlide(currentSlide - 1); });
  d.getElementById('master-next').addEventListener('click', function () { showMasterSlide(currentSlide + 1); });
  d.querySelectorAll('button.master-card').forEach(function (button) {
    button.addEventListener('click', function () {
      d.getElementById('master-name').textContent = button.dataset.name;
      d.getElementById('master-role').textContent = button.dataset.role;
      d.getElementById('master-address').textContent = button.dataset.address;
      masterPhoto.src = button.dataset.photo;
      masterPhoto.alt = button.dataset.name;
      galleryControls.hidden = button.dataset.address !== 'ул. Капитанская, 14';
      showMasterSlide(0);
      masterDialog.showModal();
    });
  });
  masterDialog.querySelector('.profile-dialog__close').addEventListener('click', function () { masterDialog.close(); });
  masterDialog.addEventListener('click', function (event) { if (event.target === masterDialog) masterDialog.close(); });
})();
