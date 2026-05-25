import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Search, Camera, Plus } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import useSettingsStore from '../store/useSettingsStore'
import useTicketStore from '../store/useTicketStore'
import { todayISO, newId } from '../lib/helpers'
import { vibrate } from '../lib/haptics'
import * as db from '../lib/database'

const OS_OPTIONS = ['Windows', 'Linux', 'macOS', 'Dual Boot']
const SERVICE_TYPES = ['In-shop', 'AMC', 'RMA', 'Per Call']
const CALL_STATUSES = ['Open', 'Closed', 'Pending for Spare', 'Pending for RMA', 'Customer Dependency', 'Others']
const PRODUCT_TYPES = ['PC', 'GPU', 'RAM', 'SSD (NVMe)', 'SSD (SATA)', 'HDD', 'PSU', 'Cooler', 'Fans', 'Motherboard', 'CPU', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Cabinet', 'Laptop', 'Printer', 'UPS', 'Router', 'Other']

export default function ServiceNew() {
  const navigate = useNavigate()
  const { getSetting, fetchSettings, addItem } = useSettingsStore()
  const { saveTicket: saveRmaTicket } = useTicketStore()
  const [saving, setSaving] = useState(false)
  const [showCustomEngineer, setShowCustomEngineer] = useState(false)
  const [customEngineer, setCustomEngineer] = useState('')
  const [customStatus, setCustomStatus] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    customer_type: 'new',
    phone: '',
    email: '',
    assigned_engineer: '',
    invoice_bill_no: '',
    date_of_purchase: '',
    received_date: todayISO(),
    company_name: '',
    product_type: '',
    model: '',
    serial_number: '',
    system_config: '',
    os: '',
    service_type: '',
    cabinet_details: '',
    reported_issues: '',
    actions_taken: '',
    call_status: 'Open',
    custom_status: '',
    received_items: '',
    customer_comments: '',
  })

  useEffect(() => { fetchSettings() }, [])

  const engineers = getSetting('serviceEngineers') || ['Adhil', 'Amal', 'Ananthakrishnan', 'Athul']

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleEngineerChange(value) {
    if (value === '__add_custom__') {
      setShowCustomEngineer(true)
    } else {
      update('assigned_engineer', value)
    }
  }

  async function handleAddCustomEngineer() {
    if (!customEngineer.trim()) return
    await addItem('serviceEngineers', customEngineer.trim())
    update('assigned_engineer', customEngineer.trim())
    setCustomEngineer('')
    setShowCustomEngineer(false)
    showToast('Engineer added', 'success')
  }

  function handleStatusChange(value) {
    update('call_status', value)
    if (value !== 'Others') {
      update('custom_status', '')
      setCustomStatus('')
    }
  }

  function generateTicketNumber() {
    const yr = new Date().getFullYear().toString().slice(-2)
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `NT-SVC-${yr}-${rand}`
  }

  async function handleSave() {
    if (!form.customer_name.trim()) {
      showToast('Please enter customer name', 'error')
      vibrate('error')
      return
    }
    setSaving(true)
    try {
      const ticketNumber = generateTicketNumber()
      // Convert empty date strings to null for Supabase
      const cleanedForm = { ...form }
      if (!cleanedForm.date_of_purchase) cleanedForm.date_of_purchase = null
      if (!cleanedForm.received_date) cleanedForm.received_date = null
      const serviceTicket = {
        ...cleanedForm,
        id: newId(),
        ticket_number: ticketNumber,
        custom_status: form.call_status === 'Others' ? customStatus : '',
      }
      await db.saveServiceTicket(serviceTicket)

      // If service type is RMA, auto-create an RMA ticket
      if (form.service_type === 'RMA') {
        const rmaTicket = {
          id: newId(),
          rma_number: '',
          customer_name: form.customer_name,
          submission_date: todayISO(),
          component_type: form.product_type,
          vendor: '',
          component_description: `${form.model || ''} ${form.system_config || ''}`.trim(),
          serial_in: form.serial_number,
          serial_out: '',
          submitted_to: '',
          status: 'Pending',
          defect: form.reported_issues,
          remarks: `Linked Service Ticket: ${ticketNumber}`,
        }
        await saveRmaTicket(rmaTicket)
        showToast('Service + RMA ticket created', 'success')
      } else {
        showToast('Service ticket created', 'success')
      }

      vibrate('success')
      navigate('/service')
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
      vibrate('error')
    } finally {
      setSaving(false)
    }
  }

  function searchCabinet() {
    const q = encodeURIComponent(form.cabinet_details || 'PC cabinet case')
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener')
  }

  const invoiceEntered = form.invoice_bill_no.trim().length > 0

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wider text-pink-500 font-[family-name:var(--font-heading)]">NEW SERVICE TICKET</h2>
            <span className="text-[11px] text-text-muted mt-1 block">Fill in service details below</span>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] tracking-wider font-medium border ${
            form.call_status === 'Closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
            form.call_status === 'Open' ? 'bg-amber-50 border-amber-200 text-amber-600' :
            form.call_status === 'Pending for Spare' || form.call_status === 'Pending for RMA' ? 'bg-orange-50 border-orange-200 text-orange-600' :
            form.call_status === 'Customer Dependency' ? 'bg-violet-50 border-violet-200 text-violet-600' :
            'bg-gray-50 border-gray-200 text-gray-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              form.call_status === 'Closed' ? 'bg-emerald-400' :
              form.call_status === 'Open' ? 'bg-amber-400' :
              form.call_status === 'Pending for Spare' || form.call_status === 'Pending for RMA' ? 'bg-orange-400' :
              form.call_status === 'Customer Dependency' ? 'bg-violet-400' :
              'bg-gray-400'
            }`} />
            {form.call_status === 'Others' && customStatus ? customStatus.toUpperCase() : form.call_status.toUpperCase()}
          </span>
        </div>
      </GlassCard>

      {/* Customer Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Customer Info</h3>
        <Input label="Customer Name" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} placeholder="Full name" />
        <div className="flex gap-3">
          <button type="button" onClick={() => update('customer_type', 'existing')}
            className={`flex-1 px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.customer_type === 'existing' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}>
            Existing Customer
          </button>
          <button type="button" onClick={() => update('customer_type', 'new')}
            className={`flex-1 px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all ${form.customer_type === 'new' ? 'bg-pink-500 text-white border-pink-500' : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}>
            New Customer
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91..." />
          <Input label="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@..." />
        </div>
        <Input label="Company / Organisation" value={form.company_name} onChange={e => update('company_name', e.target.value)} placeholder="For B2B customers" />
      </GlassCard>

      {/* Assignment */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Assignment</h3>
        <Select
          label="Assigned Service Engineer"
          options={[...engineers, { value: '__add_custom__', label: '+ Add Service Engineer' }]}
          value={form.assigned_engineer}
          onChange={handleEngineerChange}
          placeholder="Select engineer"
        />
        {showCustomEngineer && (
          <div className="flex gap-2">
            <Input value={customEngineer} onChange={e => setCustomEngineer(e.target.value)} placeholder="Enter engineer name" className="flex-1" />
            <Button variant="pink" size="sm" onClick={handleAddCustomEngineer}><Plus size={14} /></Button>
          </div>
        )}
      </GlassCard>

      {/* Purchase Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Purchase Info</h3>
        <Input label="Invoice Bill No." value={form.invoice_bill_no} onChange={e => update('invoice_bill_no', e.target.value)} placeholder="If purchased from us, else leave empty" help="Leave empty if not applicable" />
        <Input
          label="Date of Purchase"
          type="date"
          value={form.date_of_purchase}
          onChange={e => update('date_of_purchase', e.target.value)}
          disabled={!invoiceEntered}
          className={!invoiceEntered ? 'opacity-40 pointer-events-none' : ''}
        />
        <Input label="Received Date" type="date" value={form.received_date} onChange={e => update('received_date', e.target.value)} />
      </GlassCard>

      {/* Product Details */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Product Details</h3>
        <Select label="Type of Product" options={PRODUCT_TYPES} value={form.product_type} onChange={v => update('product_type', v)} placeholder="Select product type" />
        <Input label="Model" value={form.model} onChange={e => update('model', e.target.value)} placeholder="Product model name" />
        <Input label="Serial Number" value={form.serial_number} onChange={e => update('serial_number', e.target.value)} placeholder="Serial / tag number" />
        <TextArea label="System Configuration" value={form.system_config} onChange={e => update('system_config', e.target.value)} placeholder="CPU, RAM, Storage, GPU, etc." />

        {/* OS - Radio buttons */}
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">OS</label>
          <div className="flex flex-wrap gap-2">
            {OS_OPTIONS.map(os => (
              <button
                key={os}
                type="button"
                onClick={() => update('os', os)}
                className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all
                  ${form.os === os
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}
              >
                {os}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Service Info */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Service Info</h3>
        <Select label="Service Type" options={SERVICE_TYPES} value={form.service_type} onChange={v => update('service_type', v)} placeholder="Select service type" />
        {form.service_type === 'RMA' && (
          <p className="text-[10px] text-pink-500 bg-pink-50 border border-pink-200 rounded-xl px-3 py-2">
            An RMA ticket will be auto-created and linked to this service ticket.
          </p>
        )}

        <div className="space-y-1.5">
          <TextArea label="Cabinet Details" value={form.cabinet_details} onChange={e => update('cabinet_details', e.target.value)} placeholder="Cabinet model, brand (optional)" />
          <button type="button" onClick={searchCabinet} className="inline-flex items-center gap-2 text-[11px] tracking-wider text-pink-500 font-medium hover:underline">
            <Search size={12} /> SEARCH CABINET ON WEB
          </button>
        </div>

        <TextArea label="Reported Issues / Service Expected" value={form.reported_issues} onChange={e => update('reported_issues', e.target.value)} placeholder="Customer's reported problem / expected service" />
        <TextArea label="Actions Taken" value={form.actions_taken} onChange={e => update('actions_taken', e.target.value)} placeholder="Steps taken (can be edited later)" />
      </GlassCard>

      {/* Status & Items */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Status & Items</h3>

        {/* Call Status - Radio */}
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">Call Status</label>
          <div className="flex flex-wrap gap-2">
            {CALL_STATUSES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-2 rounded-full text-[11px] tracking-wider font-medium border transition-all
                  ${form.call_status === s
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white/80 text-text-primary border-black/10 hover:border-pink-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
          {form.call_status === 'Others' && (
            <Input value={customStatus} onChange={e => setCustomStatus(e.target.value)} placeholder="Enter custom status" className="mt-2" />
          )}
        </div>

        <TextArea label="Received Items" value={form.received_items} onChange={e => update('received_items', e.target.value)} placeholder="Items received from customer" />

        {/* Photo upload for condition */}
        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[2px] font-medium text-text-secondary uppercase">Condition Photos</label>
          <label className="cursor-pointer block">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={() => showToast('Photo upload available after ticket creation', 'info')} />
            <span className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/40 border border-black/10 text-[12px] tracking-wider text-pink-500 font-medium hover:bg-white/60 transition-all w-full justify-center">
              <Camera size={16} /> ADD CONDITION PHOTO
            </span>
          </label>
          <p className="text-[10px] text-text-muted">Document the condition of the received product</p>
        </div>

        <TextArea label="Customer Comments / Remarks" value={form.customer_comments} onChange={e => update('customer_comments', e.target.value)} placeholder="Advice, notes, special instructions" />
      </GlassCard>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="ghost" onClick={() => navigate('/service')}>
          <X size={16} /> CANCEL
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'CREATING...' : 'CREATE TICKET'}
        </Button>
      </div>
    </div>
  )
}
