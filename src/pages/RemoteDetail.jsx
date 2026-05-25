import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, ArrowLeft, Printer } from 'lucide-react'
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

const STATUSES = ['Open', 'Closed', 'Pending', 'Requires In-Store Service', 'Requires RMA']

export default function RemoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSetting, fetchSettings } = useSettingsStore()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => { fetchSettings(); loadTicket() }, [id])

  async function loadTicket() {
    setLoading(true)
    try {
      const ticket = await db.getRemoteTicket(id)
      if (ticket.date_time) {
        const d = new Date(ticket.date_time)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const h = String(d.getHours()).padStart(2, '0')
        const mi = String(d.getMinutes()).padStart(2, '0')
        ticket.date_time = `${y}-${m}-${day}T${h}:${mi}`
      }
      setForm(ticket)
    } catch (err) {
      showToast('Ticket not found', 'error')
      navigate('/service')
    } finally { setLoading(false) }
  }

  const engineers = getSetting('serviceEngineers') || ['Adhil', 'Amal', 'Ananthakrishnan', 'Athul']

  function update(key, value) { setForm(f => ({ ...f, [key]: value })) }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form }
      if (payload.date_time) payload.date_time = new Date(payload.date_time).toISOString()
      await db.saveRemoteTicket(payload)
      vibrate('success')
      showToast('Ticket updated', 'success')
    } catch (err) {
      vibrate('error')
      showToast('Failed: ' + err.message, 'error')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await db.deleteRemoteTicket(id)
      vibrate('heavy')
      showToast('Ticket deleted', 'success')
      navigate('/service')
    } catch (err) { showToast('Failed to delete', 'error') }
  }

  if (loading || !form) {
    return (<div className="space-y-4 pt-4"><GlassCard className="p-6 animate-pulse"><div className="h-5 bg-gray-200 rounded w-1/2 mb-3" /><div className="h-4 bg-gray-100 rounded w-1/3" /></GlassCard></div>)
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => navigate('/service')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 border border-black/10 hover:border-violet-200 transition-all">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold tracking-wider text-text-primary">REMOTE SESSION</h2>
          <span className="text-[12px] font-mono text-violet-500">{form.ticket_number}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wider font-medium border bg-violet-50 border-violet-200 text-violet-600">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />REMOTE
        </span>
      </div>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Customer Info</h3>
        <Input label="Customer Name" value={form.customer_name || ''} onChange={e => update('customer_name', e.target.value)} placeholder="Full name" />
        <Input label="Phone" type="tel" value={form.phone || ''} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
      </GlassCard>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Session Details</h3>
        <Input label="Date & Time" type="datetime-local" value={form.date_time || ''} onChange={e => update('date_time', e.target.value)} />
        <Input label="Location (optional)" value={form.location || ''} onChange={e => update('location', e.target.value)} placeholder="Remote location / address" />
        <TextArea label="Customer Complaint / Issues" value={form.complaint || ''} onChange={e => update('complaint', e.target.value)} placeholder="Describe the issue" />
      </GlassCard>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Assignment</h3>
        <Select label="Assign Technician" options={engineers} value={form.technician} onChange={v => update('technician', v)} placeholder="Select technician" />
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => update('status', s)}
                className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.status === s ? 'bg-violet-500 text-white border-violet-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-violet-200'}`}>{s}</button>
            ))}
          </div>
        </div>
        <TextArea label="Remarks" value={form.remarks || ''} onChange={e => update('remarks', e.target.value)} placeholder="Internal notes" />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'SAVING...' : 'UPDATE'}</Button>
        <Button variant="danger" onClick={() => setShowDelete(true)}><Trash2 size={16} /> DELETE</Button>
      </div>

      <Button variant="ghost" className="w-full animate-fade-up" onClick={() => printTicket(form, 'REMOTE')}>
        <Printer size={16} /> PRINT TICKET
      </Button>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Remote Ticket" message={`Delete ${form.ticket_number}? This cannot be undone.`} confirmText="Delete" danger />
    </div>
  )
}
