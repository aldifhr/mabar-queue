'use client'

import { useState, useEffect } from 'react'

interface MatchData {
  nama: string
  totalMatch: number
}

const STORAGE_KEY = 'mabar-match'
const SOCIABUZZ_URL = 'https://api.indofinity.com/api/webhooks/sociabuzz/7da4b319-c02a-4c7f-8740-155e740279c9'

function loadData(): MatchData {
  if (typeof window === 'undefined') return { nama: '', totalMatch: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { nama: '', totalMatch: 0 }
  } catch {
    return { nama: '', totalMatch: 0 }
  }
}

function saveData(d: MatchData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  localStorage.setItem('mabar-channel', Date.now().toString())
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState<MatchData>({ nama: '', totalMatch: 0 })
  const [nama, setNama] = useState('')
  const [matchInput, setMatchInput] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [showToast, setShowToast] = useState('')

  useEffect(() => {
    const d = loadData()
    setData(d); setNama(d.nama); setLoaded(true)
  }, [])

  useEffect(() => { if (loaded) saveData(data) }, [data, loaded])

  useEffect(() => {
    const handler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) setData(loadData()) }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const updateNama = () => setData(d => ({ ...d, nama }))
  const setTotalMatch = () => { setData(d => ({ ...d, totalMatch: parseInt(matchInput) || 0 })); setMatchInput('') }
  const addMatch = (n: number) => setData(d => ({ ...d, totalMatch: d.totalMatch + n }))
  const confirmReset = () => { setData(d => ({ ...d, totalMatch: 0 })); setShowReset(false) }

  const copyWebhook = async () => {
    const url = SOCIABUZZ_URL;
    try {
      // modern clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true); setShowToast('✓ Copied');
      setTimeout(() => { setCopied(false); setShowToast('') }, 2000);
    } catch {
      // fallback: textarea + execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true); setShowToast('✓ Copied');
        setTimeout(() => { setCopied(false); setShowToast('') }, 2000);
      } catch {
        setShowToast('Failed to copy');
        setTimeout(() => setShowToast(''), 2000);
      }
    }
  }

  const totalAmount = data.totalMatch * 5000

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="max-w-md mx-auto px-5 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase tracking-widest text-white/40">
          <span>Match Control</span>
          <a href="/overlay" target="_blank" className="hover:text-white transition">Overlay →</a>
        </div>

        {/* Hero Counter */}
        <div className="text-center py-10">
          <div className="text-[180px] font-black leading-[0.85] tabular-nums tracking-tighter">{data.totalMatch}</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-4">Total Match</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-white/10 rounded-lg p-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Nama</div>
            <div className="font-semibold text-sm truncate">{data.nama || '—'}</div>
          </div>
          <div className="border border-white/10 rounded-lg p-3">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Earnings</div>
            <div className="font-semibold text-sm">Rp {totalAmount.toLocaleString('id-ID')}</div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-white/30 placeholder:text-white/20"
              value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama" />
            <button onClick={updateNama} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">Set</button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-white/30 placeholder:text-white/20"
              value={matchInput} onChange={e => setMatchInput(e.target.value)} placeholder="Set total..." />
            <button onClick={setTotalMatch} className="border border-white/20 px-4 py-2.5 rounded-lg text-sm">Set</button>
          </div>
        </div>

        {/* Match Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => addMatch(1)} className="bg-white text-black py-3.5 rounded-lg font-bold text-base">+1</button>
          <button onClick={() => addMatch(5)} className="border border-white/20 py-3.5 rounded-lg font-bold text-base">+5</button>
          <button onClick={() => addMatch(10)} className="border border-white/20 py-3.5 rounded-lg font-bold text-base">+10</button>
          <button onClick={() => setShowReset(true)} className="border border-white/20 py-3.5 rounded-lg font-bold text-base text-red-400">R</button>
        </div>

        {/* Webhook */}
        <div className="border border-white/10 rounded-lg p-4 space-y-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Sociabuzz Webhook</div>
          <code className="block text-xs text-white/60 break-all">{SOCIABUZZ_URL}</code>
          <pre className="text-xs text-white/40">{`{"nama":"...","match":1}`}</pre>
          <button onClick={copyWebhook} className="border border-white/20 px-3 py-2 rounded-lg text-xs w-full">
            {copied ? '✓ Copied' : 'Copy Webhook'}
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal open={showReset} onClose={() => setShowReset(false)}>
        <h3 className="text-lg font-bold mb-2">Reset Total Match?</h3>
        <p className="text-sm text-white/60 mb-6">This will reset your match counter to zero.</p>
        <div className="flex gap-3">
          <button onClick={() => setShowReset(false)} className="flex-1 border border-white/20 py-2.5 rounded-lg text-sm">Cancel</button>
          <button onClick={confirmReset} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold">Reset</button>
        </div>
      </Modal>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-3 rounded-full text-sm font-semibold shadow-lg">
          {showToast}
        </div>
      )}
    </div>
  )
}
