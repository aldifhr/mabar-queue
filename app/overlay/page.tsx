'use client'

import { useState, useEffect } from 'react'

interface MatchData {
  nama: string
  totalMatch: number
}

const STORAGE_KEY = 'mabar-match'

function loadData(): MatchData {
  if (typeof window === 'undefined') return { nama: '', totalMatch: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { nama: '', totalMatch: 0 }
  } catch {
    return { nama: '', totalMatch: 0 }
  }
}

export default function Overlay() {
  const [data, setData] = useState<MatchData>({ nama: '', totalMatch: 0 })

  useEffect(() => {
    setData(loadData())
    const interval = setInterval(() => setData(loadData()), 500)
    const handler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) setData(loadData()) }
    window.addEventListener('storage', handler)
    return () => { clearInterval(interval); window.removeEventListener('storage', handler) }
  }, [])

  useEffect(() => {
    document.body.style.background = 'transparent'
    document.body.style.margin = '0'
  }, [])

  const totalAmount = data.totalMatch * 5000

  return (
    <main style={{ background: 'transparent', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{
        padding: '24px',
        maxWidth: '420px',
        background: 'rgba(0,0,0,0.65)',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        margin: '16px',
      }}>
        <h2 style={{
          margin: '0 0 12px',
          fontSize: '18px', fontWeight: 700,
          color: '#a5b4fc',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e', display: 'inline-block',
            boxShadow: '0 0 8px #22c55e',
            animation: 'pulse 2s infinite',
          }} />
          Match Overlay
        </h2>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px' }}>Nama</p>
          <p style={{
            color: '#f1f5f9', fontSize: '28px', fontWeight: 700, margin: '0 0 16px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {data.nama || '-'}
          </p>

          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px' }}>Total Match</p>
          <p style={{ color: '#818cf8', fontSize: '64px', fontWeight: 900, margin: '0 0 8px', lineHeight: 1 }}>
            {data.totalMatch}
          </p>

          <div style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '8px',
            padding: '8px 16px',
            display: 'inline-block',
          }}>
            <p style={{ color: '#34d399', fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Rp {totalAmount.toLocaleString('id-ID')}
            </p>
            <p style={{ color: '#6ee7b7', fontSize: '12px', margin: 0 }}>
              1 match = Rp 5.000
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </main>
  )
}
