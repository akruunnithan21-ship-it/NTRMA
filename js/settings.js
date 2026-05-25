/* =========================================================
   Settings — premium card grid
   - Manage vendors, RMA partners (submitTo), component types, rack locations
   - Excel export
   - Manual JSON backup / restore
   ========================================================= */
window.NTSettings = (function () {
  const { $, el, toast } = NTUI;

  async function render(container) {
    container.innerHTML = '';
    const grid = el('div', { class: 'settings-grid fade-up' });
    container.appendChild(grid);

    grid.appendChild(await listCard({
      title: 'VENDORS / BRANDS', icon: '◇', key: 'vendors',
      placeholder: 'Add vendor (e.g. MSI)'
    }));
    grid.appendChild(await listCard({
      title: 'RMA SUBMITTED TO', icon: '✦', key: 'submitTo',
      placeholder: 'Add partner (e.g. ACRO)'
    }));
    grid.appendChild(await listCard({
      title: 'COMPONENT TYPES', icon: '◈', key: 'componentTypes',
      placeholder: 'Add type (e.g. GPU)'
    }));
    grid.appendChild(await listCard({
      title: 'RACK LOCATIONS', icon: '▤', key: 'rackLocations',
      placeholder: 'Add location (e.g. Rack D)'
    }));
    grid.appendChild(await listCard({
      title: 'TECHNICIANS', icon: '👤', key: 'technicians',
      placeholder: 'Add technician name'
    }));

    // Stats card
    grid.appendChild(await statsCard());

    // Export card
    grid.appendChild(exportCard());

    // Backup card
    grid.appendChild(backupCard());

    // App info card
    grid.appendChild(infoCard());

    // Danger zone
    grid.appendChild(dangerCard());
  }

  async function listCard({ title, icon, key, placeholder }) {
    const card = el('div', { class: 'settings-card' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, icon), title));
    const list = el('div', { class: 'chip-row' });
    card.appendChild(list);

    const items = (await NTDB.getSetting(key)) || [];
    function paint(arr) {
      list.innerHTML = '';
      arr.forEach(v => {
        const c = el('span', { class: 'chip' }, v,
          el('span', { class: 'x', title: 'Remove' }, '✕'));
        c.querySelector('.x').addEventListener('click', async () => {
          const next = await NTDB.removeSettingItem(key, v);
          paint(next);
        });
        list.appendChild(c);
      });
      if (!arr.length) list.appendChild(el('div', { class: 'help' }, 'No items yet — add some below.'));
    }
    paint(items);

    const add = el('div', { class: 'add-row' });
    const inp = el('input', { class: 'input', placeholder });
    const btn = el('button', { class: 'btn primary' }, 'ADD');
    btn.addEventListener('click', async () => {
      const v = inp.value.trim();
      if (!v) return;
      const next = await NTDB.addSettingItem(key, v);
      inp.value = '';
      paint(next);
      toast('Added');
    });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
    add.appendChild(inp); add.appendChild(btn);
    card.appendChild(add);
    return card;
  }

  async function statsCard() {
    const tickets = await NTDB.getTickets();
    const rack = await NTDB.getRack();
    const serviceTickets = await NTDB.getServiceTickets();
    const onsiteTickets = await NTDB.getOnsiteTickets();
    const remoteTickets = await NTDB.getRemoteTickets();
    const open = tickets.filter(t => ['Pending', 'Open'].includes(t.status)).length;
    const ready = tickets.filter(t => t.status === 'Ready for pick up').length;
    const closed = tickets.filter(t => t.status === 'Closed').length;

    const card = el('div', { class: 'settings-card' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, '∑'), 'AT A GLANCE'));
    const grid = el('div', { class: 'row thirds', style: 'margin-top: 8px;' });
    grid.appendChild(stat('RMA Total', tickets.length));
    grid.appendChild(stat('RMA Open', open));
    grid.appendChild(stat('RMA Ready', ready));
    card.appendChild(grid);
    const grid2 = el('div', { class: 'row thirds', style: 'margin-top: 8px;' });
    grid2.appendChild(stat('Service', serviceTickets.length));
    grid2.appendChild(stat('Onsite', onsiteTickets.length));
    grid2.appendChild(stat('Remote', remoteTickets.length));
    card.appendChild(grid2);
    const grid3 = el('div', { class: 'row thirds', style: 'margin-top: 8px;' });
    grid3.appendChild(stat('In Hand', rack.filter(r => r.state === 'IN_HAND').length));
    grid3.appendChild(stat('At Rack', rack.filter(r => r.state === 'AT_RACK').length));
    grid3.appendChild(stat('RMA Closed', closed));
    card.appendChild(grid3);
    return card;
  }
  function stat(label, value) {
    return el('div', { class: 'glass padded center', style: 'padding:12px;' },
      el('div', { class: 'mono', style: 'font-size:22px; font-weight:700; background: var(--grad-brand); -webkit-background-clip: text; background-clip: text; color: transparent;' }, String(value)),
      el('div', { class: 'help' }, label)
    );
  }

  function exportCard() {
    const card = el('div', { class: 'settings-card' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, '⤓'), 'EXCEL EXPORT'));
    card.appendChild(el('div', { class: 'help' }, 'Export every ticket into a single mother sheet (.xlsx). Use this whenever you need to update or share the master file.'));
    const btn = el('button', { class: 'btn primary full mt-12' }, '⬇ EXPORT TO EXCEL (.xlsx)');
    btn.addEventListener('click', async () => {
      const tickets = await NTDB.getTickets();
      if (!tickets.length) { toast('No tickets to export'); return; }
      await NTExcel.exportToXLSX(tickets);
      toast('Exported');
    });
    card.appendChild(btn);
    return card;
  }

  function backupCard() {
    const card = el('div', { class: 'settings-card' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, '◉'), 'MANUAL BACKUP'));
    card.appendChild(el('div', { class: 'help' }, 'Save a complete .json snapshot (tickets, rack, settings) to your device. You can restore it later on this or another device.'));

    const row = el('div', { class: 'btn-row mt-12' });
    const exp = el('button', { class: 'btn ghost' }, '⤓ BACKUP NOW');
    exp.addEventListener('click', async () => {
      const payload = await NTDB.exportAll();
      await NTExcel.exportBackupJSON(payload);
      toast('Backup downloaded');
    });

    const fileInput = el('input', { type: 'file', accept: '.json', style: 'display:none' });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files[0]; if (!f) return;
      try {
        const txt = await f.text();
        const data = JSON.parse(txt);
        if (!await NTUI.confirm('Restore from this backup? Existing items with same IDs will be overwritten.')) return;
        await NTDB.restoreAll(data);
        toast('Restored');
        NTApp.go('rma', 'log');
      } catch (e) { alert('Restore failed: ' + e.message); }
      fileInput.value = '';
    });
    const imp = el('button', { class: 'btn ghost' }, '⤒ RESTORE');
    imp.addEventListener('click', () => fileInput.click());

    row.appendChild(exp); row.appendChild(imp);
    card.appendChild(row);
    card.appendChild(fileInput);
    return card;
  }

  function infoCard() {
    const card = el('div', { class: 'settings-card' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, 'ⓘ'), 'APP INFO'));
    card.appendChild(el('div', { class: 'help' },
      'Neo Tokyo Service / RMA Tracker — v0.1. Built as an installable PWA. Add to home screen on your phone for a native-app feel. All data stays on this device unless you back it up or export.'));
    return card;
  }

  function dangerCard() {
    const card = el('div', { class: 'settings-card danger-zone' });
    card.appendChild(el('div', { class: 'h' }, el('span', { class: 'ico' }, '⚠'), 'DANGER ZONE'));
    card.appendChild(el('div', { class: 'help' }, 'Permanently wipe all tickets, rack and settings on this device. Make sure you have a backup first.'));
    const btn = el('button', { class: 'btn danger full mt-12' }, '✕ WIPE ALL DATA');
    btn.addEventListener('click', async () => {
      if (!await NTUI.confirm('This will delete EVERYTHING on this device. Continue?')) return;
      if (!await NTUI.confirm('Are you absolutely sure? This cannot be undone.')) return;
      indexedDB.deleteDatabase('ntrma-db');
      setTimeout(() => location.reload(), 400);
    });
    card.appendChild(btn);
    return card;
  }

  return { render };
})();
