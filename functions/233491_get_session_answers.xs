function get_session_answers {
  input {
    int session_id
  }

  stack {
    db.query "" {
      where = $db.session_questions.session_id == $input.session_id
      return = {type: "list"}
    } as $answers
  }

  response = $answers
}