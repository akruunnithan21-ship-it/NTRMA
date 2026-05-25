import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, ArrowLeft, Camera, Box, Copy, Search } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import TextArea from '../components/ui/TextArea'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import StatusPill from '../components/ui/StatusPill'
import { ConfirmModal } from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'
import useTicketStore from '../store/useTicketStore'
import useSettingsStore from '../store/useSettingsStore'
import useRackStore from '../store/useRackStore'
import { newId, formatDateTime } from '../lib/helpers'
import { vibrate } from '../lib/haptics'
import * as db from '../lib/database'

export default function RmaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { saveTicket, deleteTicket } = useTicketStore()
  const { getSetting, fetchSettings } = useSettingsStore()
  const { saveItem: saveRackItem } = useRackStore()

  const [form, setForm] = useState(null)
  const [photos, setPhotos] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [customerSuggestions, setCustomerSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    fetchSettings()
    loadTicket()
    loadCustomerNames()
  }, [id])

  async function loadTicket() {
    setLoading(true)
    try {
      const ticket = await db.getTicket(id)
      setForm(ticket)
      const ticketPhotos = await db.getTicketPhotos(id)
      setPhotos(ticketPhotos)
      const history = await db.getStatusHistory(id)
      setStatusHistory(history)
    } catch (err) {
      showToast('Ticket not found', 'error')
      navigate('/rma')
    } finally {
      setLoading(false)
    }
  }

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

  async function handleStatusChange(newStatus) {
    const oldStatus = form.status
    update('status', newStatus)
    if (oldStatus !== newStatus) {
      try {
        await db.addStatusChange(id, oldStatus, newStatus)
        setStatusHistory(prev => [...prev, { from_status: oldStatus, to_status: newStatus, changed_at: new Date().toISOString() }])
      } catch (e) { /* ignore */ }
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveTicket(form)
      // If rack_location is set, automatically add/update in rack inventory
      if (form.rack_location) {
        await db.saveRackItem({
          description: `${form.component_type || ''} ${form.vendor || ''} ${form.component_description || ''}`.trim(),
          serial: form.serial_out || form.serial_in || '',
          state: 'AT_RACK',
          location: form.rack_location,
          linked_rma: form.rma_number || '',
          source: 'rma',
        })
      }
      vibrate('success')
      showToast('Ticket updated', 'success')
    } catch (err) {
      vibrate('error')
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteTicket(id)
      vibrate('heavy')
      showToast('Ticket deleted', 'success')
      navigate('/rma')
    } catch (err) {
      showToast('Failed to delete', 'error')
    }
  }

  async function handleDuplicate() {
    try {
      const duplicate = {
        ...form,
        id: newId(),
        rma_number: '',
        status: 'Pending',
        created_at: null,
        updated_at: null,
      }
      const saved = await saveTicket(duplicate)
      vibrate('success')
      showToast('Ticket duplicated', 'success')
      navigate(`/rma/${saved.id}`)
    } catch (err) {
      showToast('Failed to duplicate', 'error')
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const url = await db.uploadPhoto(file, id)
      const photo = { id: newId(), ticket_id: id, photo_url: url, caption: '', taken_at: new Date().toISOString(), uploaded_at: new Date().toISOString() }
      await db.saveTicketPhoto(photo)
      setPhotos(prev => [photo, ...prev])
      vibrate('success')
      showToast('Photo added', 'success')
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error')
    }
  }

  async function handleMoveToRack() {
    try {
      const rackItem = {
        description: `${form.component_type || ''} ${form.vendor || ''} ${form.component_description || ''}`.trim(),
        serial: form.serial_out || form.serial_in || '',
        state: 'AT_RACK',
        location: form.rack_location || 'Rack A',
        linked_rma: form.rma_number || '',
        source: 'rma',
      }
      await db.saveRackItem(rackItem)
      vibrate('success')
      showToast('Sent to rack', 'success')
      navigate('/rack')
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
    }
  }

  function handleCustomerInput(value) {
    update('customer_name', value)
    setShowSuggestions(value.length > 0)
  }

  const filteredSuggestions = customerSuggestions.filter(n =>
    n.toLowerCase().includes((form?.customer_name || '').toLowerCase()) && n !== form?.customer_name
  ).slice(0, 5)

  if (loading || !form) {
    return (
      <div className="space-y-4 pt-4">
        <GlassCard className="p-6 animate-pulse"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" /><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" /></GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Back + Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <button onClick={() => navigate('/rma')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700 hover:border-pink-200 transition-all">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold tracking-wider text-text-primary dark:text-white">TICKET</h2>
          <span className="text-[12px] font-mono text-pink-500">{form.rma_number || '— No RMA —'}</span>
        </div>
        <StatusPill status={form.status} />
      </div>

      {/* Form */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <Input label="RMA Number" value={form.rma_number || ''} onChange={e => update('rma_number', e.target.value)} placeholder="Enter vendor RMA number" help="Provided by the vendor after submission" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Submission Date" type="date" value={form.submission_date || ''} onChange={e => update('submission_date', e.target.value)} />
          <Input label="Delivery Date" type="date" value={form.delivery_date || ''} onChange={e => update('delivery_date', e.target.value)} />
        </div>
        
        {/* Customer with autocomplete */}
        <div className="relative">
          <Input label="Customer Name" value={form.customer_name || ''} onChange={e => handleCustomerInput(e.target.value)} onFocus={() => setShowSuggestions((form.customer_name || '').length > 0)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="Full name" />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-black/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] max-h-40 overflow-y-auto">
              <div className="p-1.5">
                {filteredSuggestions.map(name => (
                  <button key={name} type="button" onMouseDown={() => { update('customer_name', name); setShowSuggestions(false) }} className="w-full text-left px-3 py-2 rounded-xl text-sm text-text-primary dark:text-white hover:bg-pink-50 dark:hover:bg-pink-900/30 transition-colors">{name}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Component Type" options={componentTypes} value={form.component_type} onChange={v => update('component_type', v)} placeholder="Select" />
          <Select label="Vendor / Brand" options={vendors} value={form.vendor} onChange={v => update('vendor', v)} placeholder="Select" />
        </div>
        <TextArea label="Component Description" value={form.component_description || ''} onChange={e => update('component_description', e.target.value)} placeholder="Brand, model, size..." />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Serial IN" value={form.serial_in || ''} onChange={e => update('serial_in', e.target.value)} placeholder="Received" />
          <Input label="Serial OUT" value={form.serial_out || ''} onChange={e => update('serial_out', e.target.value)} placeholder="Replacement" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Submitted To" options={submitTo} value={form.submitted_to} onChange={v => update('submitted_to', v)} placeholder="Select" />
          <Select label="Status" options={statuses} value={form.status} onChange={v => handleStatusChange(v)} />
        </div>
        <Select label="Rack / Location" options={rackLocations} value={form.rack_location} onChange={v => update('rack_location', v)} placeholder="Not in stock" />
        <TextArea label="Defect" value={form.defect || ''} onChange={e => update('defect', e.target.value)} placeholder="Describe the defect" />
        <TextArea label="Remarks" value={form.remarks || ''} onChange={e => update('remarks', e.target.value)} placeholder="Internal notes..." />
      </GlassCard>

      {/* Status Timeline */}
      {statusHistory.length > 0 && (
        <GlassCard className="p-5 animate-fade-up">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary dark:text-gray-400 uppercase mb-4">Status Timeline</h3>
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gradient-to-b from-pink-300 to-pink-100 dark:from-pink-700 dark:to-pink-900 rounded-full" />
            {statusHistory.map((h, i) => (
              <div key={i} className="relative mb-4 last:mb-0">
                <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-pink-400 border-2 border-white dark:border-gray-800 shadow-[0_0_8px_rgba(231,1,70,0.3)]" />
                <div className="text-[12px] font-medium text-text-primary dark:text-white">
                  {h.from_status ? `${h.from_status} → ${h.to_status}` : `Created as ${h.to_status}`}
                </div>
                <div className="text-[10px] font-mono text-text-muted mt-0.5">{formatDateTime(h.changed_at)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Photos section */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary dark:text-gray-400 uppercase">Photos</h3>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-pink-50 text-pink-500 text-[11px] tracking-wider font-medium border border-pink-200 hover:bg-pink-100 transition-colors dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300">
              <Camera size={14} /> ADD PHOTO
            </span>
          </label>
        </div>
        {photos.length === 0 ? (
          <p className="text-[11px] text-text-muted text-center py-4">No photos attached</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(p => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-white/60 dark:border-gray-700">
                <img src={p.photo_url} alt={p.caption || 'Photo'} className="w-full h-32 object-cover" />
                <div className="p-2 bg-white/40 dark:bg-gray-800/40">
                  <p className="text-[10px] font-mono text-text-muted">
                    {new Date(p.taken_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'SAVING...' : 'UPDATE'}
        </Button>
        <Button variant="ghost" onClick={handleDuplicate}>
          <Copy size={16} /> DUPLICATE
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 animate-fade-up">
        {['Picked up', 'Closed', 'Pending install/delivery'].includes(form.status) && (
          <Button variant="ghost" onClick={handleMoveToRack}>
            <Box size={16} /> TO RACK
          </Button>
        )}
      </div>

      <Button variant="danger" full onClick={() => setShowDelete(true)} className="animate-fade-up">
        <Trash2 size={16} /> DELETE TICKET
      </Button>

      <ConfirmModal open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Delete Ticket" message={`Permanently delete ${form.rma_number || 'this ticket'}? This cannot be undone.`} confirmText="Delete" danger />
    </div>
  )
}
