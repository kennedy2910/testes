// pages/_app.tsx

import type { AppProps } from "next/app"

// ✅ IMPORTAR TODOS OS CSS GLOBAIS
import "../styles/globals.css"
import "../styles/layout.css"
import "../styles/cards.css"
import "../styles/theme.css"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { getToken } from "../lib/auth"

const publicRoutes = ["/login"]

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const token = getToken()

    const publicPrefixes = [
      "/",
      "/login",
      "/test",
      "/results"
    ]

    const isPublic = publicPrefixes.some((path) =>
      router.pathname.startsWith(path)
    )

    if (!token && !isPublic) {
      router.replace("/login")
    }

    setCheckingAuth(false)
  }, [router.pathname])

  return (
    <div className="page-container">
      <main className="page-main">
        <Component {...pageProps} />
      </main>
    </div>
  )
}
