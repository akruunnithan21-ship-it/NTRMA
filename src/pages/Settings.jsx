import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X, Download, Upload, Trash2, Info, Moon, Sun } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/Modal'
import { showToast } from '../components/ui/Toast'
import useSettingsStore from '../store/useSettingsStore'
import useTicketStore from '../store/useTicketStore'
import useRackStore from '../store/useRackStore'
import useThemeStore from '../store/useThemeStore'
import { vibrate } from '../lib/haptics'

export default function Settings() {
  const { settings, fetchSettings, addItem, removeItem } = useSettingsStore()
  const { tickets, fetchTickets } = useTicketStore()
  const { items: rackItems, fetchItems } = useRackStore()
  const { dark, toggleDark } = useThemeStore()
  const [showWipe, setShowWipe] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})

  useEffect(() => { fetchSettings(); fetchTickets(); fetchItems() }, [])


  function toggleSection(key) {
    setExpandedSections(p => ({ ...p, [key]: !p[key] }))
  }

  async function handleExport() {
    try {
      if (!window.XLSX) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
        document.head.appendChild(script)
        await new Promise(r => { script.onload = r })
      }
      const headers = ['RMA Number','Customer','Submission Date','Delivery Date','Component Type','Vendor','Description','Serial IN','Serial OUT','Submitted To','Defect','Status','Rack Location','Remarks']
      const rows = tickets.map(t => [t.rma_number,t.customer_name,t.submission_date,t.delivery_date,t.component_type,t.vendor,t.component_description,t.serial_in,t.serial_out,t.submitted_to,t.defect,t.status,t.rack_location,t.remarks])
      const ws = window.XLSX.utils.aoa_to_sheet([headers, ...rows])
      const wb = window.XLSX.utils.book_new()
      window.XLSX.utils.book_append_sheet(wb, ws, 'NeoTokyo_RMA')
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      window.XLSX.writeFile(wb, `NeoTokyo_RMA_${ts}.xlsx`)
      showToast('Exported', 'success')
    } catch (err) {
      showToast('Export failed', 'error')
    }
  }

  async function handleBackup() {
    const payload = { app: 'NeoTokyoRMA', version: 2, exportedAt: new Date().toISOString(), tickets, rack: rackItems, settings }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `NeoTokyo_backup_${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a); a.click()
    setTimeout(() => { URL.revokeObjectURL(url); a.remove() }, 200)
    showToast('Backup downloaded', 'success')
  }

  async function handleRestore(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const txt = await file.text()
      const data = JSON.parse(txt)
      if (!data.app || data.app !== 'NeoTokyoRMA') throw new Error('Invalid backup')
      showToast('Restore not yet connected to cloud — coming soon', 'info')
    } catch (err) {
      showToast('Invalid backup file', 'error')
    }
    e.target.value = ''
  }

  const listCards = [
    { key: 'vendors', title: 'VENDORS / BRANDS', icon: '◇' },
    { key: 'submitTo', title: 'RMA SUBMITTED TO', icon: '✦' },
    { key: 'componentTypes', title: 'COMPONENT TYPES', icon: '◈' },
    { key: 'rackLocations', title: 'RACK LOCATIONS', icon: '▤' },
  ]

  return (
    <div className="space-y-4 pt-4 stagger">
      {/* Dark mode toggle */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 flex items-center justify-center text-pink-500 dark:text-pink-300 text-sm">
              {dark ? <Moon size={14} /> : <Sun size={14} />}
            </span>
            <div>
              <span className="text-[12px] tracking-[2px] font-semibold text-[#1D1D1F]">APPEARANCE</span>
              <p className="text-[10px] text-text-muted mt-0.5">{dark ? 'Dark mode' : 'Light mode'}</p>
            </div>
          </div>
          <button
            onClick={() => { toggleDark(); vibrate('light') }}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 flex-shrink-0 ${dark ? 'bg-pink-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${dark ? 'left-7' : 'left-0.5'}`} />
          </button>
        </div>
      </GlassCard>

      {/* List cards */}
      {listCards.map(card => (
        <SettingListCard
          key={card.key}
          settingKey={card.key}
          title={card.title}
          icon={card.icon}
          items={settings[card.key] || []}
          expanded={expandedSections[card.key]}
          onToggle={() => toggleSection(card.key)}
          onAdd={addItem}
          onRemove={removeItem}
        />
      ))}


      {/* Export & Backup section */}
      <GlassCard className="p-5 animate-fade-up">
        <button onClick={() => toggleSection('export')} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 text-sm">⤓</span>
            <span className="text-[12px] tracking-[2px] font-semibold text-text-primary">EXPORT & BACKUP</span>
          </div>
          {expandedSections.export ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
        </button>
        {expandedSections.export && (
          <div className="mt-4 space-y-3">
            <p className="text-[11px] text-text-muted">Export tickets to Excel or create a JSON backup.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={handleExport}><Download size={14} /> EXCEL</Button>
              <Button variant="ghost" onClick={handleBackup}><Download size={14} /> BACKUP</Button>
            </div>
            <label className="block">
              <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] tracking-wider font-medium bg-white/40 border border-white/60 text-text-secondary hover:border-pink-200 cursor-pointer transition-all w-full justify-center">
                <Upload size={14} /> RESTORE FROM BACKUP
              </span>
            </label>
          </div>
        )}
      </GlassCard>

      {/* App info */}
      <GlassCard className="p-5 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-xl bg-ice-100 border border-ice-200 flex items-center justify-center text-ice-500 text-sm"><Info size={14} /></span>
          <span className="text-[12px] tracking-[2px] font-semibold text-text-primary">APP INFO</span>
        </div>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Neo Tokyo Service / RMA Tracker v2.0. Built with React + Supabase. All data synced to cloud. Installable as PWA.
        </p>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard className="p-5 border-pink-200 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-300 flex items-center justify-center text-pink-500 text-sm">⚠</span>
          <span className="text-[12px] tracking-[2px] font-semibold text-pink-500">DANGER ZONE</span>
        </div>
        <p className="text-[11px] text-text-muted mb-3">Permanently wipe all data. Make sure you have a backup.</p>
        <Button variant="danger" full onClick={() => setShowWipe(true)}>
          <Trash2 size={14} /> WIPE ALL DATA
        </Button>
      </GlassCard>

      <ConfirmModal open={showWipe} onClose={() => setShowWipe(false)} onConfirm={() => { showToast('Wipe requires direct DB access', 'info'); setShowWipe(false) }} title="Wipe All Data" message="This will delete everything. Are you sure?" confirmText="WIPE" danger />
    </div>
  )
}


function SettingListCard({ settingKey, title, icon, items, expanded, onToggle, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  async function handleAdd() {
    const v = input.trim()
    if (!v) return
    await onAdd(settingKey, v)
    setInput('')
    showToast('Added', 'success')
  }

  return (
    <GlassCard className="p-5 animate-fade-up">
      <button onClick={onToggle} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-500 text-sm">{icon}</span>
          <span className="text-[12px] tracking-[2px] font-semibold text-text-primary">{title}</span>
          <span className="text-[10px] text-text-muted bg-white/60 px-2 py-0.5 rounded-full border border-white/80">{items.length}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {expanded && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {items.map(v => (
              <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 border border-white/70 text-[11px] tracking-wider text-text-secondary">
                {v}
                <button onClick={() => onRemove(settingKey, v)} className="text-text-muted hover:text-pink-500 transition-colors">
                  <X size={12} />
                </button>
              </span>
            ))}
            {items.length === 0 && <p className="text-[11px] text-text-muted">No items yet</p>}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              placeholder={`Add ${title.toLowerCase()}...`}
              className="flex-1 px-3 py-2 rounded-xl bg-white/40 border border-white/60 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-pink-200 transition-all"
            />
            <Button variant="pink" size="sm" onClick={handleAdd}><Plus size={14} /></Button>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
