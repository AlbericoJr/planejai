// Vercel Serverless Function: chave exclusiva do servidor.
const windows = new Map()
const WINDOW_MS = 60_000
const MAX_REQUESTS = 10
const MAX_PROMPT_LENGTH = 12_000

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const expectedHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim()
  const origin = req.headers.origin
  // Requisições entre origens diferentes não são permitidas neste endpoint.
  if (!origin || !expectedHost || URLSafeHost(origin) !== expectedHost) {
    return res.status(403).json({ error: 'Origem não autorizada.' })
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
  const now = Date.now()
  if (windows.size > 2000) {
    for (const [key, state] of windows) {
      if (state.until <= now) windows.delete(key)
    }
  }
  const state = windows.get(ip)
  const count = state && state.until > now ? state.count + 1 : 1
  windows.set(ip, { count, until: state && state.until > now ? state.until : now + WINDOW_MS })
  if (count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente em instantes.' })
  }

  const prompt = req.body?.prompt
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Mensagem inválida ou muito longa.' })
  }

  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(503).json({ error: 'Serviço de IA não configurado.' })

  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(25_000),
    })
    if (!upstream.ok) {
      console.error('Gemini API status:', upstream.status)
      return res.status(502).json({ error: 'Falha na geração da resposta.' })
    }
    const result = await upstream.json()
    return res.status(200).json(result)
  } catch (error) {
    console.error('Falha de conexão com provedor de IA:', error instanceof Error ? error.name : 'unknown')
    return res.status(502).json({ error: 'Serviço de IA indisponível.' })
  }
}

function URLSafeHost(origin) {
  try { return new URL(origin).host } catch { return '' }
}
