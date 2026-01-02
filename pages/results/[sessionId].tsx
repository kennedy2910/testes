import { useEffect, useState } from "react"
import { useRouter } from "next/router"

type Answer = {
  dimension: string
  value: number
}

const PROFILE_LABELS: Record<string, string> = {
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
    if (!answers || answers.length === 0) {
      setLoading(false)
      return
    }

    const grouped: Record<string, number[]> = {}
    answers.forEach((a) => {
      if (!grouped[a.dimension]) grouped[a.dimension] = []
      grouped[a.dimension].push(a.value)
    })

    const scores = Object.entries(grouped)
      .map(([dimension, values]) => ({
        dimension,
        avg: values.reduce((x, y) => x + y, 0) / values.length
      }))
      .sort((a, b) => b.avg - a.avg)

    setPrimaryProfile(scores[0]?.dimension ?? null)
    setSecondaryProfile(scores[1]?.dimension ?? null)
    setLoading(false)
  }, [sessionId])

  const goToCheckout = () => {
    router.push(`/premium/${sessionId}`)
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>
  }

  if (!primaryProfile) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Resumo indisponível
      </p>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      {/* 🔥 TÍTULO AGRESSIVO */}
      <h2 style={{ marginBottom: 12 }}>
        Seu perfil principal revela mais do que você imagina
      </h2>

      <h3 style={{ marginBottom: 8 }}>
        Perfil dominante:{" "}
        {PROFILE_LABELS[primaryProfile] ?? primaryProfile}
      </h3>

      {secondaryProfile && (
        <p style={{ marginBottom: 16 }}>
          Perfil secundário:{" "}
          {PROFILE_LABELS[secondaryProfile] ?? secondaryProfile}
        </p>
      )}

      {/* 🔥 TEXTO AGRESSIVO */}
      <p style={{ marginTop: 20 }}>
        Este resumo mostra apenas a superfície do seu perfil comportamental.
        <br />
        <strong>
          Alguns padrões que influenciam suas decisões não aparecem aqui.
        </strong>
      </p>

      <p style={{ marginTop: 12 }}>
        A análise completa identifica riscos, tendências e comportamentos
        recorrentes que a maioria das pessoas nunca analisa conscientemente.
      </p>

      {/* 🔥 ÚNICO CTA — COMO ANTES */}
      <button
        style={{
          marginTop: 32,
          padding: "14px 24px",
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#111",
          color: "#fff",
          width: "100%"
        }}
        onClick={goToCheckout}
      >
        Desbloquear análise completa
      </button>
    </div>
  )
}



