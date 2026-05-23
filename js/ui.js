/* =========================================================
   Generic UI helpers — toasts, dialogs, drawer, escapeHtml
   ========================================================= */
window.NTUI = (function () {
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function el(tag, attrs = {}, ...children) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'dataset') Object.assign(e.dataset, attrs[k]);
      else if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    for (const c of children) {
      if (c == null) continue;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function toast(msg, ms = 2200) {
    let t = $('#toast');
    if (!t) { t = el('div', { id: 'toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  function confirm(msg) { return Promise.resolve(window.confirm(msg)); }

  // Drawer
  function openDrawer() {
    $('#drawer').classList.add('open');
    $('#drawer-scrim').classList.add('open');
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open');
    $('#drawer-scrim').classList.remove('open');
  }

  // Splash control
  function hideSplash() {
    const s = $('#splash');
    if (!s) return;
    s.classList.add('fade-in');
    setTimeout(() => {
      s.classList.add('hide');
      setTimeout(() => s.remove(), 700);
    }, 700);
  }

  return { $, $$, el, escapeHtml, toast, confirm, openDrawer, closeDrawer, hideSplash };
})();
