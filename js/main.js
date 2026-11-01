/* Nedohe Web Designs: small, dependency-free JavaScript. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js-ready'); // tells the CSS safety net that this script loaded

  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var canAnimate = !reduce && typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
  var WA_NUMBER = '27671321389'; // 067 132 1389 in international format

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }

  /* 1. WhatsApp links with a ready-made message */
  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    el.setAttribute('href', waLink(el.getAttribute('data-whatsapp')));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* 2. Today's date in the top corner */
  var dateEl = document.getElementById('top-date');
  if (dateEl) {
    var d = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dd = ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2);
    dateEl.textContent = '';
    dateEl.appendChild(document.createTextNode(days[d.getDay()]));
    dateEl.appendChild(document.createElement('br'));
    dateEl.appendChild(document.createTextNode(dd + ' – ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear()));
  }

  /* 3. Pill menu: the dark pill slides to the link you hover, or to the section you are reading */
  var pill = document.getElementById('site-nav');
  var slider = pill && pill.querySelector('.pill-slider');
  var navLinks = pill ? Array.prototype.slice.call(pill.querySelectorAll('a[data-spy]')) : [];
  var current = navLinks[0] || null;

  function moveSlider(a) {
    if (!slider || !a || !a.offsetWidth) return;
    var p = pill.getBoundingClientRect();
    var r = a.getBoundingClientRect();
    slider.style.left = (r.left - p.left) + 'px';
    slider.style.width = r.width + 'px';
    slider.classList.add('ready');
    navLinks.forEach(function (l) { l.classList.toggle('is-on', l === a); });
  }
  function settle() { moveSlider(current); }

  if (navLinks.length) {
    navLinks.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveSlider(a); });
      a.addEventListener('focus', function () { moveSlider(a); });
      a.addEventListener('blur', settle);
    });
    pill.addEventListener('mouseleave', settle);
    window.addEventListener('resize', settle);
    window.addEventListener('load', settle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    settle();

    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) { if (a.getAttribute('data-spy') === entry.target.id) current = a; });
          if (!pill.matches(':hover')) settle();
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['home', 'packages', 'how', 'contact'].forEach(function (id) {
        var s = document.getElementById(id);
        if (s) spy.observe(s);
      });
    }
  }

  /* 4. The top-right button changes colour once you scroll past the grey hero */
  var hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('past-hero', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  /* 5. Numbers that count up */
  function format(n, el) {
    var s = String(Math.round(n));
    var sep = el.getAttribute('data-sep');
    if (sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return (el.getAttribute('data-prefix') || '') + s + (el.getAttribute('data-suffix') || '');
  }
  function countUp(el, delay) {
    var target = Number(el.getAttribute('data-count'));
    if (!target) return;
    if (reduce) { el.textContent = format(target, el); return; }
    el.textContent = format(0, el);
    window.setTimeout(function () {
      var t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = clamp((ts - t0) / 1400, 0, 1);
        el.textContent = format(target * (1 - Math.pow(1 - k, 3)), el);
        if (k < 1) window.requestAnimationFrame(step); else el.textContent = format(target, el);
      }
      window.requestAnimationFrame(step);
    }, delay || 0);
  }

  /* 6. Hero entrance animation */
  function rise(el, delay, dist, dur) {
    el.animate(
      [{ opacity: 0, transform: 'translateY(' + dist + 'px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: dur || 800, delay: delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
    );
  }
  if (canAnimate) {
    document.querySelectorAll('.t-line').forEach(function (el, i) {
      el.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
        { duration: 1000, delay: 80 + i * 110, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    var big = document.querySelector('.mark-big');
    if (big) {
      big.animate(
        [{ opacity: 0, transform: 'translateY(40px)', filter: 'blur(14px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }],
        { duration: 1300, delay: 150, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
      );
    }
    if (pill) rise(pill, 100, -20, 700);
    document.querySelectorAll('.hero [data-rise]').forEach(function (el, i) { rise(el, 350 + i * 55, 14, 800); });
    var bar = document.querySelector('.progress i');
    if (bar) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 1100, delay: 900, easing: 'ease-out', fill: 'backwards' });
  }
  document.querySelectorAll('.hero [data-count]').forEach(function (el) { countUp(el, 500); });

  /* 7. The big logo drifts slowly as you scroll; the manifesto fills from grey to white */
  var par = document.querySelector('[data-parallax]');

  var stText = document.getElementById('statement-text');
  var stSection = document.getElementById('statement');
  var words = [];
  if (stText) {
    var full = stText.textContent.replace(/\s+/g, ' ').trim();
    var reader = document.createElement('span');
    reader.className = 'sr-only';
    reader.textContent = full;
    var shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    full.split(' ').forEach(function (w) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      shown.appendChild(s);
      shown.appendChild(document.createTextNode(' '));
      words.push({ el: s, last: -1 });
    });
    stText.textContent = '';
    stText.appendChild(reader);
    stText.appendChild(shown);
  }

  function paintWords(fill) {
    for (var i = 0; i < words.length; i++) {
      var t = clamp((fill - i) / 3, 0, 1);
      var v = Math.round(111 + (244 - 111) * t);
      if (words[i].last !== v) {
        words[i].last = v;
        words[i].el.style.color = 'rgb(' + v + ',' + v + ',' + v + ')';
      }
    }
  }

  function onScroll() {
    var y = window.pageYOffset || 0;
    if (par && !reduce && y < window.innerHeight * 1.6) par.style.transform = 'translateY(' + (y * 0.12).toFixed(1) + 'px)';
    if (words.length && stSection) {
      var r = stSection.getBoundingClientRect();
      var p = clamp((window.innerHeight * 0.8 - r.top) / (r.height * 0.62), 0, 1);
      paintWords(p * (words.length + 3));
    }
  }

  if (words.length) {
    if (reduce) paintWords(words.length + 3); // everything already filled
    else paintWords(0);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* 8. Panel: counters count up and the chips pop in when it appears */
  var panel = document.querySelector('.panel');
  function playPanel() {
    panel.querySelectorAll('[data-count]').forEach(function (el, i) { countUp(el, i * 150); });
    var chips = panel.querySelector('.chips');
    if (chips) chips.classList.add('is-in');
  }
  if (panel) {
    if ('IntersectionObserver' in window) {
      var po = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { playPanel(); po.disconnect(); }
      }, { threshold: 0.25 });
      po.observe(panel);
    } else {
      playPanel();
    }
  }

  /* 9. Fade sections in as they scroll into view */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 10. "Ask about this" buttons pick the package in the form */
  var select = document.getElementById('package');
  document.querySelectorAll('[data-package]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (select) select.value = btn.getAttribute('data-package');
    });
  });

  /* 11. Quote form */
  var form = document.getElementById('quote-form');
  var statusEl = document.getElementById('form-status');
  var waBtn = document.getElementById('send-whatsapp');

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'form-status' + (type ? ' ' + type : '');
  }

  function fieldError(id, msg) {
    var input = document.getElementById(id);
    var holder = input && input.closest('.field');
    var err = form.querySelector('[data-error-for="' + id + '"]');
    if (holder) holder.classList.toggle('has-error', !!msg);
    if (err) err.textContent = msg || '';
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // strict = the "Send request" button, which needs a phone number and an email.
  // The WhatsApp button only needs a name (an email is checked only if one was typed).
  function validate(strict) {
    var ok = true;
    var name = form.elements.name.value.trim();
    var phone = form.elements.phone.value.trim();
    var email = form.elements.email.value.trim();
    var digits = phone.replace(/\D/g, '');

    fieldError('name', '');
    fieldError('phone', '');
    fieldError('email', '');

    if (name.length < 2) { fieldError('name', 'Please tell me your name.'); ok = false; }
    if (strict && digits.length < 9) { fieldError('phone', 'Please enter a number I can reach you on.'); ok = false; }
    if (strict && !EMAIL_RE.test(email)) { fieldError('email', 'Please enter a valid email so I can send your quote.'); ok = false; }
    else if (!strict && email && !EMAIL_RE.test(email)) { fieldError('email', 'That email address does not look right.'); ok = false; }
    if (!ok) {
      var firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
    }
    return ok;
  }

  function buildMessage() {
    var f = form.elements;
    var lines = ['Hi Nedohe Web Designs, my name is ' + f.name.value.trim() + '.'];
    if (f.business.value.trim()) lines.push('My business: ' + f.business.value.trim() + '.');
    lines.push('I am interested in: ' + f.package.value + '.');
    if (f.phone.value.trim()) lines.push('My number: ' + f.phone.value.trim() + '.');
    if (f.email.value.trim()) lines.push('My email: ' + f.email.value.trim() + '.');
    if (f.message.value.trim()) lines.push(f.message.value.trim());
    return lines.join('\n');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');
      if (!validate(true)) return;

      var submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      setStatus('Sending...', '');

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('bad response');
        form.reset();
        setStatus('Thank you! Your request was sent. I will reply on WhatsApp or email soon.', 'ok');
      }).catch(function () {
        // Keep what the client typed and offer a one-tap way to send it on WhatsApp instead.
        setStatus('Sorry, that did not send. ', 'bad');
        if (statusEl) {
          var fallback = document.createElement('a');
          fallback.href = waLink(buildMessage());
          fallback.target = '_blank';
          fallback.rel = 'noopener';
          fallback.textContent = 'Tap here to send it on WhatsApp instead.';
          statusEl.appendChild(fallback);
        }
      }).then(function () {
        submit.disabled = false;
      });
    });

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        if (!validate(false)) return;
        window.open(waLink(buildMessage()), '_blank', 'noopener');
      });
    }

    form.addEventListener('input', function (e) {
      if (e.target.id === 'name' || e.target.id === 'phone' || e.target.id === 'email') fieldError(e.target.id, '');
    });
  }

  /* 12. Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();


// Slim reading progress indicator for easier page orientation.
(() => {
  const bar = document.getElementById('reading-progress-bar');
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
