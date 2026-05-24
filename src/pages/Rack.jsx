import { useEffect, useState } from 'react'
import { Box, Plus, Trash2 } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import SearchBar from '../components/ui/SearchBar'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'
import useRackStore from '../store/useRackStore'
import useSettingsStore from '../store/useSettingsStore'
import { newId, formatDate } from '../lib/helpers'

export default function Rack() {
  const { items, loading, fetchItems, saveItem, deleteItem } = useRackStore()
  const { getSetting, fetchSettings } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showAdd, setShowAdd] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteId, setDeleteId] = useState(null)


  const [newItem, setNewItem] = useState({ description: '', serial: '', state: 'AT_RACK', location: '' })

  useEffect(() => { fetchItems(); fetchSettings() }, [])

  const rackLocations = getSetting('rackLocations')

  const filtered = items.filter(i => {
    if (filter !== 'ALL' && i.state !== filter) return false
    if (!search) return true
    return [i.description, i.serial, i.location, i.linked_rma].join(' ').toLowerCase().includes(search.toLowerCase())
  })

  async function handleAdd() {
    if (!newItem.description.trim()) { showToast('Enter description', 'error'); return }
    try {
      await saveItem({ ...newItem, id: newId(), source: 'manual' })
      setNewItem({ description: '', serial: '', state: 'AT_RACK', location: '' })
      setShowAdd(false)
      showToast('Added to rack', 'success')
    } catch (err) {
      showToast('Failed: ' + err.message, 'error')
    }
  }

  async function handleEditSave() {
    try {
      await saveItem(editItem)
      setEditItem(null)
      showToast('Updated', 'success')
    } catch (err) {
      showToast('Failed', 'error')
    }
  }

  async function handleDeleteConfirm() {
    try {
      await deleteItem(deleteId)
      setDeleteId(null)
      showToast('Removed', 'success')
    } catch (err) {
      showToast('Failed', 'error')
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <SearchBar value={search} onChange={setSearch} placeholder="Search rack..." className="animate-fade-up" />

      {/* Filter tabs */}
      <div className="flex gap-2 animate-fade-up">
        {['ALL', 'IN_HAND', 'AT_RACK'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider font-medium border transition-all
              ${filter === f ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-white/40 text-text-muted border-white/60 hover:border-pink-100'}`}
          >
            {f === 'ALL' ? 'ALL' : f === 'IN_HAND' ? 'IN HAND' : 'AT RACK'}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="pink" size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> ADD
        </Button>
      </div>


      {/* Add new item form */}
      {showAdd && (
        <GlassCard className="p-5 space-y-3 animate-fade-up">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">ADD RACK ITEM</h3>
          <Input label="Description" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Corsair RM850 PSU" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Serial" value={newItem.serial} onChange={e => setNewItem(p => ({ ...p, serial: e.target.value }))} placeholder="Serial/tag" />
            <Select label="State" options={['AT_RACK', 'IN_HAND']} value={newItem.state} onChange={v => setNewItem(p => ({ ...p, state: v }))} />
          </div>
          <Select label="Location" options={rackLocations} value={newItem.location} onChange={v => setNewItem(p => ({ ...p, location: v }))} placeholder="Select location" />
          <Button variant="primary" full onClick={handleAdd}>ADD TO RACK</Button>
        </GlassCard>
      )}

      {/* Edit overlay */}
      {editItem && (
        <GlassCard className="p-5 space-y-3 animate-fade-up">
          <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">EDIT ITEM</h3>
          <Input label="Description" value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Serial" value={editItem.serial || ''} onChange={e => setEditItem(p => ({ ...p, serial: e.target.value }))} />
            <Select label="State" options={['AT_RACK', 'IN_HAND']} value={editItem.state} onChange={v => setEditItem(p => ({ ...p, state: v }))} />
          </div>
          <Select label="Location" options={rackLocations} value={editItem.location} onChange={v => setEditItem(p => ({ ...p, location: v }))} placeholder="Select" />
          {editItem.linked_rma && <p className="text-[11px] text-text-muted">Linked RMA: {editItem.linked_rma}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => setEditItem(null)}>CLOSE</Button>
            <Button variant="primary" onClick={handleEditSave}>SAVE</Button>
          </div>
          <Button variant="danger" full onClick={() => { setDeleteId(editItem.id); setEditItem(null) }}>
            <Trash2 size={14} /> REMOVE
          </Button>
        </GlassCard>
      )}

      {/* Items list */}
      {loading ? (
        <GlassCard className="p-6 animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2" /></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-10 text-center animate-fade-up">
          <div className="text-4xl opacity-30 mb-3">◬</div>
          <p className="text-[12px] tracking-wider text-text-muted">No items in this view</p>
        </GlassCard>
      ) : (
        <div className="space-y-2 stagger">
          {filtered.map(it => (
            <GlassCard key={it.id} hoverable className="p-4 animate-fade-up" onClick={() => setEditItem({ ...it })}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary truncate">{it.description || '—'}</div>
                  <div className="text-[11px] text-text-muted mt-0.5 truncate">
                    {[it.serial, it.location, it.linked_rma].filter(Boolean).join(' • ')}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-3">
                  <span className={`px-2 py-1 rounded-full text-[9px] tracking-wider font-medium border ${
                    it.state === 'IN_HAND' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-ice-100 text-ice-500 border-ice-200'
                  }`}>
                    {it.state === 'IN_HAND' ? 'IN HAND' : 'AT RACK'}
                  </span>
                  <span className="text-[10px] text-text-muted">{formatDate(it.updated_at)}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteConfirm} title="Remove Item" message="Remove this item from rack?" confirmText="Remove" danger />
    </div>
  )
}
