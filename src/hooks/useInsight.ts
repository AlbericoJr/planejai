import { useCallback, useEffect, useState } from "react"

import { buildAIPrompt } from "@/data/aiPrompt"
import { useSimulationStorage } from "@/hooks/useSimulationStorage"
import { getInsight, type InsightData } from "@/services/aiService"

export const useInsight = (id: string) => {
  const [insight, setInsight] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { getFormData } = useSimulationStorage()

  // useCallback é necessário pois essa função entra no array de dependências do useEffect
  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation =
        getFormData(
          simulationId,
        )

      if (!simulation) {
        setInsight(null)
        setError(
          "Simulação não encontrada.",
        )
        setIsLoading(
          false,
        )
        return
      }

      setInsight(null)
      setIsLoading(true)
      setError(null)

      try {
        const prompt =
          buildAIPrompt(
            simulation,
          )
        const data =
          await getInsight(
            prompt,
          )
        setInsight(data)
      } catch {
        setError(
          "Erro ao gerar o diagnóstico. Tente novamente.",
        )
      } finally {
        setIsLoading(
          false,
        )
      }
    },
    [getFormData],
  )

  useEffect(() => {
    if (!id) {
      return
    }

    void Promise.resolve().then(() => {
      void fetchInsight(id)
    })
  }, [id, fetchInsight])

  return { insight, isLoading, error, fetchInsight }
}
