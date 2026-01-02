import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { unlockPremiumReport } from "../../lib/api";

export default function PremiumPage() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(true);
  const [report, setReport] = useState<any | null>(null);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!sessionId || processed) return;

    const numericSessionId = Number(sessionId);
    if (!numericSessionId) return;

    setProcessed(true);

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const primaryProfile = params.get("primary_profile");
        const secondaryProfile = params.get("secondary_profile");
        const stripeSessionId = params.get("stripe_session_id");

        // 1️⃣ Se veio do Stripe, valida/desbloqueia primeiro
        if (stripeSessionId) {
          const unlockResult = await unlockPremiumReport(
            numericSessionId,
            stripeSessionId
          );

          if (!unlockResult?.unlocked) {
            setLocked(true);
            setReport(null);
            return;
          }
        }

        // 2️⃣ Buscar relatório premium (já autorizado)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/premium/report` +
            `?session_id=${numericSessionId}` +
            `&primary_profile=${primaryProfile}` +
            `&secondary_profile=${secondaryProfile}`
        );

        if (res.status === 403 || !res.ok) {
          setLocked(true);
          setReport(null);
          return;
        }

        const data = await res.json();
        setReport(data.report);
        setLocked(false);
      } catch (err) {
        console.error("Erro ao carregar relatório premium:", err);
        setLocked(true);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [sessionId, processed]);

  const downloadPdf = async () => {
    try {
      if (!report) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PDF_SERVICE_URL}/generate-pdf`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao gerar PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-premium.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erro ao baixar o PDF");
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Loading...</p>;
  }

  if (locked) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p>Relatório premium bloqueado.</p>
        <p>Conclua o pagamento para liberar o acesso.</p>
      </div>
    );
  }

  if (!report) {
    return <p style={{ textAlign: "center" }}>No data available.</p>;
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>{report.title}</h2>
      <p>{report.overview}</p>

      {report.complement && (
        <>
          <h3>Perfil complementar</h3>
          <p>{report.complement}</p>
        </>
      )}

      <p style={{ fontSize: 12, opacity: 0.7 }}>{report.note}</p>

      <button
        style={{
          marginTop: 32,
          padding: "14px 24px",
          fontSize: 16,
          fontWeight: 600,
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#111",
          color: "#fff",
        }}
        onClick={downloadPdf}
      >
        📄 Baixar relatório em PDF
      </button>
    </div>
  );
}
