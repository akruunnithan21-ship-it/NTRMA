import { useState, useEffect } from 'react'

export default function Splash({ onFinish }) {
  const [phase, setPhase] = useState('visible') // visible → fading → hidden

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('fading'), 1400)
    const timer2 = setTimeout(() => {
      setPhase('hidden')
      onFinish?.()
    }, 2000)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [])

  if (phase === 'hidden') return null

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-600 ${
      phase === 'fading' ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Background */}
      <div className="absolute inset-0 bg-bg-base dark:bg-[#0a0a0f]" />
      
      {/* Gradient blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-pink-400/10 blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-ice-400/10 blur-[60px] animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative">
          <img
            src="/assets/nt-logo.png"
            alt="Neo Tokyo"
            className="w-24 h-24 object-contain drop-shadow-[0_0_30px_rgba(231,1,70,0.4)] animate-[pulse-soft_2s_ease-in-out_infinite]"
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-[6px] bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
            NEO TOKYO
          </h1>
          <p className="text-[10px] tracking-[4px] text-text-muted mt-1">SERVICE / RMA</p>
        </div>

        {/* Loading bar */}
        <div className="w-32 h-0.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full animate-[slideBar_1.4s_ease-in-out_infinite]" 
            style={{ width: '30%' }} />
        </div>
      </div>

      <style>{`
        @keyframes slideBar {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  )
}
