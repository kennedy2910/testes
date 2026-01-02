import { useRouter } from "next/router"

const TESTS = [
  {
    id: 1,
    title: "Perfil Comportamental",
    description: "Descubra seu perfil dominante e como você toma decisões.",
    badge: "Popular"
  },
  {
    id: 2,
    title: "Teste Vocacional",
    description: "Identifique carreiras alinhadas com seu perfil.",
    badge: "Gratuito"
  },
  {
    id: 3,
    title: "Inteligência Emocional",
    description: "Entenda como você lida com emoções e pressão.",
    badge: "Novo"
  },
  {
    id: 4,
    title: "Liderança",
    description: "Avalie seu potencial de liderança.",
    badge: "Popular"
  },
  {
    id: 5,
    title: "Comunicação",
    description: "Descubra seu estilo de comunicação.",
    badge: "Gratuito"
  },
  {
    id: 6,
    title: "Tomada de Decisão",
    description: "Veja como você decide sob pressão.",
    badge: "Em alta"
  }
]

export default function Home() {
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

      <section className="hero">
        <h1>Descubra o teste perfeito para você</h1>
        <p>Testes psicológicos e vocacionais para decisões mais conscientes</p>
        <button style={{ marginTop: 32, padding: "14px 28px", fontWeight: 700 }}>
          Começar agora
        </button>
      </section>

      <section className="section container">
        <h2>Testes mais populares</h2>

        <div className="cards-grid home">
          {[
            ["Perfil Comportamental", "Popular"],
            ["Teste Vocacional", "Gratuito"],
            ["Inteligência Emocional", "Novo"],
            ["Liderança", "Popular"],
            ["Teste de QI", "Clássico"],
            ["Carreira", "Essencial"]
          ].map(([title, badge]) => (
            <div className="card" key={title}>
              <span className="badge">{badge}</span>
              <h3>{title}</h3>
              <p>Descubra insights profundos sobre você.</p>
              <button>Fazer teste</button>
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
