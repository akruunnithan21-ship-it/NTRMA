/* =========================================================
   Local persistence layer (IndexedDB via idb-style wrapper)
   Stores: tickets, rack, settings (vendors / submitTo / componentTypes)
   ========================================================= */
window.NTDB = (function () {
  const DB_NAME = 'ntrma-db';
  const DB_VERSION = 1;
  const STORES = ['tickets', 'rack', 'settings'];

  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('tickets')) {
          const s = db.createObjectStore('tickets', { keyPath: 'id' });
          s.createIndex('rmaNumber', 'rmaNumber', { unique: false });
          s.createIndex('status', 'status', { unique: false });
          s.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('rack')) {
          db.createObjectStore('rack', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
    });
  }

  function tx(store, mode = 'readonly') {
    return open().then(db => db.transaction(store, mode).objectStore(store));
  }

  function put(store, value) {
    return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
      const r = s.put(value);
      r.onsuccess = () => res(value);
      r.onerror = () => rej(r.error);
    }));
  }
  function get(store, key) {
    return tx(store).then(s => new Promise((res, rej) => {
      const r = s.get(key);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
  }
  function getAll(store) {
    return tx(store).then(s => new Promise((res, rej) => {
      const r = s.getAll();
      r.onsuccess = () => res(r.result || []);
      r.onerror = () => rej(r.error);
    }));
  }
  function del(store, key) {
    return tx(store, 'readwrite').then(s => new Promise((res, rej) => {
      const r = s.delete(key);
      r.onsuccess = () => res(true);
      r.onerror = () => rej(r.error);
    }));
  }

  // ---- Defaults ----
  const DEFAULTS = {
    vendors: ['ASUS', 'Nvidia', 'Gigabyte', 'Deepcool', 'Corsair', 'GSkill', 'Adata', 'AMD', 'Intel', 'MSI', 'Cooler Master'],
    submitTo: ['ACRO', 'Gigabyte', 'F1', 'Hizen'],
    componentTypes: ['RAM', 'CPU', 'Motherboard', 'PSU', 'Cooler', 'Monitor', 'GPU', 'SSD', 'HDD', 'Cabinet', 'Keyboard', 'Mouse', 'Headset'],
    statuses: ['Pending', 'Open', 'Closed', 'Ready for pick up', 'Picked up', 'Pending install/delivery', 'Nil'],
    rackLocations: ['Rack A', 'Rack B', 'Rack C', 'Service Bench', 'Damaged Bin']
  };

  async function getSetting(key) {
    const row = await get('settings', key);
    if (row) return row.value;
    if (DEFAULTS[key]) {
      await put('settings', { key, value: DEFAULTS[key].slice() });
      return DEFAULTS[key].slice();
    }
    return null;
  }
  async function setSetting(key, value) {
    return put('settings', { key, value });
  }
  async function addSettingItem(key, item) {
    const list = (await getSetting(key)) || [];
    if (!list.includes(item)) {
      list.push(item);
      await setSetting(key, list);
    }
    return list;
  }
  async function removeSettingItem(key, item) {
    const list = (await getSetting(key)) || [];
    const next = list.filter(x => x !== item);
    await setSetting(key, next);
    return next;
  }

  // ---- Tickets ----
  function newId() { return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }

  async function saveTicket(t) {
    if (!t.id) t.id = newId();
    if (!t.createdAt) t.createdAt = Date.now();
    t.updatedAt = Date.now();
    await put('tickets', t);
    return t;
  }
  function getTicket(id) { return get('tickets', id); }
  function getTickets() { return getAll('tickets').then(list => list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }
  function deleteTicket(id) { return del('tickets', id); }

  // ---- Rack ----
  async function saveRack(item) {
    if (!item.id) item.id = 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    if (!item.createdAt) item.createdAt = Date.now();
    item.updatedAt = Date.now();
    await put('rack', item);
    return item;
  }
  function getRack() { return getAll('rack').then(list => list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))); }
  function getRackItem(id) { return get('rack', id); }
  function deleteRackItem(id) { return del('rack', id); }

  // ---- Backup / restore ----
  async function exportAll() {
    const [tickets, rack, vendors, submitTo, componentTypes, rackLocations] = await Promise.all([
      getTickets(), getRack(),
      getSetting('vendors'), getSetting('submitTo'), getSetting('componentTypes'), getSetting('rackLocations')
    ]);
    return {
      app: 'NeoTokyoRMA',
      version: 1,
      exportedAt: new Date().toISOString(),
      tickets, rack,
      settings: { vendors, submitTo, componentTypes, rackLocations }
    };
  }

  async function restoreAll(payload) {
    if (!payload || payload.app !== 'NeoTokyoRMA') throw new Error('Invalid backup file');
    if (Array.isArray(payload.tickets)) {
      for (const t of payload.tickets) await put('tickets', t);
    }
    if (Array.isArray(payload.rack)) {
      for (const r of payload.rack) await put('rack', r);
    }
    if (payload.settings) {
      for (const k of Object.keys(payload.settings)) {
        if (payload.settings[k]) await setSetting(k, payload.settings[k]);
      }
    }
    return true;
  }

  return {
    open, newId,
    getSetting, setSetting, addSettingItem, removeSettingItem, DEFAULTS,
    saveTicket, getTicket, getTickets, deleteTicket,
    saveRack, getRack, getRackItem, deleteRackItem,
    exportAll, restoreAll
  };
})();
