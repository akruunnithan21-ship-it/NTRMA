/* =========================================================
   NTApp — main app shell (router, drawer, sections)
   ========================================================= */
window.NTApp = (function () {
  const { $, el, toast, openDrawer, closeDrawer, hideSplash } = NTUI;

  const state = {
    section: 'rma',         // 'service' | 'rma' | 'warranty'
    page: 'log',            // 'new' | 'log' | 'rack' | 'settings' | 'detail'
    activeTicketId: null
  };

  // ---- Initial mount ----
  async function init() {
    await NTDB.open();
    // Touch defaults so settings are seeded
    await NTDB.getSetting('vendors');
    await NTDB.getSetting('submitTo');
    await NTDB.getSetting('componentTypes');
    await NTDB.getSetting('rackLocations');

    bindShell();
    paintSectionNav();
    paintDrawer();
    render();

    setTimeout(hideSplash, 900);
  }

  function bindShell() {
    $('#menuBtn').addEventListener('click', openDrawer);
    $('#drawer-scrim').addEventListener('click', closeDrawer);

    // Section nav
    $$('.sn-card').forEach(c => {
      c.addEventListener('click', () => go(c.dataset.section, defaultPageFor(c.dataset.section)));
    });
  }

  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  function defaultPageFor(section) {
    if (section === 'rma') return 'log';
    return 'placeholder';
  }

  function go(section, page) {
    state.section = section;
    state.page = page || defaultPageFor(section);
    state.activeTicketId = null;
    closeDrawer();
    paintSectionNav();
    paintDrawer();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openTicket(id) {
    state.section = 'rma';
    state.page = 'detail';
    state.activeTicketId = id;
    closeDrawer();
    paintSectionNav();
    paintDrawer();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function paintSectionNav() {
    $$('.sn-card').forEach(c => {
      const active = c.dataset.section === state.section;
      c.classList.toggle('active', active);
    });
  }

  function paintDrawer() {
    const list = $('#drawer-list');
    list.innerHTML = '';
    const items = [
      { key: 'new', label: 'NEW ENTRY', ico: '＋' },
      { key: 'log', label: 'ENTRY LOG', ico: '☰' },
      { key: 'rack', label: 'RACK', ico: '▤' },
      { key: 'settings', label: 'SETTINGS', ico: '⚙' }
    ];
    const isRma = state.section === 'rma';
    items.forEach(it => {
      const row = el('div', { class: 'drawer-item' + ((isRma && state.page === it.key) ? ' active' : '') },
        el('span', { class: 'di-ico' }, it.ico),
        el('span', {}, it.label)
      );
      row.addEventListener('click', () => {
        if (!isRma) { go('rma', it.key); return; }
        go('rma', it.key);
      });
      list.appendChild(row);
    });
  }

  // ---- Main render ----
  async function render() {
    const root = $('#view');
    root.innerHTML = '';

    // Crumb
    const crumb = $('#crumb');
    if (crumb) {
      const sec = state.section.toUpperCase();
      const pg = state.page === 'detail' ? 'TICKET' : state.page.toUpperCase();
      crumb.textContent = state.section === 'rma' ? `${sec} / ${pg}` : sec;
    }

    if (state.section === 'service') return renderServicePlaceholder(root);
    if (state.section === 'warranty') return renderWarrantyPlaceholder(root);

    // RMA section
    if (state.page === 'new') return NTRMA.renderForm(root);
    if (state.page === 'detail' && state.activeTicketId) return NTRMA.renderDetail(root, state.activeTicketId);
    if (state.page === 'rack') return NTRack.render(root);
    if (state.page === 'settings') return NTSettings.render(root);
    return NTRMA.renderLog(root);
  }

  function renderServicePlaceholder(root) {
    const card = el('div', { class: 'placeholder fade-up' });
    card.appendChild(el('img', { src: 'assets/neo_tokyo-logo.png', style: 'width:90px; height:90px; filter:drop-shadow(0 0 20px rgba(231,1,70,0.6));' }));
    card.appendChild(el('h2', {}, 'SERVICE'));
    card.appendChild(el('p', {}, 'In-shop diagnostics, repairs and service ticketing for Neo Tokyo customers. Coming online in a future build.'));
    card.appendChild(el('div', { class: 'ph-tag' }, 'PLACEHOLDER · COMING SOON'));
    root.appendChild(card);

    const teaser = el('div', { class: 'glass padded fade-up mt-16' });
    teaser.appendChild(el('div', { class: 'section-title', style: 'margin:0 0 8px;' }, 'WHAT THIS WILL HOLD'));
    teaser.appendChild(el('div', { class: 'help' }, '• Walk-in service tickets\n• Diagnostic checklist & test logs\n• Estimate / invoice generation\n• Customer pickup tracking'));
    root.appendChild(teaser);
  }

  function renderWarrantyPlaceholder(root) {
    const card = el('div', { class: 'placeholder fade-up' });
    card.appendChild(el('img', { src: 'assets/neo_tokyo-logo.png', style: 'width:90px; height:90px; filter:drop-shadow(0 0 20px rgba(231,1,70,0.6));' }));
    card.appendChild(el('h2', {}, 'WARRANTY CHECK'));
    card.appendChild(el('p', {}, 'Look up active warranties by serial number across vendors. Customer-facing in a future build.'));
    card.appendChild(el('div', { class: 'ph-tag' }, 'PLACEHOLDER · COMING SOON'));
    root.appendChild(card);

    const teaser = el('div', { class: 'glass padded fade-up mt-16' });
    teaser.appendChild(el('div', { class: 'section-title', style: 'margin:0 0 8px;' }, 'PLANNED FEATURES'));
    teaser.appendChild(el('div', { class: 'help' }, '• Serial → vendor warranty lookup\n• Coverage period & terms\n• Linked RMA history\n• Customer self-service portal'));
    root.appendChild(teaser);
  }

  // ---- Move ticket to Rack ----
  async function moveTicketToRack(t) {
    const locations = await NTDB.getSetting('rackLocations');
    const loc = window.prompt(`Send ${t.rmaNumber} to which rack/location?\nAvailable: ${(locations || []).join(', ')}`, (locations && locations[0]) || 'Rack A');
    if (!loc) return;
    const state = window.confirm('IN HAND with technician?\nOK = IN HAND, Cancel = AT RACK') ? 'IN_HAND' : 'AT_RACK';
    await NTDB.saveRack({
      description: `${t.componentType || ''} ${t.vendor || ''} ${t.componentDescription || ''}`.trim(),
      serial: t.serialOut || t.serialIn || '',
      state,
      location: loc,
      linkedRma: t.rmaNumber,
      source: 'rma'
    });
    // Update ticket too
    t.rackLocation = loc;
    await NTDB.saveTicket(t);
    toast('Sent to rack');
    go('rma', 'rack');
  }

  return { init, go, openTicket, moveTicketToRack, state };
})();

// Boot
window.addEventListener('DOMContentLoaded', () => NTApp.init());

// PWA: register service worker (only when served over http(s))
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {/* offline-only nicety */});
  });
}
