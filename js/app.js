/* =========================================================
   NTApp — main app shell (router, drawer, sections)
   ========================================================= */
window.NTApp = (function () {
  const { $, el, toast, openDrawer, closeDrawer, hideSplash } = NTUI;

  const state = {
    section: 'dashboard',   // 'dashboard' | 'service' | 'rma' | 'warranty'
    page: 'log',            // varies by section
    activeTicketId: null,
    activeServiceTicket: null
  };

  // ---- Initial mount ----
  async function init() {
    await NTDB.open();
    await NTDB.getSetting('vendors');
    await NTDB.getSetting('submitTo');
    await NTDB.getSetting('componentTypes');
    await NTDB.getSetting('rackLocations');
    await NTDB.getSetting('technicians');

    bindShell();
    paintSectionNav();
    paintDrawer();
    render();

    setTimeout(hideSplash, 900);
  }

  function bindShell() {
    $('#menuBtn').addEventListener('click', openDrawer);
    $('#drawer-scrim').addEventListener('click', closeDrawer);

    $$('.sn-card').forEach(c => {
      c.addEventListener('click', () => go(c.dataset.section, defaultPageFor(c.dataset.section)));
    });
  }

  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  function defaultPageFor(section) {
    if (section === 'rma') return 'log';
    if (section === 'service') return 'menu';
    if (section === 'dashboard') return 'home';
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

    var items = [];
    if (state.section === 'rma') {
      items = [
        { key: 'new', label: 'NEW ENTRY', ico: '＋' },
        { key: 'log', label: 'ENTRY LOG', ico: '☰' },
        { key: 'rack', label: 'RACK', ico: '▤' },
        { key: 'settings', label: 'SETTINGS', ico: '⚙' }
      ];
    } else if (state.section === 'service') {
      items = [
        { key: 'menu', label: 'SERVICE MENU', ico: '◈' },
        { key: 'new-service', label: 'NEW SERVICE', ico: '⚙' },
        { key: 'new-onsite', label: 'NEW ONSITE', ico: '🏠' },
        { key: 'new-remote', label: 'NEW REMOTE', ico: '🖥' },
        { key: 'list', label: 'ALL TICKETS', ico: '☰' }
      ];
    } else if (state.section === 'dashboard') {
      items = [
        { key: 'home', label: 'DASHBOARD', ico: '◉' }
      ];
    } else {
      items = [
        { key: 'placeholder', label: 'WARRANTY', ico: '✦' }
      ];
    }


    items.forEach(it => {
      const row = el('div', { class: 'drawer-item' + (state.page === it.key ? ' active' : '') },
        el('span', { class: 'di-ico' }, it.ico),
        el('span', {}, it.label)
      );
      row.addEventListener('click', () => {
        go(state.section, it.key);
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
      crumb.textContent = sec + ' / ' + pg;
    }

    // Dashboard
    if (state.section === 'dashboard') return renderDashboard(root);

    // Service section
    if (state.section === 'service') {
      if (state.page === 'menu') return NTService.renderMenu(root);
      if (state.page === 'new-service') return NTService.renderServiceForm(root);
      if (state.page === 'new-onsite') return NTService.renderOnsiteForm(root);
      if (state.page === 'new-remote') return NTService.renderRemoteForm(root);
      if (state.page === 'edit-service' && state.activeServiceTicket) return NTService.renderServiceForm(root, state.activeServiceTicket);
      if (state.page === 'edit-onsite' && state.activeServiceTicket) return NTService.renderOnsiteForm(root, state.activeServiceTicket);
      if (state.page === 'edit-remote' && state.activeServiceTicket) return NTService.renderRemoteForm(root, state.activeServiceTicket);
      if (state.page === 'list') return NTService.renderList(root);
      return NTService.renderMenu(root);
    }

    // Warranty placeholder
    if (state.section === 'warranty') return renderWarrantyPlaceholder(root);

    // RMA section
    if (state.page === 'new') return NTRMA.renderForm(root);
    if (state.page === 'detail' && state.activeTicketId) return NTRMA.renderDetail(root, state.activeTicketId);
    if (state.page === 'rack') return NTRack.render(root);
    if (state.page === 'settings') return NTSettings.render(root);
    return NTRMA.renderLog(root);
  }


  // ---- Dashboard ----
  async function renderDashboard(root) {
    root.innerHTML = '';

    var title = el('div', { class: 'section-title fade-up' }, 'DASHBOARD · AT A GLANCE');
    root.appendChild(title);

    // RMA stats
    var rmaTickets = await NTDB.getTickets();
    var rmaOpen = rmaTickets.filter(function(t) { return t.status === 'Pending' || t.status === 'Open'; }).length;
    var rmaClosed = rmaTickets.filter(function(t) { return t.status === 'Closed'; }).length;
    var rmaReady = rmaTickets.filter(function(t) { return t.status === 'Ready for pick up'; }).length;

    // Service stats
    var serviceStats = await NTService.getStats();

    // RMA Section
    var rmaCard = el('div', { class: 'glass padded fade-up dashboard-card' });
    rmaCard.appendChild(el('div', { class: 'dash-card-title' },
      el('span', { class: 'dash-icon rma-icon' }, '⤶'),
      'RMA TICKETS'
    ));
    var rmaGrid = el('div', { class: 'row thirds', style: 'margin-top:10px;' });
    rmaGrid.appendChild(statBox('Total', rmaTickets.length));
    rmaGrid.appendChild(statBox('Open', rmaOpen));
    rmaGrid.appendChild(statBox('Closed', rmaClosed));
    rmaCard.appendChild(rmaGrid);
    var rmaGrid2 = el('div', { class: 'row thirds', style: 'margin-top:8px;' });
    rmaGrid2.appendChild(statBox('Ready', rmaReady));
    rmaGrid2.appendChild(statBox('', ''));
    rmaGrid2.appendChild(statBox('', ''));
    rmaCard.appendChild(rmaGrid2);
    root.appendChild(rmaCard);

    // Service Section
    var svcCard = el('div', { class: 'glass padded fade-up dashboard-card' });
    svcCard.appendChild(el('div', { class: 'dash-card-title' },
      el('span', { class: 'dash-icon service-icon' }, '⚙'),
      'SERVICE TICKETS'
    ));
    var svcGrid = el('div', { class: 'row thirds', style: 'margin-top:10px;' });
    svcGrid.appendChild(statBox('Total', serviceStats.service.total));
    svcGrid.appendChild(statBox('Open', serviceStats.service.open));
    svcGrid.appendChild(statBox('Closed', serviceStats.service.closed));
    svcCard.appendChild(svcGrid);
    root.appendChild(svcCard);


    // Onsite Section
    var onCard = el('div', { class: 'glass padded fade-up dashboard-card' });
    onCard.appendChild(el('div', { class: 'dash-card-title' },
      el('span', { class: 'dash-icon onsite-icon' }, '🏠'),
      'ONSITE TICKETS'
    ));
    var onGrid = el('div', { class: 'row thirds', style: 'margin-top:10px;' });
    onGrid.appendChild(statBox('Total', serviceStats.onsite.total));
    onGrid.appendChild(statBox('Open', serviceStats.onsite.open));
    onGrid.appendChild(statBox('Closed', serviceStats.onsite.closed));
    onCard.appendChild(onGrid);
    root.appendChild(onCard);

    // Remote Section
    var rmCard = el('div', { class: 'glass padded fade-up dashboard-card' });
    rmCard.appendChild(el('div', { class: 'dash-card-title' },
      el('span', { class: 'dash-icon remote-icon' }, '🖥'),
      'REMOTE SESSIONS'
    ));
    var rmGrid = el('div', { class: 'row thirds', style: 'margin-top:10px;' });
    rmGrid.appendChild(statBox('Total', serviceStats.remote.total));
    rmGrid.appendChild(statBox('Open', serviceStats.remote.open));
    rmGrid.appendChild(statBox('Closed', serviceStats.remote.closed));
    rmCard.appendChild(rmGrid);
    root.appendChild(rmCard);

    // Quick links
    var linksTitle = el('div', { class: 'section-title fade-up' }, 'QUICK ACTIONS');
    root.appendChild(linksTitle);
    var linksGrid = el('div', { class: 'service-menu-grid fade-up' });

    var l1 = el('div', { class: 'service-menu-card st-service-card' });
    l1.appendChild(el('div', { class: 'smc-icon' }, '＋'));
    l1.appendChild(el('div', { class: 'smc-label' }, 'NEW RMA'));
    l1.addEventListener('click', function() { go('rma', 'new'); });
    linksGrid.appendChild(l1);

    var l2 = el('div', { class: 'service-menu-card st-onsite-card' });
    l2.appendChild(el('div', { class: 'smc-icon' }, '⚙'));
    l2.appendChild(el('div', { class: 'smc-label' }, 'SERVICE'));
    l2.addEventListener('click', function() { go('service', 'menu'); });
    linksGrid.appendChild(l2);

    var l3 = el('div', { class: 'service-menu-card st-remote-card' });
    l3.appendChild(el('div', { class: 'smc-icon' }, '☰'));
    l3.appendChild(el('div', { class: 'smc-label' }, 'RMA LOG'));
    l3.addEventListener('click', function() { go('rma', 'log'); });
    linksGrid.appendChild(l3);

    root.appendChild(linksGrid);
  }

  function statBox(label, value) {
    if (!label && value === '') return el('div', {});
    return el('div', { class: 'glass padded center', style: 'padding:12px;' },
      el('div', { class: 'mono', style: 'font-size:22px; font-weight:700; background: var(--grad-brand); -webkit-background-clip: text; background-clip: text; color: transparent;' }, String(value)),
      el('div', { class: 'help' }, label)
    );
  }


  function renderWarrantyPlaceholder(root) {
    const card = el('div', { class: 'placeholder fade-up' });
    card.appendChild(el('img', { src: 'assets/logo.svg', style: 'width:90px; height:90px; filter:drop-shadow(0 0 20px rgba(231,1,70,0.6));' }));
    card.appendChild(el('h2', {}, 'WARRANTY CHECK'));
    card.appendChild(el('p', {}, 'Look up active warranties by serial number across vendors. Customer-facing in a future build.'));
    card.appendChild(el('div', { class: 'ph-tag' }, 'PLACEHOLDER · COMING SOON'));
    root.appendChild(card);
  }

  // ---- Move ticket to Rack ----
  async function moveTicketToRack(t) {
    const locations = await NTDB.getSetting('rackLocations');
    const loc = window.prompt('Send ' + t.rmaNumber + ' to which rack/location?\nAvailable: ' + (locations || []).join(', '), (locations && locations[0]) || 'Rack A');
    if (!loc) return;
    const rackState = window.confirm('IN HAND with technician?\nOK = IN HAND, Cancel = AT RACK') ? 'IN_HAND' : 'AT_RACK';
    await NTDB.saveRack({
      description: ((t.componentType || '') + ' ' + (t.vendor || '') + ' ' + (t.componentDescription || '')).trim(),
      serial: t.serialOut || t.serialIn || '',
      state: rackState,
      location: loc,
      linkedRma: t.rmaNumber,
      source: 'rma'
    });
    t.rackLocation = loc;
    await NTDB.saveTicket(t);
    toast('Sent to rack');
    go('rma', 'rack');
  }

  return { init, go, openTicket, moveTicketToRack, state };
})();

// Boot
window.addEventListener('DOMContentLoaded', () => NTApp.init());

// PWA: register service worker
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
