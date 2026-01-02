import axios from "axios"
import {
  SessionStartResponse,
  NextQuestionResponse,
  ChoiceResponse
} from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

/* ================================
   SESSIONS
================================ */

// Start session
export async function startSession(
  testId: number
): Promise<SessionStartResponse> {
  const res = await api.post("/sessions/start", {
    test_id: testId
  })
  return res.data
}

// Next question
export async function nextQuestion(
  sessionId: number,
  nextOrder: number
): Promise<NextQuestionResponse> {
  const res = await api.post("/sessions/next", {
    session_id: sessionId,
    next_order: nextOrder
  })
  return res.data
}

/**
 * Mark session as paid/unlock premium report
 */
export async function markPaid(sessionId: number, stripeSessionId: string) {
  try {
    const res = await api.post("/sessions/mark_paid", {
      session_id: sessionId,
      stripe_session_id: stripeSessionId,
    });
    console.log("[API] markPaid response:", res.data);
    return { success: res.status === 200, ...res.data };
  } catch (err: any) {
    console.error("[API] markPaid error:", err?.response?.data || err.message);
    throw new Error(err?.response?.data?.message || "Falha no desbloqueio");
  }
}

// Função para desbloquear relatório premium/marcar como pago
export async function unlockPremiumReport(sessionId: number, stripeSessionId: string) {
  const res = await api.post("/sessions/mark_paid", {
    session_id: sessionId,
    stripe_session_id: stripeSessionId,
  });
  // Resposta explícita 'unlocked' síncrona
  return { unlocked: res.status === 200 };
}

/* ================================
   QUESTIONS
================================ */

// Get choices for a question
export async function getQuestionChoices(
  questionId: number
): Promise<ChoiceResponse> {
  const res = await api.get("/questions/choices", {
    params: { question_id: questionId }
  })
  return res.data
}

