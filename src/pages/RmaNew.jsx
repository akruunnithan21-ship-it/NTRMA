import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Search } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { showToast } from '../components/ui/Toast'
import useTicketStore from '../store/useTicketStore'
import useSettingsStore from '../store/useSettingsStore'
import { todayISO, newId } from '../lib/helpers'
import { vibrate } from '../lib/haptics'
import * as db from '../lib/database'

export default function RmaNew() {
  const navigate = useNavigate()
  const { saveTicket, fetchTickets } = useTicketStore()
  const { getSetting, fetchSettings } = useSettingsStore()
  const [saving, setSaving] = useState(false)
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [form, setForm] = useState({
    rma_number: '',
    customer_name: '',
    submission_date: todayISO(),
    delivery_date: '',
    component_type: '',
    vendor: '',
    component_description: '',
    serial_in: '',
    serial_out: '',
    submitted_to: '',
    status: 'Pending',
    rack_location: '',
    defect: '',
    remarks: '',
  })

  useEffect(() => {
    fetchSettings()
    fetchTickets()
    loadCustomerNames()
  }, [])

  async function loadCustomerNames() {
    try {
      const names = await db.getUniqueCustomerNames()
      setCustomerSuggestions(names)
    } catch (e) { /* ignore */ }
  }

  const vendors = getSetting('vendors')
  const submitTo = getSetting('submitTo')
  const componentTypes = getSetting('componentTypes')
  const statuses = getSetting('statuses')
  const rackLocations = getSetting('rackLocations')

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleCustomerInput(value) {
    update('customer_name', value)
    setShowSuggestions(value.length > 0)
  }

  function selectCustomer(name) {
    update('customer_name', name)
    setShowSuggestions(false)
  }

  const filteredSuggestions = customerSuggestions.filter(n =>
    n.toLowerCase().includes(form.customer_name.toLowerCase()) && n !== form.customer_name
  ).slice(0, 5)

  async function handleSave() {
    if (!form.customer_name.trim()) {
      showToast('Please enter customer name', 'error')
      vibrate('error')
      return
    }
    setSaving(true)
    try {
      const cleanedForm = { ...form }
      if (!cleanedForm.submission_date) cleanedForm.submission_date = null
      if (!cleanedForm.delivery_date) cleanedForm.delivery_date = null
      const ticket = { ...cleanedForm, id: newId() }
      const saved = await saveTicket(ticket)
      // Log initial status
      await db.addStatusChange(saved.id, null, 'Pending')
      vibrate('success')
      showToast('Ticket created', 'success')
      navigate(`/rma/${saved.id}`)
    } catch (err) {
      showToast('Failed to save: ' + err.message, 'error')
      vibrate('error')
    } finally {
      setSaving(false)
    }
  }

  function searchComponent() {
    const q = encodeURIComponent(form.component_description || `${form.vendor} ${form.component_type}`)
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener')
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Header card */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wider text-pink-500 font-[family-name:var(--font-heading)]">NEW ENTRY</h2>
            <span className="text-[11px] text-text-muted mt-1 block">
              Fill in ticket details below
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] tracking-wider text-amber-600 font-medium dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            PENDING
          </span>
        </div>
      </GlassCard>

      {/* Form */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        {/* RMA Number — manual input */}
        <Input
          label="RMA Number"
          value={form.rma_number}
          onChange={e => update('rma_number', e.target.value)}
          placeholder="Enter vendor RMA number"
          help="Provided by the vendor after submission"
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Submission Date" type="date" value={form.submission_date} onChange={e => update('submission_date', e.target.value)} />
          <Input label="Delivery Date" type="date" value={form.delivery_date} onChange={e => update('delivery_date', e.target.value)} />
        </div>

        {/* Customer with autocomplete */}
        <div className="relative">
          <Input
            label="Customer Name"
            value={form.customer_name}
            onChange={e => handleCustomerInput(e.target.value)}
            onFocus={() => setShowSuggestions(form.customer_name.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Full name"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-black/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] max-h-40 overflow-y-auto">
              <div className="p-1.5">
                {filteredSuggestions.map(name => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={() => selectCustomer(name)}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-primary dark:text-white hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Component + Vendor */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Component Type" options={componentTypes} value={form.component_type} onChange={v => update('component_type', v)} placeholder="Select type" />
          <Select label="Vendor / Brand" options={vendors} value={form.vendor} onChange={v => update('vendor', v)} placeholder="Select vendor" />
        </div>

        {/* Description with search */}
        <div className="space-y-1.5">
          <TextArea label="Component Description" value={form.component_description} onChange={e => update('component_description', e.target.value)} placeholder="Brand, model, size, speed, etc." help="Type model/name, then tap search to look up specs." />
          <button type="button" onClick={searchComponent} className="inline-flex items-center gap-2 text-[11px] tracking-wider text-pink-500 font-medium hover:underline">
            <Search size={12} /> SEARCH ON WEB
          </button>
        </div>

        {/* Serials */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Serial Number IN" value={form.serial_in} onChange={e => update('serial_in', e.target.value)} placeholder="Item received" />
          <Input label="Serial Number OUT" value={form.serial_out} onChange={e => update('serial_out', e.target.value)} placeholder="Replacement" />
        </div>

        {/* Submitted to + Status */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="RMA Submitted To" options={submitTo} value={form.submitted_to} onChange={v => update('submitted_to', v)} placeholder="Select partner" />
          <Select label="Status" options={statuses} value={form.status} onChange={v => update('status', v)} placeholder="Select" />
        </div>

        {/* Rack */}
        <Select label="Rack / Location" options={rackLocations} value={form.rack_location} onChange={v => update('rack_location', v)} placeholder="Not in stock" />

        {/* Defect */}
        <TextArea label="Defect" value={form.defect} onChange={e => update('defect', e.target.value)} placeholder="Describe the defect / customer complaint" />

        {/* Remarks */}
        <TextArea label="Remarks" value={form.remarks} onChange={e => update('remarks', e.target.value)} placeholder="Internal remarks, follow-up notes..." />
      </GlassCard>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="ghost" onClick={() => navigate('/rma')}>
          <X size={16} /> CANCEL
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'SAVING...' : 'SAVE ENTRY'}
        </Button>
      </div>
    </div>
  )
}
