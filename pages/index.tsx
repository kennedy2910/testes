import { useEffect, useState } from "react";
import { useRouter } from "next/router";

type Test = {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  created_at?: number | string;
};

export default function Home() {
  const router = useRouter();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("INDEX useEffect RUNNING");

    async function loadTests() {
      try {
        setError(null);
        console.log("Calling /tests/list ...");

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
          throw new Error("NEXT_PUBLIC_API_URL is not set in .env");
        }

        const res = await fetch(`${baseUrl}/tests/list`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        console.log("Response status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load tests: ${res.status} ${text}`);
        }

        const data = await res.json();
        console.log("Raw response:", data);

        const list = Array.isArray(data) ? data : (data?.tests ?? []);
        setTests(list);
      } catch (err: any) {
        console.error("Error loading tests:", err);
        setError(err?.message || "Failed to load tests");
        setTests([]);
      } finally {
        setLoading(false);
      }
    }

    loadTests();
  }, []);

  if (loading) {
    return (
      <div className="mt-10 text-center">
        <p>Carregando testes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center">
        <p className="text-red-500">{error}</p>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Testes disponíveis</h1>

      {tests.length === 0 ? (
        <p>Não foram encontrados testes.</p>
      ) : (
        <ul className="space-y-4">
          {tests.map((t) => (
            <li key={t.id} className="border rounded-lg p-4 hover:shadow">
              <h2 className="text-xl font-semibold">
                {t.title || t.name || `Test #${t.id}`}
              </h2>

              {t.description && (
                <p className="text-gray-600 mt-2">{t.description}</p>
              )}

              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => router.push(`/test/${t.id}`)}
              >
                Iniciar Teste
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
