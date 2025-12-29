import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const session_id = router.query.session_id;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Pagamento aprovado ✅</h1>
      <p className="mt-2 text-gray-700">
        Checkout session: <code>{String(session_id || "")}</code>
      </p>
      <p className="mt-4 text-gray-600">
        Próximo passo: validar via webhook e liberar o PDF.
      </p>
    </div>
  );
}
