/* =========================================================
   SERVICE module — Service Tickets, Onsite, Remote Sessions
   ========================================================= */
window.NTService = (function () {
  const { $, el, toast } = NTUI;

  // ---- Helpers ----
  function nowDateTimeLocal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + 'T' + h + ':' + mi;
  }

  function todayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }


  async function nextTicketNumber(prefix) {
    let tickets = [];
    if (prefix === 'SV') tickets = await NTDB.getServiceTickets();
    else if (prefix === 'ON') tickets = await NTDB.getOnsiteTickets();
    else if (prefix === 'RM') tickets = await NTDB.getRemoteTickets();
    const yr = new Date().getFullYear().toString().slice(-2);
    const pfx = prefix + yr + '-';
    let max = 0;
    tickets.forEach(t => {
      if (t.ticketNumber && t.ticketNumber.startsWith(pfx)) {
        const n = parseInt(t.ticketNumber.slice(pfx.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return pfx + String(max + 1).padStart(4, '0');
  }

  function selectFrom(name, list, value, opts) {
    opts = opts || {};
    const select = el('select', { class: 'select', name: name, id: name });
    if (opts.placeholder) select.appendChild(el('option', { value: '' }, opts.placeholder));
    list.forEach(function(v) {
      const o = el('option', { value: v }, v);
      if (v === value) o.selected = true;
      select.appendChild(o);
    });
    return select;
  }

  function field(label, control, helpText) {
    const f = el('div', { class: 'field' });
    f.appendChild(el('label', {}, label));
    f.appendChild(control);
    if (helpText) f.appendChild(el('div', { class: 'help' }, helpText));
    return f;
  }


  // ===================== SERVICE TICKET FORM =====================
  async function renderServiceForm(container, ticket) {
    container.innerHTML = '';
    const isEdit = !!(ticket && ticket.id);
    const t = ticket || {
      ticketNumber: await nextTicketNumber('SV'),
      dateTime: nowDateTimeLocal(),
      status: 'Open'
    };

    const technicians = await NTDB.getSetting('technicians');
    const statuses = NTDB.DEFAULTS.serviceStatuses;

    const head = el('div', { class: 'detail-head fade-up' },
      el('div', {},
        el('div', { class: 't' }, isEdit ? 'EDIT SERVICE TICKET' : 'NEW SERVICE TICKET'),
        el('div', { class: 'rma' }, t.ticketNumber || '—')
      ),
      el('div', {},
        el('span', { class: 'pill service-type-pill st-service' },
          el('span', { class: 'dot' }), 'SERVICE'
        )
      )
    );
    container.appendChild(head);

    const card = el('div', { class: 'glass padded fade-up' });
    container.appendChild(card);

    card.appendChild(field('Ticket Number',
      el('input', { class: 'input', name: 'ticketNumber', value: t.ticketNumber || '', readonly: 'readonly' })
    ));


    card.appendChild(field('Customer Name',
      el('input', { class: 'input', name: 'customerName', value: t.customerName || '', placeholder: 'Full name' })
    ));

    card.appendChild(field('Phone',
      el('input', { class: 'input', type: 'tel', name: 'phone', value: t.phone || '', placeholder: 'Phone number' })
    ));

    card.appendChild(field('Date & Time',
      el('input', { class: 'input', type: 'datetime-local', name: 'dateTime', value: t.dateTime || nowDateTimeLocal() })
    ));

    card.appendChild(field('Customer Complaint / Issues',
      el('textarea', { class: 'textarea', name: 'complaint', placeholder: 'Describe the issue or complaint' }, t.complaint || '')
    ));

    const techRow = el('div', { class: 'row' });
    techRow.appendChild(field('Assign Technician',
      selectFrom('technician', technicians, t.technician, { placeholder: 'Select technician' })
    ));
    techRow.appendChild(field('Status',
      selectFrom('status', statuses, t.status || 'Open')
    ));
    card.appendChild(techRow);

    card.appendChild(field('Remarks',
      el('textarea', { class: 'textarea', name: 'remarks', placeholder: 'Internal notes' }, t.remarks || '')
    ));


    // Buttons
    var btnRow = el('div', { class: 'btn-row' });
    var cancelBtn = el('button', { type: 'button', class: 'btn ghost' }, 'CANCEL');
    cancelBtn.addEventListener('click', function() { NTApp.go('service', 'list'); });
    var saveBtn = el('button', { type: 'button', class: 'btn primary' }, isEdit ? 'UPDATE' : 'SAVE TICKET');
    saveBtn.addEventListener('click', async function() {
      var payload = collectService(card);
      payload.id = t.id;
      payload.createdAt = t.createdAt;
      payload.type = 'service';
      var saved = await NTDB.saveServiceTicket(payload);
      toast(isEdit ? 'Ticket updated' : 'Service ticket saved');
      NTApp.go('service', 'list');
    });
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    card.appendChild(btnRow);

    if (isEdit) {
      var delBtn = el('button', { type: 'button', class: 'btn danger full mt-12' }, 'DELETE TICKET');
      delBtn.addEventListener('click', async function() {
        if (!await NTUI.confirm('Delete ticket ' + t.ticketNumber + '? This cannot be undone.')) return;
        await NTDB.deleteServiceTicket(t.id);
        toast('Ticket deleted');
        NTApp.go('service', 'list');
      });
      card.appendChild(delBtn);
    }
  }

  function collectService(root) {
    var getValue = function(name) {
      var f = root.querySelector('[name="' + name + '"]');
      return f ? (f.value || '').trim() : '';
    };
    return {
      ticketNumber: getValue('ticketNumber'),
      customerName: getValue('customerName'),
      phone: getValue('phone'),
      dateTime: getValue('dateTime'),
      complaint: getValue('complaint'),
      technician: getValue('technician'),
      status: getValue('status') || 'Open',
      remarks: getValue('remarks')
    };
  }


  // ===================== ONSITE TICKET FORM =====================
  async function renderOnsiteForm(container, ticket) {
    container.innerHTML = '';
    var isEdit = !!(ticket && ticket.id);
    var t = ticket || {
      ticketNumber: await nextTicketNumber('ON'),
      dateTime: nowDateTimeLocal(),
      status: 'Open'
    };

    var technicians = await NTDB.getSetting('technicians');
    var statuses = NTDB.DEFAULTS.onsiteStatuses;

    var head = el('div', { class: 'detail-head fade-up' },
      el('div', {},
        el('div', { class: 't' }, isEdit ? 'EDIT ONSITE TICKET' : 'NEW ONSITE TICKET'),
        el('div', { class: 'rma' }, t.ticketNumber || '—')
      ),
      el('div', {},
        el('span', { class: 'pill service-type-pill st-onsite' },
          el('span', { class: 'dot' }), 'ONSITE'
        )
      )
    );
    container.appendChild(head);

    var card = el('div', { class: 'glass padded fade-up' });
    container.appendChild(card);

    card.appendChild(field('Ticket Number',
      el('input', { class: 'input', name: 'ticketNumber', value: t.ticketNumber || '', readonly: 'readonly' })
    ));

    card.appendChild(field('Customer Name',
      el('input', { class: 'input', name: 'customerName', value: t.customerName || '', placeholder: 'Full name' })
    ));

    card.appendChild(field('Phone',
      el('input', { class: 'input', type: 'tel', name: 'phone', value: t.phone || '', placeholder: 'Phone number' })
    ));


    card.appendChild(field('Date & Time',
      el('input', { class: 'input', type: 'datetime-local', name: 'dateTime', value: t.dateTime || nowDateTimeLocal() })
    ));

    card.appendChild(field('Customer Complaint / Issues',
      el('textarea', { class: 'textarea', name: 'complaint', placeholder: 'Describe the issue or complaint' }, t.complaint || '')
    ));

    card.appendChild(field('Location',
      el('input', { class: 'input', name: 'location', value: t.location || '', placeholder: 'Customer address / location' })
    ));

    var techRow = el('div', { class: 'row' });
    techRow.appendChild(field('Assign Technician',
      selectFrom('technician', technicians, t.technician, { placeholder: 'Select technician' })
    ));
    techRow.appendChild(field('Status',
      selectFrom('status', statuses, t.status || 'Open')
    ));
    card.appendChild(techRow);

    card.appendChild(field('Remarks',
      el('textarea', { class: 'textarea', name: 'remarks', placeholder: 'Internal notes' }, t.remarks || '')
    ));

    // Buttons
    var btnRow = el('div', { class: 'btn-row' });
    var cancelBtn = el('button', { type: 'button', class: 'btn ghost' }, 'CANCEL');
    cancelBtn.addEventListener('click', function() { NTApp.go('service', 'list'); });
    var saveBtn = el('button', { type: 'button', class: 'btn primary' }, isEdit ? 'UPDATE' : 'SAVE TICKET');
    saveBtn.addEventListener('click', async function() {
      var payload = collectOnsite(card);
      payload.id = t.id;
      payload.createdAt = t.createdAt;
      payload.type = 'onsite';
      var saved = await NTDB.saveOnsiteTicket(payload);
      toast(isEdit ? 'Ticket updated' : 'Onsite ticket saved');
      NTApp.go('service', 'list');
    });
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    card.appendChild(btnRow);


    if (isEdit) {
      var delBtn = el('button', { type: 'button', class: 'btn danger full mt-12' }, 'DELETE TICKET');
      delBtn.addEventListener('click', async function() {
        if (!await NTUI.confirm('Delete ticket ' + t.ticketNumber + '? This cannot be undone.')) return;
        await NTDB.deleteOnsiteTicket(t.id);
        toast('Ticket deleted');
        NTApp.go('service', 'list');
      });
      card.appendChild(delBtn);
    }
  }

  function collectOnsite(root) {
    var getValue = function(name) {
      var f = root.querySelector('[name="' + name + '"]');
      return f ? (f.value || '').trim() : '';
    };
    return {
      ticketNumber: getValue('ticketNumber'),
      customerName: getValue('customerName'),
      phone: getValue('phone'),
      dateTime: getValue('dateTime'),
      complaint: getValue('complaint'),
      location: getValue('location'),
      technician: getValue('technician'),
      status: getValue('status') || 'Open',
      remarks: getValue('remarks')
    };
  }


  // ===================== REMOTE SESSION TICKET FORM =====================
  async function renderRemoteForm(container, ticket) {
    container.innerHTML = '';
    var isEdit = !!(ticket && ticket.id);
    var t = ticket || {
      ticketNumber: await nextTicketNumber('RM'),
      dateTime: nowDateTimeLocal(),
      status: 'Open'
    };

    var technicians = await NTDB.getSetting('technicians');
    var statuses = NTDB.DEFAULTS.remoteStatuses;

    var head = el('div', { class: 'detail-head fade-up' },
      el('div', {},
        el('div', { class: 't' }, isEdit ? 'EDIT REMOTE SESSION' : 'NEW REMOTE SESSION'),
        el('div', { class: 'rma' }, t.ticketNumber || '—')
      ),
      el('div', {},
        el('span', { class: 'pill service-type-pill st-remote' },
          el('span', { class: 'dot' }), 'REMOTE'
        )
      )
    );
    container.appendChild(head);

    var card = el('div', { class: 'glass padded fade-up' });
    container.appendChild(card);

    card.appendChild(field('Ticket Number',
      el('input', { class: 'input', name: 'ticketNumber', value: t.ticketNumber || '', readonly: 'readonly' })
    ));

    card.appendChild(field('Customer Name',
      el('input', { class: 'input', name: 'customerName', value: t.customerName || '', placeholder: 'Full name' })
    ));

    card.appendChild(field('Phone',
      el('input', { class: 'input', type: 'tel', name: 'phone', value: t.phone || '', placeholder: 'Phone number' })
    ));


    card.appendChild(field('Date & Time',
      el('input', { class: 'input', type: 'datetime-local', name: 'dateTime', value: t.dateTime || nowDateTimeLocal() })
    ));

    card.appendChild(field('Customer Complaint / Issues',
      el('textarea', { class: 'textarea', name: 'complaint', placeholder: 'Describe the issue or complaint' }, t.complaint || '')
    ));

    card.appendChild(field('Location',
      el('input', { class: 'input', name: 'location', value: t.location || '', placeholder: 'Remote location / address (optional)' })
    ));

    var techRow = el('div', { class: 'row' });
    techRow.appendChild(field('Assign Technician',
      selectFrom('technician', technicians, t.technician, { placeholder: 'Select technician' })
    ));
    techRow.appendChild(field('Status',
      selectFrom('status', statuses, t.status || 'Open')
    ));
    card.appendChild(techRow);

    card.appendChild(field('Remarks',
      el('textarea', { class: 'textarea', name: 'remarks', placeholder: 'Internal notes' }, t.remarks || '')
    ));

    // Buttons
    var btnRow = el('div', { class: 'btn-row' });
    var cancelBtn = el('button', { type: 'button', class: 'btn ghost' }, 'CANCEL');
    cancelBtn.addEventListener('click', function() { NTApp.go('service', 'list'); });
    var saveBtn = el('button', { type: 'button', class: 'btn primary' }, isEdit ? 'UPDATE' : 'SAVE TICKET');
    saveBtn.addEventListener('click', async function() {
      var payload = collectRemote(card);
      payload.id = t.id;
      payload.createdAt = t.createdAt;
      payload.type = 'remote';
      var saved = await NTDB.saveRemoteTicket(payload);
      toast(isEdit ? 'Ticket updated' : 'Remote session saved');
      NTApp.go('service', 'list');
    });
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    card.appendChild(btnRow);


    if (isEdit) {
      var delBtn = el('button', { type: 'button', class: 'btn danger full mt-12' }, 'DELETE TICKET');
      delBtn.addEventListener('click', async function() {
        if (!await NTUI.confirm('Delete ticket ' + t.ticketNumber + '? This cannot be undone.')) return;
        await NTDB.deleteRemoteTicket(t.id);
        toast('Ticket deleted');
        NTApp.go('service', 'list');
      });
      card.appendChild(delBtn);
    }
  }

  function collectRemote(root) {
    var getValue = function(name) {
      var f = root.querySelector('[name="' + name + '"]');
      return f ? (f.value || '').trim() : '';
    };
    return {
      ticketNumber: getValue('ticketNumber'),
      customerName: getValue('customerName'),
      phone: getValue('phone'),
      dateTime: getValue('dateTime'),
      complaint: getValue('complaint'),
      location: getValue('location'),
      technician: getValue('technician'),
      status: getValue('status') || 'Open',
      remarks: getValue('remarks')
    };
  }


  // ===================== SERVICE MENU (landing) =====================
  function renderMenu(container) {
    container.innerHTML = '';

    var title = el('div', { class: 'section-title fade-up' }, 'CREATE NEW TICKET');
    container.appendChild(title);

    var grid = el('div', { class: 'service-menu-grid fade-up' });

    var svcCard = el('div', { class: 'service-menu-card st-service-card' });
    svcCard.appendChild(el('div', { class: 'smc-icon' }, '⚙'));
    svcCard.appendChild(el('div', { class: 'smc-label' }, 'SERVICE TICKET'));
    svcCard.appendChild(el('div', { class: 'smc-sub' }, 'In-store diagnostics & repair'));
    svcCard.addEventListener('click', function() { NTApp.go('service', 'new-service'); });
    grid.appendChild(svcCard);

    var onCard = el('div', { class: 'service-menu-card st-onsite-card' });
    onCard.appendChild(el('div', { class: 'smc-icon' }, '🏠'));
    onCard.appendChild(el('div', { class: 'smc-label' }, 'ONSITE TICKET'));
    onCard.appendChild(el('div', { class: 'smc-sub' }, 'On-location service visit'));
    onCard.addEventListener('click', function() { NTApp.go('service', 'new-onsite'); });
    grid.appendChild(onCard);

    var rmCard = el('div', { class: 'service-menu-card st-remote-card' });
    rmCard.appendChild(el('div', { class: 'smc-icon' }, '🖥'));
    rmCard.appendChild(el('div', { class: 'smc-label' }, 'REMOTE SESSION'));
    rmCard.appendChild(el('div', { class: 'smc-sub' }, 'Remote desktop support'));
    rmCard.addEventListener('click', function() { NTApp.go('service', 'new-remote'); });
    grid.appendChild(rmCard);

    container.appendChild(grid);

    // View all tickets button
    var viewAllBtn = el('button', { class: 'btn primary full mt-16 fade-up' }, '☰  VIEW ALL TICKETS');
    viewAllBtn.addEventListener('click', function() { NTApp.go('service', 'list'); });
    container.appendChild(viewAllBtn);
  }


  // ===================== COMBINED LIST VIEW =====================
  async function renderList(container) {
    container.innerHTML = '';

    // Back to menu button
    var backBtn = el('button', { class: 'btn ghost fade-up', style: 'margin-bottom:12px;' }, '← BACK TO MENU');
    backBtn.addEventListener('click', function() { NTApp.go('service', 'menu'); });
    container.appendChild(backBtn);

    var serviceTickets = await NTDB.getServiceTickets();
    var onsiteTickets = await NTDB.getOnsiteTickets();
    var remoteTickets = await NTDB.getRemoteTickets();

    // Tag each ticket type
    serviceTickets.forEach(function(t) { t._type = 'service'; });
    onsiteTickets.forEach(function(t) { t._type = 'onsite'; });
    remoteTickets.forEach(function(t) { t._type = 'remote'; });

    var allTickets = serviceTickets.concat(onsiteTickets, remoteTickets);
    allTickets.sort(function(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });

    // Search bar
    var search = el('div', { class: 'searchbar fade-up' },
      el('span', { class: 'muted' }, '🔎'),
      el('input', { type: 'search', placeholder: 'Search tickets, name, phone…' })
    );
    search.querySelector('input').addEventListener('input', function(e) { filterList(e.target.value); });
    container.appendChild(search);

    // Filter row
    var filterRow = el('div', { class: 'searchbar fade-up', style: 'gap:8px;' });
    var typeSel = selectFrom('flt-type', ['All', 'Service', 'Onsite', 'Remote'], 'All');
    typeSel.style.maxWidth = '140px';
    typeSel.addEventListener('change', function() { filterList(searchVal()); });
    filterRow.appendChild(el('span', { class: 'muted', style: 'font-size:11px; letter-spacing:2px;' }, 'TYPE'));
    filterRow.appendChild(typeSel);

    var statusSel = selectFrom('flt-status2', ['All', 'Open', 'Closed', 'Pending', 'Requires RMA', 'Requires In-Store Service'], 'All');
    statusSel.style.maxWidth = '180px';
    statusSel.addEventListener('change', function() { filterList(searchVal()); });
    filterRow.appendChild(el('span', { class: 'muted', style: 'font-size:11px; letter-spacing:2px;' }, 'STATUS'));
    filterRow.appendChild(statusSel);
    container.appendChild(filterRow);

    var list = el('div', { class: 'list fade-up' });
    container.appendChild(list);

    function searchVal() { return search.querySelector('input').value.toLowerCase(); }


    function filterList(q) {
      q = (q || '').toLowerCase();
      var typeFilter = typeSel.value.toLowerCase();
      var statusFilter = statusSel.value;
      list.innerHTML = '';

      var visible = allTickets.filter(function(t) {
        if (typeFilter !== 'all' && t._type !== typeFilter) return false;
        if (statusFilter !== 'All' && t.status !== statusFilter) return false;
        if (!q) return true;
        var hay = [t.ticketNumber, t.customerName, t.phone, t.complaint, t.technician, t.location, t.remarks].join(' ').toLowerCase();
        return hay.includes(q);
      });

      if (!visible.length) {
        list.appendChild(el('div', { class: 'empty' }, el('div', { class: 'big' }, '∅'), 'NO TICKETS FOUND'));
        return;
      }
      visible.forEach(function(t) { list.appendChild(ticketRow(t)); });
    }

    function ticketRow(t) {
      var typeLabel = t._type === 'service' ? 'SERVICE' : t._type === 'onsite' ? 'ONSITE' : 'REMOTE';
      var typeClass = 'st-' + t._type;
      var dateStr = '';
      if (t.dateTime) {
        try {
          var d = new Date(t.dateTime);
          dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } catch(e) { dateStr = t.dateTime; }
      }
      var subBits = [t.technician, dateStr].filter(Boolean).join(' • ');

      var row = el('div', { class: 'list-item service-list-item' },
        el('div', { class: 'meta' },
          el('div', { class: 'name' }, t.customerName || '— no name —'),
          el('div', { class: 'sub' }, subBits || '—'),
          t.location ? el('div', { class: 'sub' }, '📍 ' + t.location) : null
        ),
        el('div', { class: 'right' },
          el('span', { class: 'rma-no' }, t.ticketNumber || '—'),
          el('span', { class: 'pill service-type-pill ' + typeClass },
            el('span', { class: 'dot' }), typeLabel
          ),
          el('span', { class: 'pill', dataset: { status: t.status || 'Open' } },
            el('span', { class: 'dot' }), t.status || 'Open'
          )
        )
      );
      row.addEventListener('click', function() {
        NTApp.state.activeServiceTicket = t;
        if (t._type === 'service') NTApp.go('service', 'edit-service');
        else if (t._type === 'onsite') NTApp.go('service', 'edit-onsite');
        else NTApp.go('service', 'edit-remote');
      });
      return row;
    }

    filterList('');
  }


  // ===================== DASHBOARD STATS =====================
  async function getStats() {
    var serviceTickets = await NTDB.getServiceTickets();
    var onsiteTickets = await NTDB.getOnsiteTickets();
    var remoteTickets = await NTDB.getRemoteTickets();

    return {
      service: {
        total: serviceTickets.length,
        open: serviceTickets.filter(function(t) { return t.status === 'Open' || t.status === 'Pending'; }).length,
        closed: serviceTickets.filter(function(t) { return t.status === 'Closed'; }).length
      },
      onsite: {
        total: onsiteTickets.length,
        open: onsiteTickets.filter(function(t) { return t.status === 'Open' || t.status === 'Pending'; }).length,
        closed: onsiteTickets.filter(function(t) { return t.status === 'Closed'; }).length
      },
      remote: {
        total: remoteTickets.length,
        open: remoteTickets.filter(function(t) { return t.status === 'Open' || t.status === 'Pending'; }).length,
        closed: remoteTickets.filter(function(t) { return t.status === 'Closed'; }).length
      }
    };
  }

  return {
    renderMenu: renderMenu,
    renderList: renderList,
    renderServiceForm: renderServiceForm,
    renderOnsiteForm: renderOnsiteForm,
    renderRemoteForm: renderRemoteForm,
    getStats: getStats
  };
})();
