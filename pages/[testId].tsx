import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { startSession, nextQuestion } from "../lib/api"
import { Question } from "../lib/types"

// =========================
// FIXED LIKERT OPTIONS
// =========================
const FIXED_LIKERT_CHOICES = [
  { label: "Discordo totalmente", value: 1 },
  { label: "Discordo", value: 2 },
  { label: "Neutro", value: 3 },
  { label: "Concordo", value: 4 },
  { label: "Concordo totalmente", value: 5 }
]


// =========================
// TYPES
// =========================
type PsychometricAnswer = {
  value: number
  dimension: string
  reverse: boolean
}

// =========================
// PAGE
// =========================
export default function TestPage() {
  const router = useRouter()
  const { testId } = router.query

  const startedRef = useRef(false)

  const [sessionId, setSessionId] = useState<number | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<PsychometricAnswer[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // =========================
  // START SESSION
  // =========================
  useEffect(() => {
    if (!testId || startedRef.current) return
    startedRef.current = true

    const init = async () => {
      try {
        setLoading(true)

        sessionStorage.removeItem("psych_answers")

        const res = await startSession(Number(testId))
        setSessionId(res.session_id)
        setQuestion(res.question)
      } catch (err) {
        console.error("START ERROR:", err)
        setError("Failed to start test.")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [testId])

  // =========================
  // REVERSE SCORING
  // =========================
  const applyReverse = (value: number, reverse: boolean) =>
    reverse ? 6 - value : value

  // =========================
  // ANSWER QUESTION
  // =========================
  const handleAnswer = async (value: number) => {
    if (!sessionId || !question || submitting) return

    setSubmitting(true)
    setError("")

    const scoredValue = applyReverse(value, question.reverse)

    const updatedAnswers = [
      ...answers,
      {
        value: scoredValue,
        dimension: question.dimension,
        reverse: question.reverse
      }
    ]

    setAnswers(updatedAnswers)

    try {
      const res = await nextQuestion(sessionId, question.order + 1)

      if (res.question === null) {
        finishTest(updatedAnswers)
        return
      }

      setQuestion(res.question)
    } catch (err) {
      console.error("NEXT ERROR:", err)
      setError("Failed to load next question.")
    } finally {
      setSubmitting(false)
    }
  }

  // =========================
  // FINISH TEST
  // =========================
  const finishTest = (finalAnswers: PsychometricAnswer[]) => {
  // 🔹 salvar respostas para psicometria
  sessionStorage.setItem(
    "psych_answers",
    JSON.stringify(finalAnswers)
  )

  // 🔹 navega para resultados
  router.push(`/results/${sessionId}`)
}

  // =========================
  // RENDER
  // =========================
  if (loading) return <p className="p-4">Recebendo testes...</p>
  if (!question) return <p className="p-4">Nao foram encotrados testes.</p>

  return (
    <div className="max-w-xl mx-auto mt-10 px-4">
      <h1 className="text-xl font-semibold mb-2">
        Questão {question.order}
      </h1>

      <p className="mb-6">{question.question_text}</p>

      <div className="space-y-3">
        {FIXED_LIKERT_CHOICES.map((choice) => (
          <button
            key={choice.value}
            className="btn-primary w-full"
            disabled={submitting}
            onClick={() => handleAnswer(choice.value)}
          >
            {choice.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-4">{error}</p>
      )}
    </div>
  )
}
