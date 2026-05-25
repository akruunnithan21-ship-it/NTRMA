import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Monitor } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import SearchBar from '../components/ui/SearchBar'
import { showToast } from '../components/ui/Toast'
import { formatDate } from '../lib/helpers'
import * as db from '../lib/database'

export default function Service() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadTickets() }, [])

  async function loadTickets() {
    setLoading(true)
    try {
      const data = await db.getServiceTickets()
      setTickets(data)
    } catch (err) { /* ignore */ }
    finally { setLoading(false) }
  }

  const filtered = tickets.filter(t => {
    if (!search) return true
    const hay = [t.ticket_number, t.customer_name, t.phone, t.model, t.serial_number, t.assigned_engineer, t.reported_issues]
      .join(' ').toLowerCase()
    return hay.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-5 pt-4">
      <GlassCard className="p-5 animate-fade-up">
        <h2 className="text-base font-bold tracking-wider text-pink-500 font-[family-name:var(--font-heading)]">SERVICE</h2>
        <p className="text-[11px] text-text-muted mt-1">Create and manage service tickets</p>
      </GlassCard>

      <div className="space-y-3 animate-fade-up">
        <GlassCard hoverable className="p-5" onClick={() => navigate('/service/new')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center"><Plus size={22} className="text-pink-500" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">NEW SERVICE TICKET</h3>
              <p className="text-[11px] text-text-muted mt-0.5">In-shop diagnostics & repairs</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard hoverable className="p-5" onClick={() => showToast('Onsite tickets coming soon', 'info')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ice-100 border border-ice-200 flex items-center justify-center"><MapPin size={22} className="text-ice-500" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">ONSITE TICKET</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Customer location service</p>
            </div>
            <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-ice-100 text-ice-500 border border-ice-200 font-medium">SOON</span>
          </div>
        </GlassCard>
        <GlassCard hoverable className="p-5" onClick={() => showToast('Remote sessions coming soon', 'info')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center"><Monitor size={22} className="text-violet-500" /></div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary tracking-wider">REMOTE SESSION</h3>
              <p className="text-[11px] text-text-muted mt-0.5">Remote desktop support</p>
            </div>
            <span className="text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200 font-medium">SOON</span>
          </div>
        </GlassCard>
      </div>

      {!loading && tickets.length > 0 && (
        <>
          <SearchBar value={search} onChange={setSearch} placeholder="Search service tickets..." className="animate-fade-up" />
          <div className="flex items-center justify-between px-1 animate-fade-up">
            <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase">Service Tickets</h3>
            <span className="text-[10px] text-text-muted">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2 animate-fade-up">
            {filtered.map(t => (
              <GlassCard key={t.id} hoverable className="p-4" onClick={() => navigate(`/service/${t.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">{t.customer_name || '—'}</div>
                    <div className="text-[11px] text-text-muted mt-0.5 truncate">{[t.product_type, t.model, t.assigned_engineer].filter(Boolean).join(' • ')}</div>
                    {t.phone && <div className="text-[10px] text-pink-400 mt-0.5">{t.phone}</div>}
                    {t.phone && <div className="text-[10px] text-pink-400 mt-0.5">{t.phone}</div>}
                    {t.reported_issues && <div className="text-[11px] text-text-secondary mt-1 line-clamp-1">{t.reported_issues}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-pink-500 font-medium">{t.ticket_number}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] tracking-wider font-medium border ${t.call_status === 'Closed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : t.call_status === 'Open' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                      <span className={`w-1 h-1 rounded-full ${t.call_status === 'Closed' ? 'bg-emerald-400' : t.call_status === 'Open' ? 'bg-amber-400' : 'bg-orange-400'}`} />
                      {t.call_status || 'Open'}
                    </span>
                    <span className="text-[9px] text-text-muted">{formatDate(t.received_date || t.created_at)}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
