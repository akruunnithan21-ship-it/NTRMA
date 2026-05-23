/* =========================================================
   Excel export — single mother sheet
   Uses SheetJS (xlsx) loaded from CDN in index.html
   ========================================================= */
window.NTExcel = (function () {

  const HEADERS = [
    'RMA Number',
    'Customer Name',
    'Submission Date',
    'Delivery Date',
    'Component Type',
    'Vendor / Brand',
    'Component Description',
    'Serial Number IN',
    'Serial Number OUT',
    'RMA Submitted To',
    'Defect',
    'Status',
    'Rack / Location',
    'Remarks',
    'Created At',
    'Updated At'
  ];

  function fmt(d) {
    if (!d) return '';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d;
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toISOString().slice(0, 10);
  }
  function fmtDT(ms) {
    if (!ms) return '';
    return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
  }

  function ticketRow(t) {
    return [
      t.rmaNumber || '',
      t.customerName || '',
      fmt(t.submissionDate),
      fmt(t.deliveryDate),
      t.componentType || '',
      t.vendor || '',
      t.componentDescription || '',
      t.serialIn || '',
      t.serialOut || '',
      t.submittedTo || '',
      t.defect || '',
      t.status || '',
      t.rackLocation || '',
      t.remarks || '',
      fmtDT(t.createdAt),
      fmtDT(t.updatedAt)
    ];
  }

  async function exportToXLSX(tickets) {
    if (!window.XLSX) {
      alert('Excel library not loaded. Please check your internet connection and try again.');
      return;
    }
    const data = [HEADERS, ...tickets.map(ticketRow)];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Column widths
    ws['!cols'] = [
      { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 38 }, { wch: 22 }, { wch: 22 }, { wch: 16 }, { wch: 30 }, { wch: 22 },
      { wch: 16 }, { wch: 30 }, { wch: 20 }, { wch: 20 }
    ];
    // Freeze header row
    ws['!freeze'] = { ySplit: 1 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NeoTokyo_RMA');

    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    XLSX.writeFile(wb, `NeoTokyo_RMA_${ts}.xlsx`);
  }

  async function exportBackupJSON(payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url; a.download = `NeoTokyo_RMA_backup_${ts}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
  }

  return { exportToXLSX, exportBackupJSON, HEADERS };
})();
