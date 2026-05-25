import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import useSettingsStore from '../store/useSettingsStore'
import { newId } from '../lib/helpers'
import { vibrate } from '../lib/haptics'
import * as db from '../lib/database'

const STATUSES = ['Open', 'Closed', 'Pending', 'Requires In-Store Service', 'Requires RMA']

function nowDateTimeLocal() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${mi}`
}

function generateTicketNumber() {
  const yr = new Date().getFullYear().toString().slice(-2)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `NT-ON-${yr}-${rand}`
}

export default function OnsiteNew() {
  const navigate = useNavigate()
  const { getSetting, fetchSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    date_time: nowDateTimeLocal(),
    complaint: '',
    location: '',
    technician: '',
    status: 'Open',
    remarks: '',
  })

  useEffect(() => { fetchSettings() }, [])

  const engineers = getSetting('serviceEngineers') || ['Adhil', 'Amal', 'Ananthakrishnan', 'Athul']

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.customer_name.trim()) {
      showToast('Please enter customer name', 'error')
      vibrate('error')
      return
    }
    setSaving(true)
    try {
      const ticket = {
        ...form,
        id: newId(),
        ticket_number: generateTicketNumber(),
        date_time: form.date_time ? new Date(form.date_time).toISOString() : null,
      }
      await db.saveOnsiteTicket(ticket)
      vibrate('success')
      showToast('Onsite ticket created', 'success')
      navigate('/service')
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
      vibrate('error')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4 pt-4">
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wider text-orange-500 font-[family-name:var(--font-heading)]">NEW ONSITE TICKET</h2>
            <span className="text-[11px] text-text-muted mt-1 block">On-location customer service</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wider font-medium border bg-orange-50 border-orange-200 text-orange-600">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />ONSITE
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Customer Info</h3>
        <Input label="Customer Name" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} placeholder="Full name" />
        <Input label="Phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
      </GlassCard>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Visit Details</h3>
        <Input label="Date & Time" type="datetime-local" value={form.date_time} onChange={e => update('date_time', e.target.value)} />
        <Input label="Location" value={form.location} onChange={e => update('location', e.target.value)} placeholder="Customer address / location" />
        <TextArea label="Customer Complaint / Issues" value={form.complaint} onChange={e => update('complaint', e.target.value)} placeholder="Describe the issue or complaint" />
      </GlassCard>

      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Assignment</h3>
        <Select label="Assign Technician" options={engineers} value={form.technician} onChange={v => update('technician', v)} placeholder="Select technician" />
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => update('status', s)}
                className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.status === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-orange-200'}`}>{s}</button>
            ))}
          </div>
        </div>
        <TextArea label="Remarks" value={form.remarks} onChange={e => update('remarks', e.target.value)} placeholder="Internal notes" />
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="ghost" onClick={() => navigate('/service')}><X size={16} /> CANCEL</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'CREATING...' : 'CREATE TICKET'}</Button>
      </div>
    </div>
  )
}
