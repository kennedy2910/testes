export default function Tests() {
  return (
    <>
      <header>
        <div className="container header-inner">
          <strong>VocationalHub</strong>
          <nav>
            <a href="/">Início</a>
            <a href="/tests">Testes</a>
          </nav>
        </div>
      </header>

      <section className="section container">
        <h2>Todos os testes</h2>

        <div className="cards-grid tests">
          {Array.from({ length: 10 }).map((_, i) => (
            <div className="card" key={i}>
              <h3>Teste {i + 1}</h3>
              <p>Descrição clara e objetiva do teste.</p>
              <button>Iniciar</button>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="container">
          <p>© 2026 VocationalHub</p>
        </div>
      </footer>
    </>
  )
}

