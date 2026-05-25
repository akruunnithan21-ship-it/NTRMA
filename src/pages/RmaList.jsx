import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, ArrowUpDown, RefreshCw } from 'lucide-react'
import SearchBar from '../components/ui/SearchBar'
import GlassCard from '../components/ui/GlassCard'
import StatusPill from '../components/ui/StatusPill'
import Button from '../components/ui/Button'
import useTicketStore from '../store/useTicketStore'
import useSettingsStore from '../store/useSettingsStore'
import { formatDate } from '../lib/helpers'
import { vibrate } from '../lib/haptics'
import * as db from '../lib/database'
import { showToast } from '../components/ui/Toast'

export default function RmaList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { tickets, loading, fetchTickets, saveTicket } = useTicketStore()
  const { getSetting } = useSettingsStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All')
  const [sortBy, setSortBy] = useState('newest')
  const [showSort, setShowSort] = useState(false)
  const [quickStatusTicket, setQuickStatusTicket] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const longPressTimer = useRef(null)

  useEffect(() => { fetchTickets() }, [])

  const statuses = ['All', ...(getSetting('statuses') || [])]
  const allStatuses = getSetting('statuses') || []

  // Pull to refresh
  async function handleRefresh() {
    setRefreshing(true)
    vibrate('light')
    await fetchTickets()
    setRefreshing(false)
    showToast('Refreshed', 'success')
  }

  // Sorting
  function sortTickets(list) {
    switch (sortBy) {
      case 'newest': return [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      case 'oldest': return [...list].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
      case 'name_az': return [...list].sort((a, b) => (a.customer_name || '').localeCompare(b.customer_name || ''))
      case 'name_za': return [...list].sort((a, b) => (b.customer_name || '').localeCompare(a.customer_name || ''))
      case 'status': return [...list].sort((a, b) => (a.status || '').localeCompare(b.status || ''))
      default: return list
    }
  }

  const filtered = sortTickets(tickets.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    if (!search) return true
    const hay = [t.rma_number, t.customer_name, t.serial_in, t.serial_out, t.vendor, t.component_type, t.component_description, t.defect, t.remarks]
      .join(' ').toLowerCase()
    return hay.includes(search.toLowerCase())
  }))

  // Long press for quick status
  function handleTouchStart(ticket, e) {
    longPressTimer.current = setTimeout(() => {
      vibrate('medium')
      setQuickStatusTicket(ticket)
    }, 500)
  }
  function handleTouchEnd() {
    clearTimeout(longPressTimer.current)
  }

  async function handleQuickStatus(newStatus) {
    if (!quickStatusTicket) return
    const oldStatus = quickStatusTicket.status
    try {
      await saveTicket({ ...quickStatusTicket, status: newStatus })
      await db.addStatusChange(quickStatusTicket.id, oldStatus, newStatus)
      vibrate('success')
      showToast(`Status → ${newStatus}`, 'success')
    } catch (err) {
      showToast('Failed', 'error')
    }
    setQuickStatusTicket(null)
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Search */}
      <SearchBar value={search} onChange={setSearch} placeholder="Search tickets..." className="animate-fade-up" />

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide animate-fade-up">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-full text-[11px] tracking-wider font-medium transition-all duration-200 border
              ${statusFilter === s 
                ? 'bg-pink-500 text-white border-pink-500 shadow-[0_4px_16px_rgba(231,1,70,0.3)]' 
                : 'bg-white/80 text-text-primary border-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-pink-200 hover:text-pink-500'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Ticket count + sort + refresh */}
      <div className="flex items-center justify-between px-1 animate-fade-up">
        <span className="text-[11px] tracking-[2px] text-text-muted">
          {filtered.length} TICKET{filtered.length !== 1 ? 'S' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700 hover:border-pink-200 transition-all ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw size={14} className="text-text-muted" />
          </button>
          <div className="relative">
            <button onClick={() => setShowSort(!showSort)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700 hover:border-pink-200 transition-all">
              <ArrowUpDown size={14} className="text-text-muted" />
            </button>
            {showSort && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/80 dark:border-gray-700 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] min-w-[160px] animate-fade-up">
                <div className="p-2 space-y-0.5">
                  {[
                    { key: 'newest', label: 'Newest first' },
                    { key: 'oldest', label: 'Oldest first' },
                    { key: 'name_az', label: 'Name A→Z' },
                    { key: 'name_za', label: 'Name Z→A' },
                    { key: 'status', label: 'By Status' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSort(false) }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors ${sortBy === opt.key ? 'bg-pink-50 text-pink-500 dark:bg-pink-900/30 dark:text-pink-300 font-medium' : 'text-text-primary dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/5'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="pink" size="sm" onClick={() => navigate('/rma/new')}>
            <Plus size={14} /> NEW
          </Button>
        </div>
      </div>

      {/* Quick status popup */}
      {quickStatusTicket && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4" onClick={() => setQuickStatusTicket(null)}>
          <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm glass-card-static p-5 animate-slide-up mb-20" onClick={e => e.stopPropagation()}>
            <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary dark:text-gray-400 uppercase mb-3">
              QUICK STATUS — {quickStatusTicket.customer_name}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allStatuses.map(s => (
                <button key={s} onClick={() => handleQuickStatus(s)}
                  className={`px-3 py-2.5 rounded-2xl text-[11px] tracking-wider font-medium border transition-all
                    ${s === quickStatusTicket.status
                      ? 'bg-pink-50 text-pink-500 border-pink-200 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-300'
                      : 'bg-white/50 text-text-secondary border-white/60 hover:border-pink-200 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <GlassCard key={i} className="p-5 animate-pulse"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" /></GlassCard>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-10 text-center animate-fade-up">
          <div className="text-4xl opacity-30 mb-3">∅</div>
          <p className="text-[12px] tracking-wider text-text-muted">No tickets found</p>
        </GlassCard>
      ) : (
        <div className="space-y-3 stagger">
          {filtered.map(t => (
            <GlassCard key={t.id} hoverable className="p-4 animate-fade-up"
              onClick={() => navigate(`/rma/${t.id}`)}
              onTouchStart={(e) => handleTouchStart(t, e)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onContextMenu={(e) => { e.preventDefault(); vibrate('medium'); setQuickStatusTicket(t) }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary dark:text-white truncate">{t.customer_name || '— No name —'}</div>
                  <div className="text-[11px] text-text-muted mt-1 truncate">{[t.component_type, t.vendor, t.component_description].filter(Boolean).join(' • ')}</div>
                  {t.defect && <div className="text-[11px] text-text-secondary dark:text-gray-400 mt-1.5 line-clamp-1">{t.defect}</div>}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-pink-500 font-medium">{t.rma_number || '—'}</span>
                  <StatusPill status={t.status} />
                  <span className="text-[10px] text-text-muted">{formatDate(t.submission_date || t.created_at)}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Hint */}
      <p className="text-[10px] text-center text-text-muted tracking-wider pb-4">
        Long-press a ticket to quickly change status
      </p>
    </div>
  )
}
