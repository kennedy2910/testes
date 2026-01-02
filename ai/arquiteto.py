import subprocess
import sys

MENU = """
Em que vamos trabalhar agora?

1. UI / UX (layout, responsividade, experiência)
2. Frontend (lógica de tela, estado, eventos)
3. Backend (API, regras, validação)
4. Fluxo do usuário (navegação, cliques, jornadas)
5. Bug específico (cirúrgico, pontual)
6. Arquitetura (análise apenas)

Digite o número da opção:
"""

RESOLVERS = {
    "1": "resolve_ui.py",
    "2": "resolve_frontend.py",
    "3": "resolve_backend.py",
    "4": "resolve_flow.py",
    "5": "resolve_bug.py",
    "6": "analyze_project.py",
}


def main():
    print(MENU)
    choice = input("> ").strip()

    if choice not in RESOLVERS:
        print("❌ Opção inválida. Abortando.")
        sys.exit(1)

    resolver = RESOLVERS[choice]

    print("\nDescreva o problema ou objetivo:")
    problem = input("> ").strip()

    if not problem:
        print("❌ Descrição vazia. Abortando.")
        sys.exit(1)

    print(f"\nOk, chamando agente responsável por {resolver.replace('.py', '')}...\n")

    try:
        subprocess.run(
            ["python", f"ai/{resolver}", problem],
            check=True
        )
    except subprocess.CalledProcessError:
        print("❌ Erro ao executar o resolver.")
        sys.exit(1)


if __name__ == "__main__":
    main()
