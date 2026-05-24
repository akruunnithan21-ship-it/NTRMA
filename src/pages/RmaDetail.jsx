import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Trash2, ArrowLeft, Camera, Box } from 'lucide-react'
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
import { newId } from '../lib/helpers'
import * as db from '../lib/database'

export default function RmaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { saveTicket, deleteTicket } = useTicketStore()
  const { getSetting, fetchSettings } = useSettingsStore()
  const { saveItem: saveRackItem } = useRackStore()


  const [form, setForm] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    fetchSettings()
    loadTicket()
  }, [id])

  async function loadTicket() {
    setLoading(true)
    try {
      const ticket = await db.getTicket(id)
      setForm(ticket)
      const ticketPhotos = await db.getTicketPhotos(id)
      setPhotos(ticketPhotos)
    } catch (err) {
      showToast('Ticket not found', 'error')
      navigate('/rma')
    } finally {
      setLoading(false)
    }
  }

  const vendors = getSetting('vendors')
  const submitTo = getSetting('submitTo')
  const componentTypes = getSetting('componentTypes')
  const statuses = getSetting('statuses')
  const rackLocations = getSetting('rackLocations')

  function update(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveTicket(form)
      showToast('Ticket updated', 'success')
    } catch (err) {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }


  async function handleDelete() {
    try {
      await deleteTicket(id)
      showToast('Ticket deleted', 'success')
      navigate('/rma')
    } catch (err) {
      showToast('Failed to delete', 'error')
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const url = await db.uploadPhoto(file, id)
      const photo = {
        id: newId(),
        ticket_id: id,
        photo_url: url,
        caption: '',
        taken_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
      }
      await db.saveTicketPhoto(photo)
      setPhotos(prev => [photo, ...prev])
      showToast('Photo added', 'success')
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error')
    }
  }

  async function handleMoveToRack() {
    try {
      await saveRackItem({
        id: newId(),
        description: `${form.component_type || ''} ${form.vendor || ''} ${form.component_description || ''}`.trim(),
        serial: form.serial_out || form.serial_in || '',
        state: 'AT_RACK',
        location: form.rack_location || 'Rack A',
        linked_rma: form.rma_number,
        source: 'rma',
      })
      showToast('Sent to rack', 'success')
      navigate('/rack')
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
    }
  }

  if (loading || !form) {
    return (
      <div className="space-y-4 pt-4">
        <GlassCard className="p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </GlassCard>
      </div>
    )
  }


  return (
    <div className="space-y-4 pt-4">
      {/* Back + Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <button
          onClick={() => navigate('/rma')}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 border border-white/60 hover:border-pink-200 transition-all"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex-1">
          <h2 className="text-base font-bold tracking-wider text-text-primary">TICKET</h2>
          <span className="text-[12px] font-mono text-pink-500">{form.rma_number}</span>
        </div>
        <StatusPill status={form.status} />
      </div>

      {/* Form */}
      <GlassCard className="p-5 space-y-4 animate-fade-up">
        <Input
          label="RMA Number"
          value={form.rma_number || ''}
          onChange={e => update('rma_number', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Submission Date" type="date" value={form.submission_date || ''} onChange={e => update('submission_date', e.target.value)} />
          <Input label="Delivery Date" type="date" value={form.delivery_date || ''} onChange={e => update('delivery_date', e.target.value)} />
        </div>
        <Input label="Customer Name" value={form.customer_name || ''} onChange={e => update('customer_name', e.target.value)} placeholder="Full name" />
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
          <Select label="Status" options={statuses} value={form.status} onChange={v => update('status', v)} />
        </div>
        <Select label="Rack / Location" options={rackLocations} value={form.rack_location} onChange={v => update('rack_location', v)} placeholder="Not in stock" />
        <TextArea label="Defect" value={form.defect || ''} onChange={e => update('defect', e.target.value)} placeholder="Describe the defect" />
        <TextArea label="Remarks" value={form.remarks || ''} onChange={e => update('remarks', e.target.value)} placeholder="Internal notes..." />
      </GlassCard>


      {/* Photos section */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Photos</h3>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-pink-50 text-pink-500 text-[11px] tracking-wider font-medium border border-pink-200 hover:bg-pink-100 transition-colors">
              <Camera size={14} /> ADD PHOTO
            </span>
          </label>
        </div>
        {photos.length === 0 ? (
          <p className="text-[11px] text-text-muted text-center py-4">No photos attached</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(p => (
              <div key={p.id} className="rounded-2xl overflow-hidden border border-white/60">
                <img src={p.photo_url} alt={p.caption || 'Photo'} className="w-full h-32 object-cover" />
                <div className="p-2 bg-white/40">
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
        <Button variant="ghost" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'SAVING...' : 'UPDATE'}
        </Button>
        {['Picked up', 'Closed', 'Pending install/delivery'].includes(form.status) && (
          <Button variant="ghost" onClick={handleMoveToRack}>
            <Box size={16} /> TO RACK
          </Button>
        )}
      </div>

      <Button variant="danger" full onClick={() => setShowDelete(true)} className="animate-fade-up">
        <Trash2 size={16} /> DELETE TICKET
      </Button>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Ticket"
        message={`Permanently delete ${form.rma_number}? This cannot be undone.`}
        confirmText="Delete"
        danger
      />
    </div>
  )
}
