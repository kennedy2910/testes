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
