function verifica_admin {
  input {
    int user_id
  }

  stack {
    // Buscar usuário
    db.get users {
      field_name = "id"
      field_value = $input.user_id
    } as $user
  
    // Se não existir
    precondition ($user != null) {
      error_type = "notfound"
      error = "User not found."
    }
  
    // Verificar se é admin
    var $is_admin {
      value = $user.role == 1
    }
  }

  response = {is_admin: $is_admin}
}