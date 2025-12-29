import { useEffect, useState } from "react"
import { useRouter } from "next/router"

export default function PremiumPage() {
  const router = useRouter()
  const { sessionId } = router.query

  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)
  const [report, setReport] = useState<any | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const numericSessionId = Number(sessionId)
    if (!numericSessionId) return

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)

        const primaryProfile = params.get("primary_profile")
        const secondaryProfile = params.get("secondary_profile")

        const rawStripeSessionId = params.get("stripe_session_id")
        const stripeSessionId =
          rawStripeSessionId &&
          rawStripeSessionId !== "null" &&
          rawStripeSessionId !== "undefined"
            ? rawStripeSessionId
            : null

        // 1️⃣ Se voltou da Stripe, marca como pago no Xano
        if (stripeSessionId) {
          const markRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/sessions/mark_paid`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                session_id: numericSessionId,
                stripe_session_id: stripeSessionId
              })
            }
          )

          if (!markRes.ok) {
            const err = await markRes.text()
            throw new Error("mark_paid failed: " + err)
          }
        }

        // 2️⃣ Buscar relatório premium
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/premium/report` +
            `?session_id=${numericSessionId}` +
            `&primary_profile=${primaryProfile}` +
            `&secondary_profile=${secondaryProfile}`
        )

        if (res.status === 403) {
          setLocked(true)
          return
        }

        if (!res.ok) {
          throw new Error("Failed to load premium report")
        }

        const data = await res.json()
        setReport(data.report)
        setLocked(false)
      } catch (err) {
        console.error(err)
        setLocked(true)
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [sessionId])

  const startPayment = async () => {
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

      const text = await res.text()
      console.log("STATUS:", res.status)
      console.log("RESPONSE:", text)

      if (!res.ok) {
        throw new Error(text)
      }

      const data = JSON.parse(text)

      if (!data.url) {
        throw new Error("Checkout URL not returned")
      }

      window.location.href = data.url
    } catch (err) {
      console.error("PAYMENT ERROR:", err)
      alert("Erro ao iniciar o pagamento (ver console)")
    }
  }

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>
  }

  if (locked) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p>Relatório premium bloqueado</p>
        <button onClick={startPayment}>Desbloquear relatório premium</button>
      </div>
    )
  }

  if (!report) {
    return <p style={{ textAlign: "center" }}>No data available.</p>
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>{report.title}</h2>
      <p>{report.overview}</p>

      {report.complement && (
        <>
          <h3>Perfil complementar</h3>
          <p>{report.complement}</p>
        </>
      )}

      <p style={{ fontSize: 12, opacity: 0.7 }}>{report.note}</p>
    </div>
  )
}
