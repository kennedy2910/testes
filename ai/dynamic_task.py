from crewai import Task

def build_dynamic_task(problem, project_map, project_files=None, agent=None):
    description = f"""
Problema específico reportado:
{problem}

REGRAS OBRIGATÓRIAS:
- Use APENAS arquivos existentes no project_map
- NÃO invente frameworks, linguagens ou arquivos
- Se algo não existir, explique conceitualmente
- Seja direto, técnico e acionável

Arquivos do projeto:
{project_files if project_files else "Não fornecidos"}
"""

    return Task(
        description=description.strip(),
        expected_output="""
- Identifique a causa raiz REAL
- Liste arquivos reais afetados
- Explique o que corrigir em cada arquivo
- Gere um PROMPT FINAL pronto para colar no Continue
""".strip(),
        agent=agent,
    )

