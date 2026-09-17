import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'match.json')

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { nama: '', totalMatch: 0 }
  }
}

async function writeData(data: { nama: string; totalMatch: number }) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = await readData()
  return Response.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const current = await readData()
    
    const updated = {
      nama: body.nama ?? current.nama,
      totalMatch: body.totalMatch ?? 
                  (body.match ? current.totalMatch + body.match : current.totalMatch)
    }
    
    await writeData(updated)
    return Response.json(updated)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}
