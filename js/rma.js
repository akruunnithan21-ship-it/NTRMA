/* =========================================================
   RMA module — New entry, Detail/edit, Entry log
   ========================================================= */
window.NTRMA = (function () {
  const { $, el, escapeHtml, toast } = NTUI;

  // ---- Helpers ----
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  async function nextRmaNumber() {
    const tickets = await NTDB.getTickets();
    const yr = new Date().getFullYear().toString().slice(-2);
    const prefix = `NT${yr}-`;
    let max = 0;
    tickets.forEach(t => {
      if (t.rmaNumber && t.rmaNumber.startsWith(prefix)) {
        const n = parseInt(t.rmaNumber.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(4, '0');
  }

  function selectFrom(name, list, value, opts = {}) {
    const select = el('select', { class: 'select', name, id: name });
    if (opts.placeholder) select.appendChild(el('option', { value: '' }, opts.placeholder));
    list.forEach(v => {
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

  // ---- New Entry / Edit form ----
  async function renderForm(container, ticket) {
    container.innerHTML = '';

    const isEdit = !!(ticket && ticket.id);
    const t = ticket || {
      rmaNumber: await nextRmaNumber(),
      submissionDate: todayISO(),
      status: 'Pending'
    };

    const [vendors, submitTo, componentTypes, statuses, rackLocations] = await Promise.all([
      NTDB.getSetting('vendors'),
      NTDB.getSetting('submitTo'),
      NTDB.getSetting('componentTypes'),
      Promise.resolve(NTDB.DEFAULTS.statuses),
      NTDB.getSetting('rackLocations')
    ]);

    const head = el('div', { class: 'detail-head fade-up' },
      el('div', {},
        el('div', { class: 't' }, isEdit ? 'EDIT TICKET' : 'NEW ENTRY'),
        el('div', { class: 'rma' }, t.rmaNumber || '— assigning —')
      ),
      el('div', {}, el('span', { class: 'pill', dataset: { status: t.status || 'Pending' } },
        el('span', { class: 'dot' }), t.status || 'Pending'
      ))
    );
    container.appendChild(head);

    const card = el('div', { class: 'glass padded fade-up' });
    container.appendChild(card);

    // RMA + dates
    card.appendChild(field('RMA Number',
      el('input', { class: 'input', name: 'rmaNumber', value: t.rmaNumber || '', placeholder: 'Auto-generated' })
    ));
    const datesRow = el('div', { class: 'row' });
    datesRow.appendChild(field('Submission Date',
      el('input', { class: 'input', type: 'date', name: 'submissionDate', value: t.submissionDate || todayISO() })
    ));
    datesRow.appendChild(field('Delivery Date',
      el('input', { class: 'input', type: 'date', name: 'deliveryDate', value: t.deliveryDate || '' })
    ));
    card.appendChild(datesRow);

    // Customer
    card.appendChild(field('Customer Name',
      el('input', { class: 'input', name: 'customerName', value: t.customerName || '', placeholder: 'Full name' })
    ));

    // Component type + vendor
    const compRow = el('div', { class: 'row' });
    compRow.appendChild(field('Component Type',
      selectFrom('componentType', componentTypes, t.componentType, { placeholder: 'Select type' })
    ));
    compRow.appendChild(field('Vendor / Brand',
      selectFrom('vendor', vendors, t.vendor, { placeholder: 'Select vendor' })
    ));
    card.appendChild(compRow);

    // Component description with internet search button
    const descWrap = el('div', { class: 'field' });
    descWrap.appendChild(el('label', {}, 'Component Description'));
    const descBox = el('div', { style: 'display:flex; gap:8px; align-items:stretch;' });
    const descTA = el('textarea', { class: 'textarea', name: 'componentDescription',
      placeholder: 'Brand, model, size, speed, etc. e.g. Corsair Vengeance LPX 16GB DDR4 3200MHz' }, t.componentDescription || '');
    descBox.appendChild(descTA);
    const searchBtn = el('button', { type: 'button', class: 'btn ghost', title: 'Search this on Google', style: 'min-width:54px;' }, '🔎');
    searchBtn.addEventListener('click', () => {
      const q = encodeURIComponent(descTA.value || (container.querySelector('[name=vendor]').value + ' ' + container.querySelector('[name=componentType]').value));
      window.open('https://www.google.com/search?q=' + q, '_blank', 'noopener');
    });
    descBox.appendChild(searchBtn);
    descWrap.appendChild(descBox);
    descWrap.appendChild(el('div', { class: 'help' }, 'Type model/name, then tap 🔎 to search the web for full specs.'));
    card.appendChild(descWrap);

    // Serials
    const serialRow = el('div', { class: 'row' });
    serialRow.appendChild(field('Serial Number IN',
      el('input', { class: 'input', name: 'serialIn', value: t.serialIn || '', placeholder: 'Component received' })
    ));
    serialRow.appendChild(field('Serial Number OUT',
      el('input', { class: 'input', name: 'serialOut', value: t.serialOut || '', placeholder: 'Replacement, if any' })
    ));
    card.appendChild(serialRow);

    // Submitted to + status
    const subRow = el('div', { class: 'row' });
    subRow.appendChild(field('RMA Submitted To',
      selectFrom('submittedTo', submitTo, t.submittedTo, { placeholder: 'Select partner' })
    ));
    subRow.appendChild(field('Status',
      selectFrom('status', statuses, t.status || 'Pending')
    ));
    card.appendChild(subRow);

    // Rack location (only meaningful when in-house)
    card.appendChild(field('Rack / Location (optional)',
      selectFrom('rackLocation', rackLocations, t.rackLocation, { placeholder: 'Not in stock' }),
      'Tip: After "Picked up" you can also send the item to the Rack inventory.'
    ));

    // Defect
    card.appendChild(field('Defect',
      el('textarea', { class: 'textarea', name: 'defect', placeholder: 'Describe the defect / customer complaint' }, t.defect || '')
    ));

    // Remarks
    card.appendChild(field('Remarks',
      el('textarea', { class: 'textarea', name: 'remarks', placeholder: 'Internal remarks, follow-up notes, etc.' }, t.remarks || '')
    ));

    // Buttons
    const btnRow = el('div', { class: 'btn-row' });
    const cancelBtn = el('button', { type: 'button', class: 'btn ghost' }, 'CANCEL');
    cancelBtn.addEventListener('click', () => {
      if (isEdit) NTApp.openTicket(t.id);
      else NTApp.go('rma', 'log');
    });
    const saveBtn = el('button', { type: 'button', class: 'btn primary' }, isEdit ? 'UPDATE' : 'SAVE ENTRY');
    saveBtn.addEventListener('click', async () => {
      const payload = collect(card);
      payload.id = t.id;
      payload.createdAt = t.createdAt;
      const saved = await NTDB.saveTicket(payload);
      toast(isEdit ? 'Ticket updated' : 'Ticket saved');
      // Transport to detail view (still fully editable)
      NTApp.openTicket(saved.id);
    });
    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    card.appendChild(btnRow);

    // Delete row (edit mode only)
    if (isEdit) {
      const delBtn = el('button', { type: 'button', class: 'btn danger full mt-12' }, 'DELETE TICKET');
      delBtn.addEventListener('click', async () => {
        if (!await NTUI.confirm(`Delete ticket ${t.rmaNumber}? This cannot be undone.`)) return;
        await NTDB.deleteTicket(t.id);
        toast('Ticket deleted');
        NTApp.go('rma', 'log');
      });
      card.appendChild(delBtn);
    }
  }

  function collect(root) {
    const get = (name) => {
      const f = root.querySelector(`[name="${name}"]`);
      return f ? (f.value || '').trim() : '';
    };
    return {
      rmaNumber: get('rmaNumber'),
      customerName: get('customerName'),
      submissionDate: get('submissionDate'),
      deliveryDate: get('deliveryDate'),
      componentType: get('componentType'),
      vendor: get('vendor'),
      componentDescription: get('componentDescription'),
      serialIn: get('serialIn'),
      serialOut: get('serialOut'),
      submittedTo: get('submittedTo'),
      status: get('status') || 'Pending',
      rackLocation: get('rackLocation'),
      defect: get('defect'),
      remarks: get('remarks')
    };
  }

  // ---- Detail view (read-only header + always editable form) ----
  async function renderDetail(container, id) {
    const t = await NTDB.getTicket(id);
    if (!t) {
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'empty' }, 'Ticket not found.'));
      return;
    }
    // Reuse the form (always editable, per requirement)
    await renderForm(container, t);

    // Append a "Send to Rack" quick action if status is Picked up / Closed
    if (t.status === 'Picked up' || t.status === 'Closed' || t.status === 'Pending install/delivery') {
      const card = container.querySelector('.glass.padded');
      const rackBtn = el('button', { type: 'button', class: 'btn ghost full mt-12' }, '➜ MOVE TO RACK / IN-HAND INVENTORY');
      rackBtn.addEventListener('click', () => NTApp.moveTicketToRack(t));
      card.appendChild(rackBtn);
    }
  }

  // ---- Entry Log ----
  async function renderLog(container) {
    container.innerHTML = '';
    const tickets = await NTDB.getTickets();

    const search = el('div', { class: 'searchbar fade-up' },
      el('span', { class: 'muted' }, '🔎'),
      el('input', { type: 'search', placeholder: 'Search RMA, name, serial, vendor…', oninput: (e) => filter(e.target.value) })
    );
    container.appendChild(search);

    const filterRow = el('div', { class: 'searchbar fade-up', style: 'gap:8px;' });
    const statusSel = selectFrom('flt-status', ['All', ...NTDB.DEFAULTS.statuses], 'All');
    statusSel.style.maxWidth = '180px';
    statusSel.addEventListener('change', () => filter(searchVal()));
    filterRow.appendChild(el('span', { class: 'muted', style: 'font-size:11px; letter-spacing:2px;' }, 'STATUS'));
    filterRow.appendChild(statusSel);
    container.appendChild(filterRow);

    const list = el('div', { class: 'list fade-up' });
    container.appendChild(list);

    function searchVal() { return search.querySelector('input').value.toLowerCase(); }

    function filter(q) {
      q = (q || '').toLowerCase();
      const status = statusSel.value;
      list.innerHTML = '';
      const visible = tickets.filter(t => {
        if (status !== 'All' && t.status !== status) return false;
        if (!q) return true;
        const hay = [t.rmaNumber, t.customerName, t.serialIn, t.serialOut, t.vendor, t.componentType, t.componentDescription, t.defect, t.remarks].join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (!visible.length) {
        list.appendChild(el('div', { class: 'empty' }, el('div', { class: 'big' }, '∅'), 'NO TICKETS FOUND'));
        return;
      }
      visible.forEach(t => list.appendChild(rowFor(t)));
    }

    function rowFor(t) {
      const subBits = [t.componentType, t.vendor, t.customerName].filter(Boolean).join(' • ');
      const row = el('div', { class: 'list-item' },
        el('div', { class: 'meta' },
          el('div', { class: 'name' }, t.customerName || '— no name —'),
          el('div', { class: 'sub' }, subBits || '—')
        ),
        el('div', { class: 'right' },
          el('span', { class: 'rma-no' }, t.rmaNumber || '—'),
          el('span', { class: 'pill', dataset: { status: t.status || 'Pending' } }, el('span', { class: 'dot' }), t.status || 'Pending')
        )
      );
      row.addEventListener('click', () => NTApp.openTicket(t.id));
      return row;
    }

    filter('');
  }

  return { renderForm, renderDetail, renderLog, nextRmaNumber };
})();
