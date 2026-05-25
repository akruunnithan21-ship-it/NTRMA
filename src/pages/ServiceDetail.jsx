import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, ArrowLeft, Search, Camera, Plus, Printer } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'
import useSettingsStore from '../store/useSettingsStore'
import { vibrate } from '../lib/haptics'
import { printTicket } from '../lib/printTicket'
import * as db from '../lib/database'

const OS_OPTIONS = ['Windows', 'Linux', 'macOS', 'Dual Boot']
const SERVICE_TYPES = ['In-shop', 'AMC', 'RMA', 'Per Call']
const CALL_STATUSES = ['Open', 'Closed', 'Pending for Spare', 'Pending for RMA', 'Customer Dependency', 'Others']
const PRODUCT_TYPES = ['PC', 'GPU', 'RAM', 'SSD (NVMe)', 'SSD (SATA)', 'HDD', 'PSU', 'Cooler', 'Fans', 'Motherboard', 'CPU', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Cabinet', 'Laptop', 'Printer', 'UPS', 'Router', 'Other']

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSetting, fetchSettings } = useSettingsStore()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [customStatus, setCustomStatus] = useState('')

  useEffect(() => { fetchSettings(); loadTicket() }, [id])

  async function loadTicket() {
    setLoading(true)
    try {
      const ticket = await db.getServiceTicket(id)
      setForm(ticket)
      if (ticket.call_status === 'Others') setCustomStatus(ticket.custom_status || '')
    } catch (err) {
      showToast('Ticket not found', 'error')
      navigate('/service')
    } finally { setLoading(false) }
  }

  const engineers = getSetting('serviceEngineers') || ['Adhil', 'Amal', 'Ananthakrishnan', 'Athul']

  function update(key, value) { setForm(f => ({ ...f, [key]: value })) }

  function handleStatusChange(value) {
    update('call_status', value)
    if (value !== 'Others') { update('custom_status', ''); setCustomStatus('') }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const cleanedForm = { ...form }
      if (!cleanedForm.date_of_purchase) cleanedForm.date_of_purchase = null
      if (!cleanedForm.received_date) cleanedForm.received_date = null
      cleanedForm.custom_status = form.call_status === 'Others' ? customStatus : ''
      await db.saveServiceTicket(cleanedForm)
      vibrate('success')
      showToast('Ticket updated', 'success')
    } catch (err) {
      vibrate('error')
      showToast('Failed to save: ' + err.message, 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await db.deleteServiceTicket(id)
      vibrate('heavy')
      showToast('Ticket deleted', 'success')
      navigate('/service')
    } catch (err) { showToast('Failed to delete', 'error') }
  }

  function searchCabinet() {
    const q = encodeURIComponent(form.cabinet_details || 'PC cabinet case')
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener')
  }

  if (loading || !form) {
    return (<div className="space-y-4 pt-4"><GlassCard className="p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-4 bg-gray-100 rounded w-1/3" /></GlassCard></div>)
  }

  const invoiceEntered = (form.invoice_bill_no || '').trim().length > 0

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => navigate('/service')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 border border-black/10 hover:border-pink-200 transition-all">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold tracking-wider text-text-primary">SERVICE TICKET</h2>
          <span className="text-[12px] font-mono text-pink-500">{form.ticket_number}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wider font-medium border ${form.call_status === 'Closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : form.call_status === 'Open' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${form.call_status === 'Closed' ? 'bg-emerald-400' : form.call_status === 'Open' ? 'bg-amber-400' : 'bg-orange-400'}`} />
          {form.call_status === 'Others' && customStatus ? customStatus.toUpperCase() : (form.call_status || 'OPEN').toUpperCase()}
        </span>
      </div>

      {/* Customer Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Customer Info</h3>
        <Input label="Customer Name" value={form.customer_name || ''} onChange={e => update('customer_name', e.target.value)} placeholder="Full name" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" type="tel" value={form.phone || ''} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
          <Input label="Email" type="email" value={form.email || ''} onChange={e => update('email', e.target.value)} placeholder="email@..." />
        </div>
        <Input label="Company / Organisation" value={form.company_name || ''} onChange={e => update('company_name', e.target.value)} placeholder="For B2B customers" />
      </GlassCard>

      {/* Assignment */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Assignment</h3>
        <Select label="Assigned Service Engineer" options={engineers} value={form.assigned_engineer} onChange={v => {
          if (v !== form.assigned_engineer && form.assigned_engineer) {
            const history = form.assignment_history ? [...form.assignment_history] : []
            history.push({ from: form.assigned_engineer, to: v, changed_at: new Date().toISOString() })
            update('assignment_history', history)
          }
          update('assigned_engineer', v)
        }} placeholder="Select engineer" />
        {form.assignment_history && form.assignment_history.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] tracking-[2px] text-text-muted uppercase">Assignment History</p>
            {form.assignment_history.map((h, i) => (
              <div key={i} className="text-[11px] text-text-secondary">
                <span className="text-pink-500">{h.from}</span> → <span className="text-emerald-500">{h.to}</span>
                <span className="text-[9px] text-text-muted ml-2">{new Date(h.changed_at).toLocaleString('en-IN', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Purchase Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Purchase Info</h3>
        <Input label="Invoice Bill No." value={form.invoice_bill_no || ''} onChange={e => update('invoice_bill_no', e.target.value)} placeholder="If purchased from us" />
        <Input label="Date of Purchase" type="date" value={form.date_of_purchase || ''} onChange={e => update('date_of_purchase', e.target.value)} disabled={!invoiceEntered} className={!invoiceEntered ? 'opacity-40 pointer-events-none' : ''} />
        <Input label="Received Date" type="date" value={form.received_date || ''} onChange={e => update('received_date', e.target.value)} />
      </GlassCard>

      {/* Product Details */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Product Details</h3>
        <Select label="Type of Product" options={PRODUCT_TYPES} value={form.product_type} onChange={v => update('product_type', v)} placeholder="Select" />
        <Input label="Model" value={form.model || ''} onChange={e => update('model', e.target.value)} placeholder="Product model" />
        <Input label="Serial Number" value={form.serial_number || ''} onChange={e => update('serial_number', e.target.value)} placeholder="Serial / tag" />
        <TextArea label="System Configuration" value={form.system_config || ''} onChange={e => update('system_config', e.target.value)} placeholder="CPU, RAM, Storage, GPU..." />
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">OS</label>
          <div className="flex flex-wrap gap-2">
            {OS_OPTIONS.map(os => (
              <button key={os} type="button" onClick={() => update('os', os)} className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.os === os ? 'bg-pink-500 text-white border-pink-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}>{os}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Service Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Service Info</h3>
        <Select label="Service Type" options={SERVICE_TYPES} value={form.service_type} onChange={v => update('service_type', v)} placeholder="Select" />
        <div className="space-y-1.5">
          <TextArea label="Cabinet Details" value={form.cabinet_details || ''} onChange={e => update('cabinet_details', e.target.value)} placeholder="Cabinet model (optional)" />
          <button type="button" onClick={searchCabinet} className="inline-flex items-center gap-2 text-[11px] tracking-wider text-pink-500 font-medium hover:underline"><Search size={12} /> SEARCH ON WEB</button>
        </div>
        <TextArea label="Reported Issues / Service Expected" value={form.reported_issues || ''} onChange={e => update('reported_issues', e.target.value)} placeholder="Customer's reported problem" />
        <TextArea label="Actions Taken" value={form.actions_taken || ''} onChange={e => update('actions_taken', e.target.value)} placeholder="Steps taken (editable)" />
      </GlassCard>

      {/* Status & Items */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Status & Items</h3>
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">Call Status</label>
          <div className="flex flex-wrap gap-2">
            {CALL_STATUSES.map(s => (
              <button key={s} type="button" onClick={() => handleStatusChange(s)} className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.call_status === s ? 'bg-pink-500 text-white border-pink-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}>{s}</button>
            ))}
          </div>
          {form.call_status === 'Others' && (
            <Input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder="Enter custom status" className="mt-2" />
          )}
        </div>
        <TextArea label="Received Items" value={form.received_items || ''} onChange={e => update('received_items', e.target.value)} placeholder="Items received" />
        <TextArea label="Customer Comments / Remarks" value={form.customer_comments || ''} onChange={e => update('customer_comments', e.target.value)} placeholder="Notes, instructions" />
      </GlassCard>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'SAVING...' : 'UPDATE'}
        </Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          <Trash2 size={16} /> DELETE
        </Button>
      </div>

      <Button variant="ghost" className="w-full animate-fade-up" onClick={() => printTicket(form, 'SERVICE')}>
        <Printer size={16} /> PRINT TICKET
      </Button>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Service Ticket" message={`Delete ${form.ticket_number}? This cannot be undone.`} confirmText="Delete" danger />
    </div>
  )
}
