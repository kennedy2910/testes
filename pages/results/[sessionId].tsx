import { useEffect, useState } from "react"
import { useRouter } from "next/router"

type Answer = {
  value: number
  dimension: string
}

const DISC_LABELS: Record<string, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade"
}

export default function ResultsPage() {
  const router = useRouter()
  const { sessionId } = router.query

  const [loading, setLoading] = useState(true)
  const [primaryProfile, setPrimaryProfile] = useState<string | null>(null)
  const [secondaryProfile, setSecondaryProfile] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const raw = sessionStorage.getItem("psych_answers")
    if (!raw) {
      setLoading(false)
      return
    }

    const answers: Answer[] = JSON.parse(raw)

    if (answers.length === 0) {
      setLoading(false)
      return
    }

    const grouped: Record<string, number[]> = {}

    answers.forEach((a) => {
      if (!grouped[a.dimension]) grouped[a.dimension] = []
      grouped[a.dimension].push(a.value)
    })

    const scores = Object.entries(grouped)
      .map(([dim, values]) => ({
        dim,
        avg: values.reduce((a, b) => a + b, 0) / values.length
      }))
      .sort((a, b) => b.avg - a.avg)

    setPrimaryProfile(scores[0]?.dim || null)
    setSecondaryProfile(scores[1]?.dim || null)
    setLoading(false)
  }, [sessionId])

  if (loading) {
    return <p className="text-center mt-16">Loading...</p>
  }

  if (!primaryProfile || !sessionId) {
    return <p className="text-center mt-16 text-red-500">No data available.</p>
  }

  return (
    <div className="w-full flex justify-center mt-16 px-4">
      <div className="card w-full max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold">
          Perfil principal: {DISC_LABELS[primaryProfile]}
        </h2>

        {secondaryProfile && (
          <p className="text-gray-600">
            Perfil secundário: {DISC_LABELS[secondaryProfile]}
          </p>
        )}

        <button
          className="btn-primary w-full"
          onClick={() =>
            router.push(
              `/premium/${sessionId}` +
                `?primary_profile=${primaryProfile}` +
                `&secondary_profile=${secondaryProfile}`
            )
          }
        >
          Desbloquear relatório completo
        </button>
      </div>
    </div>
  )
}
