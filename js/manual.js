/* zoevo manual: table of contents behaviour, scroll-spy and back-to-top.
   Everything works without this file: the contents list is a normal
   <details>, anchors are plain links, and CSS handles smooth scrolling
   (switched off under prefers-reduced-motion). */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.add('js');

  var box = d.getElementById('toc-box');
  var list = d.getElementById('toc-list');
  var toTop = d.getElementById('to-top');
  if (!box || !list) return;
  var summary = box.querySelector('summary');

  var wide = window.matchMedia('(min-width: 1080px)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Desktop: the contents sit open in the sticky sidebar, so the summary is
     only a heading there: take it out of the tab order and hide the dead
     "collapse" button from screen readers.
     Mobile: a collapsed "On this page" box above the text. */
  function syncOpen() {
    box.open = wide.matches;
    if (summary) {
      if (wide.matches) {
        summary.setAttribute('tabindex', '-1');
        summary.setAttribute('aria-hidden', 'true');
      } else {
        summary.removeAttribute('tabindex');
        summary.removeAttribute('aria-hidden');
      }
    }
    syncBackLinks();
  }

  /* On mobile the contents box is far down a very long page, so "back to
     top" links go back to the contents instead (and open it). */
  var backLinks = Array.prototype.slice.call(d.querySelectorAll('.part-end a'));
  if (toTop) backLinks.push(toTop);
  function syncBackLinks() {
    var label = wide.matches ? 'Back to top' : 'Back to contents';
    backLinks.forEach(function (a) {
      a.setAttribute('href', wide.matches ? '#top' : '#toc-box');
      var textHolder = a.querySelector('.sr-only');
      if (textHolder) textHolder.textContent = label;
      else if (a.lastChild && a.lastChild.nodeType === 3) a.lastChild.nodeValue = label;
    });
  }

  syncOpen();
  if (wide.addEventListener) wide.addEventListener('change', syncOpen);
  else if (wide.addListener) wide.addListener(syncOpen);
  box.addEventListener('toggle', function () {
    if (wide.matches && !box.open) box.open = true;
  });

  function jumpTo(target, hash) {
    target.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' });
    if (history.pushState) history.pushState(null, '', hash);
  }

  /* Links to the contents box ("All contents", back links on mobile):
     open it, scroll to it and put focus on its first useful control. */
  d.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#toc-box"]') : null;
    if (!a) return;
    e.preventDefault();
    if (!wide.matches) box.open = true;
    jumpTo(box, '#toc-box');
    var focusEl = wide.matches ? list.querySelector('a') : summary;
    if (focusEl) focusEl.focus({ preventScroll: true });
  });

  /* On mobile, close the box before jumping so the collapse doesn't
     shift the target away from where the browser scrolled to. */
  list.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || wide.matches) return;
    var target = d.getElementById(a.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    box.open = false;
    jumpTo(target, a.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* Scroll-spy: the last section whose top has passed the header line. */
  var links = Array.prototype.slice.call(list.querySelectorAll('a[href^="#"]'));
  var items = [];
  links.forEach(function (a) {
    var t = d.getElementById(a.hash.slice(1));
    if (t) items.push({ a: a, t: t });
  });
  var current = null;
  var ticking = false;

  function update() {
    ticking = false;
    var line = 130;
    var found = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].t.getBoundingClientRect().top <= line) found = items[i];
      else break;
    }
    if (found !== current) {
      if (current) current.a.removeAttribute('aria-current');
      current = found;
      if (current) {
        current.a.setAttribute('aria-current', 'location');
        if (wide.matches) keepVisible(current.a);
      }
    }
    if (toTop) toTop.classList.toggle('show', window.pageYOffset > 900);
  }

  /* Scroll only the sidebar, never the page. */
  function keepVisible(a) {
    var top = a.offsetTop - list.offsetTop;
    var pad = 48;
    if (top < list.scrollTop + pad) list.scrollTop = Math.max(0, top - pad);
    else if (top + a.offsetHeight > list.scrollTop + list.clientHeight - pad) {
      list.scrollTop = top + a.offsetHeight - list.clientHeight + pad;
    }
  }

  /* A light timer throttle: at most ~10 checks a second while scrolling. */
  function onScroll() {
    if (!ticking) { ticking = true; window.setTimeout(update, 100); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
