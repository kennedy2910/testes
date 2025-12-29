function test_verify {
  input {
    int test_id
  }

  stack {
    // Buscar teste pelo ID
    db.get tests {
      field_name = "id"
      field_value = $input.test_id
    } as $test
  
    // Validar se o teste existe
    precondition ($test != null) {
      error_type = "notfound"
      error = "Test not found."
    }
  
    // Se chegou aqui, o teste existe
    var $test_exists {
      value = true
    }
  }

  response = {exists: $test_exists}
}