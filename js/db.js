/* =========================================================
   Local persistence layer (IndexedDB via idb-style wrapper)
   Stores: tickets, rack, settings, serviceTickets, onsiteTickets, remoteTickets
   ========================================================= */
window.NTDB = (function () {
  const DB_NAME = 'ntrma-db';
  const DB_VERSION = 2;
  const STORES = ['tickets', 'rack', 'settings', 'serviceTickets', 'onsiteTickets', 'remoteTickets'];

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
        if (!db.objectStoreNames.contains('serviceTickets')) {
          const s = db.createObjectStore('serviceTickets', { keyPath: 'id' });
          s.createIndex('ticketNumber', 'ticketNumber', { unique: false });
          s.createIndex('status', 'status', { unique: false });
          s.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('onsiteTickets')) {
          const s = db.createObjectStore('onsiteTickets', { keyPath: 'id' });
          s.createIndex('ticketNumber', 'ticketNumber', { unique: false });
          s.createIndex('status', 'status', { unique: false });
          s.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('remoteTickets')) {
          const s = db.createObjectStore('remoteTickets', { keyPath: 'id' });
          s.createIndex('ticketNumber', 'ticketNumber', { unique: false });
          s.createIndex('status', 'status', { unique: false });
          s.createIndex('createdAt', 'createdAt', { unique: false });
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
    serviceStatuses: ['Open', 'Closed', 'Pending', 'Requires RMA'],
    onsiteStatuses: ['Open', 'Closed', 'Pending', 'Requires In-Store Service', 'Requires RMA'],
    remoteStatuses: ['Open', 'Closed', 'Pending', 'Requires In-Store Service', 'Requires RMA'],
    technicians: ['Akru', 'Jithin', 'Vishnu', 'Amal', 'Unassigned'],
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

  // ---- ID generators ----
  function newId() { return 't_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7); }

  // ---- RMA Tickets ----
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

  // ---- Service Tickets ----
  async function saveServiceTicket(t) {
    if (!t.id) t.id = 'sv_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    if (!t.createdAt) t.createdAt = Date.now();
    t.updatedAt = Date.now();
    await put('serviceTickets', t);
    return t;
  }
  function getServiceTicket(id) { return get('serviceTickets', id); }
  function getServiceTickets() { return getAll('serviceTickets').then(list => list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }
  function deleteServiceTicket(id) { return del('serviceTickets', id); }

  // ---- Onsite Tickets ----
  async function saveOnsiteTicket(t) {
    if (!t.id) t.id = 'on_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    if (!t.createdAt) t.createdAt = Date.now();
    t.updatedAt = Date.now();
    await put('onsiteTickets', t);
    return t;
  }
  function getOnsiteTicket(id) { return get('onsiteTickets', id); }
  function getOnsiteTickets() { return getAll('onsiteTickets').then(list => list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }
  function deleteOnsiteTicket(id) { return del('onsiteTickets', id); }

  // ---- Remote Session Tickets ----
  async function saveRemoteTicket(t) {
    if (!t.id) t.id = 'rm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    if (!t.createdAt) t.createdAt = Date.now();
    t.updatedAt = Date.now();
    await put('remoteTickets', t);
    return t;
  }
  function getRemoteTicket(id) { return get('remoteTickets', id); }
  function getRemoteTickets() { return getAll('remoteTickets').then(list => list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))); }
  function deleteRemoteTicket(id) { return del('remoteTickets', id); }

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
    const [tickets, rack, serviceTickets, onsiteTickets, remoteTickets, vendors, submitTo, componentTypes, rackLocations, technicians] = await Promise.all([
      getTickets(), getRack(), getServiceTickets(), getOnsiteTickets(), getRemoteTickets(),
      getSetting('vendors'), getSetting('submitTo'), getSetting('componentTypes'), getSetting('rackLocations'), getSetting('technicians')
    ]);
    return {
      app: 'NeoTokyoRMA',
      version: 2,
      exportedAt: new Date().toISOString(),
      tickets, rack, serviceTickets, onsiteTickets, remoteTickets,
      settings: { vendors, submitTo, componentTypes, rackLocations, technicians }
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
    if (Array.isArray(payload.serviceTickets)) {
      for (const t of payload.serviceTickets) await put('serviceTickets', t);
    }
    if (Array.isArray(payload.onsiteTickets)) {
      for (const t of payload.onsiteTickets) await put('onsiteTickets', t);
    }
    if (Array.isArray(payload.remoteTickets)) {
      for (const t of payload.remoteTickets) await put('remoteTickets', t);
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
    saveServiceTicket, getServiceTicket, getServiceTickets, deleteServiceTicket,
    saveOnsiteTicket, getOnsiteTicket, getOnsiteTickets, deleteOnsiteTicket,
    saveRemoteTicket, getRemoteTicket, getRemoteTickets, deleteRemoteTicket,
    saveRack, getRack, getRackItem, deleteRackItem,
    exportAll, restoreAll
  };
})();
