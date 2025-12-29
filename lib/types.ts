/* =========================
   CORE ENTITIES
========================= */

export interface Question {
  id: number
  question_text: string
  question_type: string
  order: number
}

export interface Choice {
  id: number
  label: string
  value: number
  order: number
}

/* =========================
   API RESPONSES
========================= */

// sessions/start
export interface SessionStartResponse {
  session_id: number
  question: Question
}

// sessions/next
export interface NextQuestionResponse {
  session_id: number
  question: Question | null
}

// questions/choices
export interface ChoiceResponse {
  results: Choice[]
}

