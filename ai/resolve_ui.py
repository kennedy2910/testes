import sys
import json
from crewai import Agent, Task, Crew

DOMAIN_RULES = """
Você é um especialista em UI/UX e Frontend Visual.

REGRAS ABSOLUTAS:
- NÃO alterar lógica de negócio
- NÃO alterar backend
- NÃO alterar APIs
- NÃO criar novos arquivos
- NÃO mudar arquitetura
- NÃO assumir framework diferente do informado
- NÃO sugerir Stripe, autenticação ou regras de pagamento

PERMITIDO:
- Ajustes de layout
- Melhorias de UX
- Responsividade
- Hierarquia visual
- Microinterações
- Estados visuais (loading, disabled)
- Acessibilidade básica

Trabalhe SOMENTE nos arquivos frontend listados no project_map.json.
"""

def load_project_map():
    with open("ai/project_map.json", "r", encoding="utf-8") as f:
        return json.load(f)

def build_agent():
    return Agent(
        role="UI/UX Frontend Specialist",
        goal="Melhorar UI/UX e responsividade sem alterar lógica",
        backstory=DOMAIN_RULES,
        verbose=False
    )

def build_task(problem_description, project_map, agent):
    frontend_files = [
        f["path"]
        for f in project_map.get("files", [])
        if f.get("layer") == "frontend"
    ]

    description = f"""
Problema informado pelo usuário:
"{problem_description}"

Contexto do projeto:
- Stack e arquivos estão definidos no project_map.json
- Você só pode atuar em UI/UX e responsividade

Arquivos frontend disponíveis:
{frontend_files}

OBJETIVO:
- Propor melhorias claras de UI/UX
- Tornar as telas mais responsivas
- Melhorar experiência do usuário
- NÃO alterar comportamento funcional

FORMATO DA RESPOSTA (OBRIGATÓRIO):

1. RESUMO EXECUTIVO (máx 5 linhas)
2. MELHORIAS DE UX (lista objetiva)
3. AJUSTES DE RESPONSIVIDADE
4. ARQUIVOS A AJUSTAR (com o que mudar em cada um)
5. PROMPT FINAL PARA CONTINUE (direto, sem explicações)
"""

    return Task(
        description=description,
        expected_output="Análise de UI/UX com prompt final para o Continue",
        agent=agent
    )

def main():
    if len(sys.argv) < 2:
        print("❌ Informe o objetivo de UI/UX")
        sys.exit(1)

    problem_description = sys.argv[1]

    print("🎨 Domínio: UI / UX")
    print(f"🔎 Objetivo: {problem_description}\n")

    project_map = load_project_map()
    agent = build_agent()
    task = build_task(problem_description, project_map, agent)

    crew = Crew(
        agents=[agent],
        tasks=[task],
        verbose=False
    )

    result = crew.kickoff()

    print("\n==============================")
    print("📌 RESULTADO (UI / UX)")
    print("==============================\n")
    print(result)

if __name__ == "__main__":
    main()
