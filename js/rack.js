/* =========================================================
   Rack inventory — physical stock of components
   States: IN_HAND (with tech) | AT_RACK (in storage)
   ========================================================= */
window.NTRack = (function () {
  const { $, el, escapeHtml, toast } = NTUI;

  async function render(container) {
    container.innerHTML = '';
    const items = await NTDB.getRack();
    const locations = await NTDB.getSetting('rackLocations');

    // Filter row
    const filt = el('div', { class: 'searchbar fade-up', style: 'gap:8px;' });
    const tabAll = el('button', { type: 'button', class: 'btn ghost', dataset: { f: 'ALL' }, style: 'padding:8px 12px;' }, 'ALL');
    const tabHand = el('button', { type: 'button', class: 'btn ghost', dataset: { f: 'IN_HAND' }, style: 'padding:8px 12px;' }, 'IN HAND');
    const tabRack = el('button', { type: 'button', class: 'btn ghost', dataset: { f: 'AT_RACK' }, style: 'padding:8px 12px;' }, 'AT RACK');
    [tabAll, tabHand, tabRack].forEach(b => b.addEventListener('click', () => setFilter(b.dataset.f)));
    filt.appendChild(tabAll); filt.appendChild(tabHand); filt.appendChild(tabRack);
    const search = el('input', { type: 'search', placeholder: 'Search rack…', style: 'flex:1;' });
    search.addEventListener('input', () => paint());
    filt.appendChild(search);
    container.appendChild(filt);

    let activeFilter = 'ALL';
    function setFilter(f) {
      activeFilter = f;
      [tabAll, tabHand, tabRack].forEach(b => {
        if (b.dataset.f === f) {
          b.classList.remove('ghost');
          b.classList.add('primary');
        } else {
          b.classList.add('ghost');
          b.classList.remove('primary');
        }
      });
      paint();
    }

    const list = el('div', { class: 'list fade-up' });
    container.appendChild(list);

    // Add new manual rack item
    const addCard = el('div', { class: 'glass padded fade-up mt-16' });
    addCard.appendChild(el('div', { class: 'section-title', style: 'margin: 4px 0 10px;' }, 'ADD RACK ITEM (MANUAL)'));
    addCard.appendChild(field('Description',
      el('input', { class: 'input', id: 'r-desc', placeholder: 'e.g. Corsair RM850 PSU – tested, working' })));
    const r1 = el('div', { class: 'row' });
    r1.appendChild(field('Serial', el('input', { class: 'input', id: 'r-serial', placeholder: 'Serial / tag' })));
    r1.appendChild(field('State', selectFromArr('r-state', ['AT_RACK', 'IN_HAND'])));
    addCard.appendChild(r1);
    addCard.appendChild(field('Location', selectFromArr('r-loc', locations || [])));
    const addBtn = el('button', { type: 'button', class: 'btn primary full mt-8' }, '+ ADD TO RACK');
    addBtn.addEventListener('click', async () => {
      const desc = $('#r-desc', addCard).value.trim();
      if (!desc) { toast('Enter a description'); return; }
      await NTDB.saveRack({
        description: desc,
        serial: $('#r-serial', addCard).value.trim(),
        state: $('#r-state', addCard).value,
        location: $('#r-loc', addCard).value,
        source: 'manual'
      });
      toast('Added to rack');
      render(container);
    });
    addCard.appendChild(addBtn);
    container.appendChild(addCard);

    function paint() {
      const q = search.value.toLowerCase();
      list.innerHTML = '';
      const filtered = items.filter(i => {
        if (activeFilter !== 'ALL' && i.state !== activeFilter) return false;
        if (!q) return true;
        return [i.description, i.serial, i.location, i.linkedRma].join(' ').toLowerCase().includes(q);
      });
      if (!filtered.length) {
        list.appendChild(el('div', { class: 'empty' }, el('div', { class: 'big' }, '◬'), 'NO ITEMS IN THIS VIEW'));
        return;
      }
      filtered.forEach(it => list.appendChild(rowFor(it)));
    }

    function rowFor(it) {
      const subBits = [it.serial, it.location, it.linkedRma].filter(Boolean).join(' • ');
      const row = el('div', { class: 'list-item' },
        el('div', { class: 'meta' },
          el('div', { class: 'name' }, it.description || '—'),
          el('div', { class: 'sub' }, subBits || '—')
        ),
        el('div', { class: 'right' },
          el('span', { class: 'rack-pill' }, it.state === 'IN_HAND' ? '🖐 IN HAND' : '▤ AT RACK'),
          el('span', { class: 'sub mono' }, new Date(it.updatedAt || it.createdAt).toLocaleDateString())
        )
      );
      row.addEventListener('click', () => openItem(it));
      return row;
    }

    async function openItem(it) {
      const dlg = el('div', { class: 'glass padded fade-up mt-12', id: 'rack-edit' });
      dlg.appendChild(el('div', { class: 'section-title', style: 'margin: 0 0 10px;' }, 'EDIT RACK ITEM'));
      const descI = el('input', { class: 'input', value: it.description || '' });
      const serI = el('input', { class: 'input', value: it.serial || '' });
      const stateS = selectFromArr('', ['AT_RACK', 'IN_HAND'], it.state);
      const locS = selectFromArr('', locations || [], it.location);
      dlg.appendChild(field('Description', descI));
      const r = el('div', { class: 'row' });
      r.appendChild(field('Serial', serI));
      r.appendChild(field('State', stateS));
      dlg.appendChild(r);
      dlg.appendChild(field('Location', locS));
      if (it.linkedRma) {
        dlg.appendChild(el('div', { class: 'help' }, 'Linked RMA: ' + it.linkedRma));
      }
      const btns = el('div', { class: 'btn-row' });
      btns.appendChild(el('button', { class: 'btn ghost', onclick: () => render(container) }, 'CLOSE'));
      btns.appendChild(el('button', {
        class: 'btn primary',
        onclick: async () => {
          it.description = descI.value.trim();
          it.serial = serI.value.trim();
          it.state = stateS.value;
          it.location = locS.value;
          await NTDB.saveRack(it);
          toast('Rack item updated');
          render(container);
        }
      }, 'SAVE'));
      dlg.appendChild(btns);
      const del = el('button', { class: 'btn danger full mt-8' }, 'REMOVE FROM RACK');
      del.addEventListener('click', async () => {
        if (!await NTUI.confirm('Remove this rack item?')) return;
        await NTDB.deleteRackItem(it.id);
        toast('Removed');
        render(container);
      });
      dlg.appendChild(del);
      container.insertBefore(dlg, list.nextSibling);
      dlg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setFilter('ALL');
  }

  function field(label, control) {
    const f = el('div', { class: 'field' });
    f.appendChild(el('label', {}, label));
    f.appendChild(control);
    return f;
  }
  function selectFromArr(id, list, value) {
    const s = el('select', { class: 'select', id });
    list.forEach(v => {
      const o = el('option', { value: v }, v);
      if (v === value) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }

  return { render };
})();
