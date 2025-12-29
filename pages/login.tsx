// pages/login.tsx
import { FormEvent, useState } from "react"
import { useRouter } from "next/router"
import { login } from "../lib/api"
import { saveToken } from "../lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await login(email, password)
      saveToken(res.authToken)
      router.replace("/dashboard")
    } catch (err) {
      setError("Invalid credentials or server error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center mt-16 px-4">
      <div className="card">
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">
          Log in to access your cognitive and vocational tests.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
