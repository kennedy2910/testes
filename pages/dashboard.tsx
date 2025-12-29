// pages/dashboard.tsx
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { getTests } from "../lib/api"
import { TestItem } from "../lib/types"
import { clearToken } from "../lib/auth"

export default function DashboardPage() {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const data = await getTests()
        setTests(data)
      } catch (err) {
        setError("Failed to load tests.")
      } finally {
        setLoading(false)
      }
    }
    fetchTests()
  }, [])

  const handleStart = (testId: number) => {
    router.push(`/test/${testId}`)
  }

  const handleLogout = () => {
    clearToken()
    router.replace("/login")
  }

  return (
    <div className="w-full max-w-5xl mt-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Your tests</h1>
          <p className="text-gray-500">
            Choose one of the tests below and start your journey of self-knowledge.
          </p>
        </div>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading tests...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{test.title}</h2>
              <p className="text-gray-500 text-sm">
                {test.description || "Brief psychological evaluation."}
              </p>
            </div>
            <div className="mt-4">
              <button className="btn-primary" onClick={() => handleStart(test.id)}>
                Start test
              </button>
            </div>
          </div>
        ))}

        {!loading && tests.length === 0 && (
          <p className="text-gray-500">
            No tests available at the moment.
          </p>
        )}
      </div>
    </div>
  )
}
