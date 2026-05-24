import GlassCard from '../components/ui/GlassCard'

export default function Warranty() {
  return (
    <div className="space-y-6 pt-4">
      <GlassCard className="p-8 text-center animate-fade-up">
        <img
          src="/assets/logo.svg"
          alt="Neo Tokyo"
          className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(231,1,70,0.4)]"
        />
        <h2 className="text-xl font-bold tracking-wider text-text-primary mb-2">WARRANTY CHECK</h2>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
          Look up active warranties by serial number across vendors. Customer-facing in a future build.
        </p>
        <span className="inline-block mt-4 px-4 py-1.5 rounded-full border border-pink-200 text-[10px] tracking-[3px] text-pink-500 font-medium bg-pink-50">
          COMING SOON
        </span>
      </GlassCard>

      <GlassCard className="p-5 animate-fade-up">
        <h3 className="text-[11px] tracking-[3px] font-semibold text-text-secondary uppercase mb-3">PLANNED FEATURES</h3>
        <ul className="space-y-2 text-[12px] text-text-secondary leading-relaxed">
          <li className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">•</span> Serial to vendor warranty lookup</li>
          <li className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">•</span> Coverage period & terms</li>
          <li className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">•</span> Linked RMA history</li>
          <li className="flex items-start gap-2"><span className="text-pink-400 mt-0.5">•</span> Customer self-service portal</li>
        </ul>
      </GlassCard>
    </div>
  )
}
