import argparse
from crew import crew

def main():
    parser = argparse.ArgumentParser(
        description="Análise multi-agente do AppTestes"
    )

    parser.add_argument(
        "--mode",
        choices=["architecture", "backend", "qa", "frontend", "all"],
        default="all",
        help="Modo de análise a executar"
    )

    args = parser.parse_args()

    print("📂 Iniciando análise do AppTestes...")
    print(f"🔎 Modo selecionado: {args.mode}")

    # Mapeamento de modos para tasks
    mode_to_tasks = {
        "architecture": ["architecture_overview"],
        "backend": ["backend_analysis"],
        "qa": ["qa_flow_analysis"],
        "frontend": ["frontend_ux_analysis"],
        "all": [
            "architecture_overview",
            "backend_analysis",
            "qa_flow_analysis",
            "frontend_ux_analysis",
        ],
    }

    selected_tasks = mode_to_tasks.get(args.mode, [])

    if not selected_tasks:
        print("❌ Nenhuma task selecionada.")
        return

    # Filtra as tasks no crew
    crew.tasks = [
        task for task in crew.tasks
        if task.name in selected_tasks
    ]

    print(f"🤖 Tasks ativas: {', '.join(selected_tasks)}")
    print("🚀 Executando CrewAI...\n")

    result = crew.kickoff()

    print("\n✅ Análise concluída\n")
    print(result)


if __name__ == "__main__":
    main()
