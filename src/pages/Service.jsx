import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, MapPin, Monitor, ArrowUpDown, Filter } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import SearchBar from '../components/ui/SearchBar'
import { formatDate } from '../lib/helpers'
import * as db from '../lib/database'

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'name_asc', label: 'Name A-Z' },
  { key: 'name_desc', label: 'Name Z-A' },
  { key: 'engineer', label: 'Engineer' },
]

const TYPE_FILTERS = [
  { key: 'all', label: 'All Types' },
  { key: 'service', label: 'Service' },
  { key: 'onsite', label: 'Onsite' },
  { key: 'remote', label: 'Remote' },
]

export default function Service() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState([])
  const [onsiteTickets, setOnsiteTickets] = useState([])
  const [remoteTickets, setRemoteTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [typeFilter, setTypeFilter] = useState('all')
  const statusFromUrl = searchParams.get('status')

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const [svc, onsite, remote] = await Promise.all([
        db.getServiceTickets(),
        db.getOnsiteTickets(),
        db.getRemoteTickets(),
      ])
      setTickets(svc)
      setOnsiteTickets(onsite)
      setRemoteTickets(remote)
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  // Combine all tickets into a unified list with _type tag
  const allTickets = useMemo(() => {
    const svc = tickets.map(t => ({ ...t, _type: 'service', _name: t.customer_name, _status: t.call_status || 'Open', _engineer: t.assigned_engineer, _date: t.created_at }))
    const on = onsiteTickets.map(t => ({ ...t, _type: 'onsite', _name: t.customer_name, _status: t.status || 'Open', _engineer: t.technician, _date: t.created_at }))
    const rm = remoteTickets.map(t => ({ ...t, _type: 'remote', _name: t.customer_name, _status: t.status || 'Open', _engineer: t.technician, _date: t.created_at }))
    return [...svc, ...on, ...rm]
  }, [tickets, onsiteTickets, remoteTickets])

  // Filter
  const filtered = useMemo(() => {
    let list = allTickets

    // Type filter
    if (typeFilter !== 'all') list = list.filter(t => t._type === typeFilter)

    // Status from URL
    if (statusFromUrl) {
      if (statusFromUrl === 'Pending') list = list.filter(t => !['Open', 'Closed'].includes(t._status))
      else list = list.filter(t => t._status === statusFromUrl)
    }

    // Search
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => {
        const hay = [t.ticket_number, t._name, t.phone, t._engineer, t.complaint, t.reported_issues, t.model, t.location].join(' ').toLowerCase()
        return hay.includes(q)
      })
    }

    // Sort
    list = [...list]
    switch (sortBy) {
      case 'oldest': list.sort((a, b) => (a._date || '').localeCompare(b._date || '')); break
      case 'name_asc': list.sort((a, b) => (a._name || '').localeCompare(b._name || '')); break
      case 'name_desc': list.sort((a, b) => (b._name || '').localeCompare(a._name || '')); break
      case 'engineer': list.sort((a, b) => (a._engineer || '').localeCompare(b._engineer || '')); break
      default: list.sort((a, b) => (b._date || '').localeCompare(a._date || ''))
    }

    return list
  }, [allTickets, typeFilter, statusFromUrl, search, sortBy])

  function getTicketRoute(t) {
    if (t._type === 'service') return `/service/${t.id}`
    if (t._type === 'onsite') return `/onsite/${t.id}`
    return `/remote/${t.id}`
  }

  function getTypeBadge(type) {
    if (type === 'service') return { bg: 'bg-pink-50 border-pink-200 text-pink-600', dot: 'bg-pink-400', label: 'SERVICE' }
    if (type === 'onsite') return { bg: 'bg-orange-50 border-orange-200 text-orange-600', dot: 'bg-orange-400', label: 'ONSITE' }
    return { bg: 'bg-violet-50 border-violet-200 text-violet-600', dot: 'bg-violet-400', label: 'REMOTE' }
  }

  function getStatusBadge(status) {
    if (status === 'Closed') return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-600', dot: 'bg-emerald-400' }
    if (status === 'Open') return { bg: 'bg-amber-50 border-amber-200 text-amber-600', dot: 'bg-amber-400' }
    return { bg: 'bg-orange-50 border-orange-200 text-orange-600', dot: 'bg-orange-400' }
  }

  return (
    <div className="pt-4">
      {/* Desktop: 2-column layout */}
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-6">

        {/* LEFT PANEL — Create options (sticky on desktop) */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-3 mb-5 lg:mb-0">
          <GlassCard className="p-5 animate-fade-up">
            <h2 className="text-base font-bold tracking-wider text-pink-500 font-[family-name:var(--font-heading)]">SERVICE</h2>
            <p className="text-[11px] text-text-muted mt-1">Create and manage tickets</p>
          </GlassCard>

          <GlassCard hoverable className="p-4 animate-fade-up" onClick={() => navigate('/service/new')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center"><Plus size={18} className="text-pink-500" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-semibold text-text-primary tracking-wider">SERVICE TICKET</h3>
                <p className="text-[10px] text-text-muted">In-shop diagnostics</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="p-4 animate-fade-up" onClick={() => navigate('/onsite/new')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center"><MapPin size={18} className="text-orange-500" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-semibold text-text-primary tracking-wider">ONSITE TICKET</h3>
                <p className="text-[10px] text-text-muted">On-location service</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hoverable className="p-4 animate-fade-up" onClick={() => navigate('/remote/new')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center"><Monitor size={18} className="text-violet-500" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-semibold text-text-primary tracking-wider">REMOTE SESSION</h3>
                <p className="text-[10px] text-text-muted">Remote desktop support</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT PANEL — Ticket list with search, sort, filter */}
        <div className="space-y-3 animate-fade-up min-w-0">
          {/* Search + controls */}
          <SearchBar value={search} onChange={setSearch} placeholder="Search all tickets..." />

          {/* Sort & Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type filter pills */}
            <div className="flex items-center gap-1.5 mr-2">
              <Filter size={13} className="text-text-muted" />
              {TYPE_FILTERS.map(f => (
                <button key={f.key} onClick={() => setTypeFilter(f.key)}
                  className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider font-medium border transition-all ${typeFilter === f.key ? 'bg-pink-500 text-white border-pink-500' : 'bg-white/80 text-text-secondary border-black/10 hover:border-pink-200'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5 ml-auto">
              <ArrowUpDown size={13} className="text-text-muted" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="text-[10px] tracking-wider font-medium text-text-secondary bg-white/80 border border-black/10 rounded-full px-3 py-1.5 outline-none focus:border-pink-200 cursor-pointer appearance-none">
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-text-muted tracking-wider">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Ticket list */}
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <GlassCard key={i} className="p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-1/2 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></GlassCard>)}
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-[12px] tracking-wider text-text-muted">No tickets found</p>
              <p className="text-[10px] text-text-muted mt-1">Try adjusting your filters or search</p>
            </GlassCard>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-220px)] lg:max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {filtered.map(t => {
                const typeBadge = getTypeBadge(t._type)
                const statusBadge = getStatusBadge(t._status)
                const borderColor = t._type === 'service' ? 'border-l-pink-400' : t._type === 'onsite' ? 'border-l-orange-400' : 'border-l-violet-400'

                return (
                  <GlassCard key={`${t._type}-${t.id}`} hoverable className={`p-4 border-l-[3px] ${borderColor}`} onClick={() => navigate(getTicketRoute(t))}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-text-primary truncate">{t._name || '—'}</div>
                        <div className="text-[11px] text-text-muted mt-0.5 truncate">
                          {t._type === 'service'
                            ? [t.product_type, t.model, t._engineer].filter(Boolean).join(' • ')
                            : [t._engineer, t.location].filter(Boolean).join(' • ')
                          }
                        </div>
                        {(t.complaint || t.reported_issues) && <div className="text-[11px] text-text-secondary mt-1 line-clamp-1">{t.complaint || t.reported_issues}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-pink-500 font-medium">{t.ticket_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-wider font-medium border ${typeBadge.bg}`}>
                          <span className={`w-1 h-1 rounded-full ${typeBadge.dot}`} />{typeBadge.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-wider font-medium border ${statusBadge.bg}`}>
                          <span className={`w-1 h-1 rounded-full ${statusBadge.dot}`} />{t._status}
                        </span>
                        <span className="text-[9px] text-text-muted">{formatDate(t._date)}</span>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
