// Retornar o score
function busca_score {
  input {
    int score
  }

  stack {
    precondition ($input.score >= 0) {
      error_type = "inputerror"
      error = "Invalid score."
    }
  }

  response = null
}