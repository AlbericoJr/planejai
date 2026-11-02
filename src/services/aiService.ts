interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

const callGeminiAPI = async (prompt: string) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    throw new Error(`Falha na API de IA (HTTP ${response.status})`)
  }

  return (await response.json()) as GeminiResponse
}

function extractText(response: GeminiResponse): string {
  const content = response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
  if (!content) throw new Error('Resposta da IA vazia ou inválida.')
  return content
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: { content: string }
  suggestions: { items: string[] }
  extraIncome: { items: string[] }
  investment: { items: string[] }
  motivation: { content: string }
}

export const getInsight = async (prompt: string): Promise<InsightData> => {
  const text = extractText(await callGeminiAPI(prompt))
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned) as InsightData
}

export const askFollowUp = async (prompt: string): Promise<string> => {
  return extractText(await callGeminiAPI(prompt))
}
