/**
 * Print a service/onsite/remote ticket in a new window
 * with terms & conditions and signature space.
 */
export function printTicket(ticket, typeLabel) {
  let dateStr = ''
  if (ticket.date_time || ticket.received_date) {
    try {
      const d = new Date(ticket.date_time || ticket.received_date)
      dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    } catch (e) { dateStr = ticket.date_time || '' }
  }

  const badgeColors = {
    SERVICE: { bg: '#0288d1', label: 'SERVICE TICKET' },
    ONSITE: { bg: '#f57c00', label: 'ONSITE TICKET' },
    REMOTE: { bg: '#7b1fa2', label: 'REMOTE SESSION' },
  }
  const badge = badgeColors[typeLabel] || badgeColors.SERVICE

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Ticket ${ticket.ticket_number || ''}</title>
<style>
body{font-family:"Segoe UI",Arial,sans-serif;margin:0;padding:24px 32px;color:#111;font-size:13px;line-height:1.5;}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #E70146;padding-bottom:12px;margin-bottom:18px;}
.header h1{font-size:20px;margin:0;letter-spacing:2px;color:#E70146;}
.header .ticket-no{font-family:monospace;font-size:14px;color:#333;}
.type-badge{display:inline-block;padding:4px 14px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fff;margin-bottom:14px;background:${badge.bg};}
table{width:100%;border-collapse:collapse;margin-bottom:20px;}
table td{padding:8px 12px;border:1px solid #ddd;vertical-align:top;}
table td:first-child{font-weight:600;width:160px;background:#f9f9f9;text-transform:uppercase;font-size:11px;letter-spacing:1px;color:#555;}
.complaint-box{background:#f5f5f5;border:1px solid #ddd;padding:12px;border-radius:4px;min-height:60px;margin-bottom:20px;white-space:pre-wrap;}
.signatures{display:flex;justify-content:space-between;margin-top:44px;padding-top:10px;}
.sig-block{width:44%;text-align:center;}
.sig-line{border-top:1px solid #333;margin-top:64px;padding-top:6px;font-size:11px;color:#555;}
.terms{margin-top:32px;padding:14px 16px;border:1px solid #ddd;border-radius:4px;background:#fafafa;font-size:10px;color:#666;line-height:1.7;}
.terms h4{margin:0 0 8px;font-size:11px;color:#333;text-transform:uppercase;letter-spacing:1px;}
.footer{margin-top:22px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:10px;}
@media print{body{padding:12px 20px;}}
</style></head><body>`

  // Header
  html += `<div class="header"><h1>NEO TOKYO</h1><div class="ticket-no">${ticket.ticket_number || '—'}</div></div>`
  html += `<div class="type-badge">${badge.label}</div>`

  // Details table
  html += '<table>'
  html += `<tr><td>Customer Name</td><td>${ticket.customer_name || '—'}</td></tr>`
  html += `<tr><td>Phone</td><td>${ticket.phone || '—'}</td></tr>`
  html += `<tr><td>Date & Time</td><td>${dateStr || '—'}</td></tr>`
  if (ticket.location) html += `<tr><td>Location</td><td>${ticket.location}</td></tr>`
  if (ticket.technician || ticket.assigned_engineer) html += `<tr><td>Technician</td><td>${ticket.technician || ticket.assigned_engineer || 'Unassigned'}</td></tr>`
  html += `<tr><td>Status</td><td>${ticket.status || ticket.call_status || 'Open'}</td></tr>`
  if (ticket.product_type) html += `<tr><td>Product Type</td><td>${ticket.product_type}</td></tr>`
  if (ticket.model) html += `<tr><td>Model</td><td>${ticket.model}</td></tr>`
  if (ticket.serial_number) html += `<tr><td>Serial Number</td><td>${ticket.serial_number}</td></tr>`
  if (ticket.remarks || ticket.customer_comments) html += `<tr><td>Remarks</td><td>${ticket.remarks || ticket.customer_comments}</td></tr>`
  html += '</table>'

  // Complaint box
  const complaint = ticket.complaint || ticket.reported_issues || ''
  html += '<div style="font-weight:600;font-size:11px;letter-spacing:1px;color:#555;margin-bottom:6px;">CUSTOMER COMPLAINT / ISSUES</div>'
  html += `<div class="complaint-box">${complaint || '—'}</div>`

  // Terms & Conditions
  html += `<div class="terms">
<h4>Terms & Conditions</h4>
1. All repairs and services are subject to diagnosis. Final charges may vary based on actual work performed.<br>
2. Neo Tokyo is not responsible for any data loss during service. Customers are advised to backup all data before handing over devices.<br>
3. Devices left uncollected for more than 30 days after service completion will be subject to storage charges.<br>
4. Warranty on repairs is limited to 7 days from the date of delivery unless otherwise stated.<br>
5. Any physical damage found during service that was not reported at intake is not covered under this service agreement.<br>
6. Payment is due upon completion of service unless prior arrangements have been made.<br>
7. By signing below, the customer acknowledges and agrees to these terms and conditions.
</div>`

  // Signatures
  html += `<div class="signatures">
<div class="sig-block"><div class="sig-line">Customer Signature</div></div>
<div class="sig-block"><div class="sig-line">Authorized by Neo Tokyo</div></div>
</div>`

  // Footer
  html += `<div class="footer">Neo Tokyo &middot; Service & RMA &middot; Kochi | Generated: ${new Date().toLocaleString('en-IN')}</div>`
  html += '</body></html>'

  const printWin = window.open('', '_blank', 'width=800,height=900')
  if (printWin) {
    printWin.document.write(html)
    printWin.document.close()
    setTimeout(() => { printWin.print() }, 400)
  }
}
