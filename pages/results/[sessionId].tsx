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
  const [processing, setProcessing] = useState(false) // 🔥 TRAVA
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
    if (!answers.length) {
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

  // ✅ CHECKOUT EM UM CLIQUE, SEM SEGUNDO
  const goToCheckout = async () => {
    if (processing) return // 🔥 BLOQUEIA DUPLO CLIQUE
    setProcessing(true)

    try {
      const numericSessionId = Number(sessionId)
      if (!numericSessionId) return

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/v1/stripe/create-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: numericSessionId })
        }
      )

      const data = await res.json()
      if (!data.url) throw new Error("Checkout URL não retornada")

      window.location.href = data.url // 🔥 REDIRECT IMEDIATO
    } catch (err) {
      setProcessing(false)
      alert("Erro ao iniciar o pagamento")
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>
  }

  if (!primaryProfile) {
    return <p style={{ textAlign: "center" }}>Resumo indisponível</p>
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>
        Perfil principal: {PROFILE_LABELS[primaryProfile] ?? primaryProfile}
      </h2>

      {secondaryProfile && (
        <p>
          Perfil secundário:{" "}
          {PROFILE_LABELS[secondaryProfile] ?? secondaryProfile}
        </p>
      )}

      <p style={{ marginTop: 20 }}>
        Este é um resumo inicial do seu perfil comportamental.
      </p>

      <button
        disabled={processing} // 🔥 TRAVA VISUAL
        style={{
          marginTop: 32,
          padding: "14px 24px",
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 6,
          border: "none",
          cursor: processing ? "not-allowed" : "pointer",
          backgroundColor: processing ? "#999" : "#111",
          color: "#fff"
        }}
        onClick={goToCheckout}
      >
        {processing ? "Redirecionando..." : "Desbloquear relatório completo"}
      </button>
    </div>
  )
}


