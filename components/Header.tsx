import Link from "next/link"

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <strong>VocationalHub</strong>
        <nav>
          <Link href="/">Início</Link>
          <Link href="/tests">Testes</Link>
        </nav>
      </div>
    </header>
  )
}
