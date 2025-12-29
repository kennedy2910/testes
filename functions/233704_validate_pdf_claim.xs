function validate_pdf_claim {
  input {
    int orders_id? {
      table = "orders"
    }
  }

  stack {
    db.query orders {
      where = $toolset.token == "$input.pdf_claim"
      return = {type: "list"}
    } as $orders1
  
    foreach ("orders") {
      each as $item
    }
  }

  response = $orders1
}