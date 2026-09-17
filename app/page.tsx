'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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

function saveData(d: MatchData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  localStorage.setItem('mabar-channel', Date.now().toString())
}

export default function Home() {
  const [data, setData] = useState<MatchData>({ nama: '', totalMatch: 0 })
  const [nama, setNama] = useState('')
  const [matchInput, setMatchInput] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const d = loadData()
    setData(d)
    setNama(d.nama)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) saveData(data)
  }, [data, loaded])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(loadData())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const updateNama = () => setData(d => ({ ...d, nama }))
  const setTotalMatch = () => {
    const n = parseInt(matchInput) || 0
    setData(d => ({ ...d, totalMatch: n }))
    setMatchInput('')
  }
  const addMatch = (n: number) => setData(d => ({ ...d, totalMatch: d.totalMatch + n }))
  const reset = () => { if (confirm('Reset total match?')) setData(d => ({ ...d, totalMatch: 0 })) }

  const webhookUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/match`
  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = webhookUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const totalAmount = data.totalMatch * 5000

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center space-y-1 pt-4">
          <h1 className="text-3xl font-bold tracking-tight">Match Control</h1>
          <p className="text-sm text-muted-foreground">Kelola match dan integrasi Sociabuzz</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Setting</CardTitle>
            <CardDescription>Atur nama dan total match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nama</label>
              <div className="flex gap-2">
                <Input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama kamu" />
                <Button onClick={updateNama} size="sm">Set</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Match</label>
              <div className="flex gap-2">
                <Input type="number" value={matchInput} onChange={e => setMatchInput(e.target.value)} placeholder="Set total..." />
                <Button onClick={setTotalMatch} size="sm" variant="outline">Set</Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <div className="flex gap-2 w-full">
              <Button onClick={() => addMatch(1)} size="sm" className="flex-1">+1</Button>
              <Button onClick={() => addMatch(5)} size="sm" variant="secondary" className="flex-1">+5</Button>
              <Button onClick={() => addMatch(10)} size="sm" variant="secondary" className="flex-1">+10</Button>
              <Button onClick={reset} size="sm" variant="destructive">Reset</Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Preview</span>
              <Badge variant="secondary" className="text-lg font-black px-3 py-1">{data.totalMatch}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="text-2xl font-bold">{data.nama || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Match</p>
              <p className="text-4xl font-black text-primary">{data.totalMatch}</p>
            </div>
            <div className="pt-2 border-t border-primary/10">
              <p className="text-sm text-muted-foreground">Estimasi</p>
              <p className="text-xl font-bold text-emerald-500">Rp {totalAmount.toLocaleString('id-ID')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Integrasi Sociabuzz</CardTitle>
            <CardDescription className="text-xs">POST JSON ke webhook endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <code className="block bg-muted rounded-md p-2 text-xs font-mono break-all">POST {webhookUrl}</code>
            <pre className="bg-muted rounded-md p-2 text-xs font-mono">{`{"nama": "...", "match": 1}`}</pre>
          </CardContent>
          <CardFooter>
            <Button onClick={copyWebhook} variant="outline" size="sm" className="w-full">
              {copied ? '✓ Copied!' : 'Copy Webhook URL'}
            </Button>
          </CardFooter>
        </Card>

        <div className="text-center pt-2">
          <a href="/overlay" target="_blank" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
            Buka Overlay →
          </a>
        </div>
      </div>
    </div>
  )
}
