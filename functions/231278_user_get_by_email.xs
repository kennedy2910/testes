function user_get_by_email {
  input {
    email email
  }

  stack {
    db.get "" {
      field_name = "email"
      field_value = $input.email
    } as $user
  }

  response = $user
}