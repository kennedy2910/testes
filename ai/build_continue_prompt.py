def build_continue_prompt(issue_analysis, project_map, allowed_files=None):
    """
    Constrói um prompt seguro e controlado para uso no Continue
    com base na análise do Crew e no project_map.
    """

    project_files = {f["path"]: f for f in project_map.get("files", [])}

    # Se não vier lista explícita, tenta extrair do texto
    cited_files = []
    for path in project_files.keys():
        if path in issue_analysis:
            cited_files.append(path)

    # Se o caller passou allowed_files, usar isso como trava dura
    if allowed_files:
        valid_files = [f for f in allowed_files if f in project_files]
    else:
        valid_files = cited_files

    if not valid_files:
        raise ValueError(
            "Nenhum arquivo válido identificado. "
            "Abortando geração de prompt para evitar alterações perigosas."
        )

    # Detectar stack principal
    frontend = [f for f in valid_files if project_files[f]["layer"] == "frontend"]
    backend = [f for f in valid_files if project_files[f]["layer"] == "backend"]

    stack_info = []
    for f in valid_files:
        meta = project_files[f]
        stack_info.append(
            f"- {f} ({meta['language']}, {meta.get('framework', 'unknown')})"
        )

    prompt = f"""
CONTEXTO GERAL
Este projeto possui a seguinte stack, conforme definido no project_map.json.
Aja ESTRITAMENTE dentro desse contexto.
NÃO invente arquivos, frameworks ou linguagens.

ARQUIVOS AUTORIZADOS PARA ALTERAÇÃO:
{chr(10).join(stack_info)}

OBJETIVO
{extract_objective(issue_analysis)}

INSTRUÇÕES OBRIGATÓRIAS
- NÃO criar novos arquivos
- NÃO alterar arquitetura
- NÃO alterar código fora dos arquivos listados
- NÃO assumir framework diferente do informado
- Fazer alterações mínimas e focadas

INSTRUÇÕES POR CAMADA
"""

    if frontend:
        prompt += f"""
FRONTEND
Arquivos:
{chr(10).join(frontend)}

- Corrigir lógica de estado / renderização conforme descrito
- Garantir que a ação do usuário funcione na PRIMEIRA tentativa
"""

    if backend:
        prompt += f"""
BACKEND
Arquivos:
{chr(10).join(backend)}

- Garantir consistência de estado
- Retornar respostas síncronas e completas
- Eliminar dependência de múltiplas chamadas
"""

    prompt += """
RESULTADO ESPERADO
Após aplicar as alterações:
- O problema descrito deve ser resolvido
- Nenhuma funcionalidade fora do escopo deve ser afetada
- O sistema deve funcionar corretamente com UMA única ação do usuário
"""

    return prompt.strip()


def extract_objective(text):
    """
    Extrai o objetivo principal do texto do Crew.
    Fallback simples se não conseguir.
    """
    for line in text.splitlines():
        if "problema" in line.lower() or "objetivo" in line.lower():
            return line.strip()

    return "Corrigir o problema descrito na análise técnica."
