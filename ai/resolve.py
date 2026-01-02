import argparse
import json
from pathlib import Path
from crewai import Crew
from dynamic_task import build_dynamic_task
from crew import agents
from build_continue_prompt import build_continue_prompt


def list_project_files(base_dir: Path):
    files = []
    for path in base_dir.rglob("*"):
        if path.is_file() and not any(
            part in path.parts for part in [
                ".git",
                "__pycache__",
                "node_modules",
                ".next",
                ".venv",
            ]
        ):
            files.append(str(path.relative_to(base_dir)))
    return files


def main():

    parser = argparse.ArgumentParser(
        description="Resolver um problema específico do projeto"
    )
    parser.add_argument(
        "problema",
        type=str,
        help="Descreva o problema que deseja analisar"
    )

    args = parser.parse_args()

    print("🔎 Problema informado:")
    print(args.problema)
    print("\n🤖 Analisando...\n")

    project_root = Path(__file__).parent.parent
    project_files = list_project_files(project_root)

    # 🔹 carregar project_map
    with open(project_root / "ai" / "project_map.json", "r", encoding="utf-8") as f:
        project_map = json.load(f)

    task = build_dynamic_task(
        problem=args.problema,
        project_map=project_map,
        project_files=project_files,
        agent=agents["backend_specialist"],
    )

    issue_crew = Crew(
        agents=[agents["backend_specialist"]],
        tasks=[task],
        verbose=True,
    )

    result = issue_crew.kickoff()

    print("\n✅ Análise concluída\n")
    print(result)

    analysis_text = result.raw if hasattr(result, "raw") else str(result)
    
    continue_prompt = build_continue_prompt(
        issue_analysis=analysis_text,
        project_map=project_map,
        allowed_files=[
            "pages/premium/[sessionId].tsx",
            "lib/api.ts",
            "functions/233704_validate_pdf_claim.xs"
        ]
    )
    
    print("\n📌 PROMPT FINAL PARA O CONTINUE:\n")
    print(continue_prompt)


if __name__ == "__main__":
    main()
