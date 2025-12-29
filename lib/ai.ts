export async function generateSimpleSummary(payload: {
  dimensions: { dimension: string; score: number }[]
  primary: string
  secondary: string
}) {
  const prompt = `
Você é um psicólogo neuropisicanalista.

Gere UM parágrafo curto de resumo profissional com base no resultado do teste abaixo, seja ele DISC, teste vocacional, profissional ou outro teste.

Perfil:
${payload.dimensions
  .map(d => `- ${d.dimension}: ${d.score}%`)
  .join("\n")}

Perfil predominante: ${payload.primary}
Perfil secundário: ${payload.secondary}

Regras:
- Linguagem clara
- Tom profissional
- Não use termos clínicos
- Não dê recomendações
- Máximo 80 palavras
- Idioma: Português
`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    })
  })

  const data = await res.json()
  return data.choices[0].message.content as string
}
