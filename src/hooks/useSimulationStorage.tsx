import { type SimulationFormData, type SimulationRecord } from '@/data/simulation'

const LOCAL_STORAGE_KEY = 'simulation-data'

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = {
      ...formData,
      id,
      createdAt: new Date().toISOString(),
    }

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage
      ? (JSON.parse(storage) as SimulationRecord[])
      : []

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, record]),
    )

    return id
  }

  const getAllSimulations = () => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return [] as SimulationRecord[]
    }

    return (JSON.parse(storage) as SimulationRecord[]).sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
  }

  const getFormData = (id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return null
    }

    const savedData = JSON.parse(storage) as SimulationRecord[]
    return savedData.find((record) => record.id === id) || null
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record,
    )

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  const deleteSimulation = (id: string) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    const updated = savedData.filter((record) => record.id !== id)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }

  return {
    saveFormData,
    getAllSimulations,
    getFormData,
    updateSimulation,
    deleteSimulation,
  }
}
