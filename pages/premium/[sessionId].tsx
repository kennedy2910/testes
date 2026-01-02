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
        `${process.env.NEXT_PUBLIC_PDF_SERVICE_URL || "http://localhost:3000"}/generate-pdf`,
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
    return (
      <p
        style={{
          textAlign: "center",
          marginTop: 40,
          fontSize: "1rem",
        }}
      >
        Carregando relatório...
      </p>
    );
  }

  if (locked) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "60px auto",
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 12 }}>Relatório premium bloqueado</h2>
        <p style={{ opacity: 0.8 }}>
          Conclua o pagamento para liberar o acesso ao relatório completo.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Nenhum dado disponível.
      </p>
    );
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "40px auto",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <header>
        <h2 style={{ marginBottom: 8 }}>{report.title}</h2>
        <p style={{ lineHeight: 1.6 }}>{report.overview}</p>
      </header>

      {report.complement && (
        <section>
          <h3 style={{ marginBottom: 6 }}>Perfil complementar</h3>
          <p style={{ lineHeight: 1.6 }}>{report.complement}</p>
        </section>
      )}

      <p
        style={{
          fontSize: "0.75rem",
          opacity: 0.7,
          marginTop: 12,
        }}
      >
        {report.note}
      </p>

      <button
        onClick={downloadPdf}
        aria-label="Baixar relatório premium em PDF"
        style={{
          marginTop: 32,
          alignSelf: "center",
          padding: "14px 28px",
          fontSize: "1rem",
          fontWeight: 600,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#111",
          color: "#fff",
          minWidth: 240,
          transition: "background-color 0.2s ease, transform 0.1s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#000")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#111")
        }
        onMouseDown={(e) =>
          (e.currentTarget.style.transform = "scale(0.98)")
        }
        onMouseUp={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        📄 Baixar relatório em PDF
      </button>
    </div>
  );
}

