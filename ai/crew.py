import yaml
from pathlib import Path
from crewai import Crew, Agent, Task

BASE_DIR = Path(__file__).parent

# ---------- helpers ----------

def load_yaml(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

# ---------- load configs ----------

agents_config = load_yaml(BASE_DIR / "agents.yaml")
tasks_config = load_yaml(BASE_DIR / "tasks.yaml")

agents = {}
tasks = []

# ---------- create agents ----------

for name, config in agents_config.items():
    agents[name] = Agent(
        role=config["role"],
        goal=config["goal"],
        backstory=config.get("backstory", ""),
        verbose=config.get("verbose", False),
    )

# ---------- create tasks (YAML tasks only) ----------

for task_name, config in tasks_config.items():
    tasks.append(
        Task(
            name=task_name,  # essencial para --mode
            description=config["description"],
            expected_output=config["expected_output"],
            agent=agents[config["agent"]],
        )
    )

# ---------- crew base (usado por analyze_project.py) ----------

from validate_response import validate_response
import json

with open("ai/project_map.json", "r") as f:
    project_map = json.load(f)



crew = Crew(
    agents=list(agents.values()),
    tasks=tasks,
    verbose=True,
)

__all__ = ["crew", "agents"]
