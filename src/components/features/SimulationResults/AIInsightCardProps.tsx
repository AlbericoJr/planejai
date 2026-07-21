import 'react-loading-skeleton/dist/skeleton.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import type { SimulationRecord } from '@/data/simulation'
import { useInsight } from '@/hooks/useInsight'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { askFollowUp } from '@/services/aiService'

import { Content } from '../insights/Content'
import { Error } from '../insights/Error'

interface AIInsightCardProps {
  simulationId: string
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
}

export function AIInsightsCard({ simulationId }: AIInsightCardProps) {
  const { insight, isLoading, error, fetchInsight } = useInsight(simulationId)
  const { getFormData, updateSimulation } = useSimulationStorage()

  const simulation = getFormData(simulationId) as SimulationRecord | null

  const initialMessages = useMemo(() => simulation?.conversation?.messages ?? [], [simulation])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)

  // initialMessages are used to initialize state; we avoid setting state
  // synchronously inside an effect to prevent cascading renders.

  // auto-scroll to bottom when messages change
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isSending])

  const persistMessage = (msg: Message) => {
    const sim = getFormData(simulationId)
    if (!sim) return
    const updated = {
      ...sim,
      conversation: {
        messages: [...(sim.conversation?.messages ?? []), msg],
      },
    } as SimulationRecord

    updateSimulation(simulationId, updated)
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setSendError(null)
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    persistMessage(userMsg)
    setInput('')

    // build prompt context using simulation data + insight summary + conversation
    const sim = getFormData(simulationId)

    const historyText = messages
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.text}`)
      .join('\n')

    const summaryOfInsight = insight
      ? `${insight.diagnosis.content} Sugestões: ${insight.suggestions.items.join('; ')}. Recomendações de investimento: ${insight.investment.items.join('; ')}`
      : ''

    const prompt = `Você é um educador financeiro. Use os dados da simulação e o insight resumido abaixo para responder à pergunta do usuário.

Contexto (dados da simulação):
${sim ? `Renda: ${sim.income}, Despesas: ${sim.expenses}, Dívidas: ${sim.debts}, Meta: ${sim.goalName} — ${sim.goalAmount} em ${sim.goalDeadline} meses` : ''}

Resumo do insight:
${summaryOfInsight}

Histórico (últimas mensagens):
${historyText}

Pergunta do usuário:
${userMsg.text}

Regras de resposta:
- Responda em português do Brasil.
- NÃO retorne JSON nem coloque o conteúdo entre blocos de código.
- Estruture a resposta com: 1) um título curto; 2) um parágrafo de diagnóstico (máx. 2 frases); 3) até 3 ações práticas numeradas com valores quando aplicável; 4) uma frase motivacional final.
- Seja direto, objetivo e inclua números formatados quando necessário.

Responda apenas com texto claro.`

    if (import.meta.env.DEV) {
      // log prompt for debugging in development only

      console.debug('Follow-up prompt:', prompt)
    }

    setIsSending(true)
    try {
      const reply = await askFollowUp(prompt)

      if (import.meta.env.DEV) {

        console.debug('IA reply:', reply)
      }
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: reply,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      persistMessage(assistantMsg)
    } catch (error) {
      console.error(error)
      setSendError('Erro ao obter resposta da IA. Tente novamente.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-card order-2 rounded-2xl p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] lg:order-1 lg:col-span-2">
      <div className="mb-3 flex items-center gap-1.5">
        <span>✨</span>
        <span className="text-primary text-xs font-semibold tracking-widest uppercase">
          Insight Financeiro Personalizado
        </span>
      </div>

      {isLoading && (
        <div className="flex">
          <Skeleton
            count={10.5}
            baseColor="var(--color-skeleton-base)"
            highlightColor="var(--color-skeleton-highlight)"
            className="mb-3 flex rounded-lg"
            containerClassName="flex-1"
            inline
          />
        </div>
      )}

      {!isLoading && error && (
        <Error simulationId={simulationId} message={error} onRetry={() => fetchInsight(simulationId)} />
      )}

      {!isLoading && insight && !error && (
        <div className="flex flex-col gap-4">
          <div className="max-h-105 overflow-y-auto rounded-lg border border-border p-4" ref={containerRef}>
            <Content insight={insight} />

            {/* conversation history */}
            <div className="mt-4 flex flex-col gap-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-3 ${m.role === 'user'
                    ? 'bg-primary/10 self-end text-foreground'
                    : 'bg-card/80 border border-border text-muted-foreground'
                    }`}
                >
                  {m.role === 'assistant' ? (
                    <AssistantMessage text={m.text} />
                  ) : (
                    <p className="text-sm leading-relaxed">{m.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleSend()
                }
              }}
              placeholder="Faça uma pergunta sobre esta simulação"
              className="flex-1 rounded-3xl border border-border bg-card/90 px-4 py-3 text-sm text-foreground focus:outline-none"
            />
            <button
              onClick={() => void handleSend()}
              disabled={isSending}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-white disabled:opacity-60"
            >
              {isSending ? '...' : 'Enviar'}
            </button>
          </div>

          {sendError && <p className="mt-2 text-sm text-red-500">{sendError}</p>}
        </div>
      )}
    </div>
  )
}

function AssistantMessage({ text }: { text: string }) {
  // try to detect JSON responses and fallback to plain text
  let parsed: unknown = null
  try {
    const trimmed = text.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      parsed = JSON.parse(trimmed)
    }
  } catch {
    parsed = null
  }

  const content = parsed ? JSON.stringify(parsed, null, 2) : text

  // simple parser: split paragraphs and detect numbered lists
  const paragraphs = String(content).split('\n\n')

  return (
    <div>
      {paragraphs.map((p, i) => {
        const lines = p.split('\n').map((l) => l.trim()).filter(Boolean)
        const isNumbered = lines.every((l) => /^\d+\./.test(l))
        const isBulleted = lines.every((l) => /^[-•*]/.test(l))

        if (isNumbered) {
          return (
            <ol key={i} className="ml-4 list-decimal text-sm leading-relaxed">
              {lines.map((l, idx) => (
                <li key={idx} className="pl-1">
                  {l.replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ol>
          )
        }

        if (isBulleted) {
          return (
            <ul key={i} className="ml-4 list-disc text-sm leading-relaxed">
              {lines.map((l, idx) => (
                <li key={idx} className="pl-1">
                  {l.replace(/^[-•*]\s*/, '')}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="text-sm leading-relaxed">
            {p}
          </p>
        )
      })}
    </div>
  )
}
