import { ArrowRight, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

export default function SimulationHistoryPage() {
  const navigate = useNavigate()
  const { getAllSimulations, deleteSimulation } = useSimulationStorage()
  const [simulations, setSimulations] = useState<SimulationRecord[]>(() => getAllSimulations())

  const handleDelete = (id: string) => {
    deleteSimulation(id)
    setSimulations((current) => current.filter((simulation) => simulation.id !== id))
  }

  const sortedSimulations = useMemo(
    () => [...simulations].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    ),
    [simulations],
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHero
        title="Histórico de simulações"
        subtitle="Acompanhe o histórico de seus planos financeiros."
      />

      <div className="grid gap-4 md:gap-5">
        {sortedSimulations.length === 0 ? (
          <div className="rounded-4xl border border-border bg-card/70 p-8 text-center text-sm text-muted-foreground">
            Nenhuma simulação salva ainda.
          </div>
        ) : (
          sortedSimulations.map((simulation) => {
            const monthlySavings = calcMonthlySavings(simulation)

            return (
              <article
                key={simulation.id}
                className="rounded-4xl border border-border bg-card/90 p-6 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] transition-shadow duration-200 hover:shadow-[8px_8px_30px_0px_rgba(0,0,0,0.14)] sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                      <ArrowRight size={24} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {simulation.goalName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(simulation.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 sm:items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                        Custo da meta
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        R$ {parseFloat(simulation.goalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                        Prazo
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {simulation.goalDeadline} meses
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                        Economia mensal
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        R$ {monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => handleDelete(simulation.id)}
                    className="inline-flex items-center gap-2 rounded-3xl border border-border bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => void navigate(`/resultado/${simulation.id}`)}
                    className="inline-flex items-center justify-center gap-2 rounded-3xl bg-secondary-button px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-90"
                  >
                    Ver detalhes
                    <ArrowRight size={18} />
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </main>
  )
}
