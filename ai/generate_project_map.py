import os
import json

PROJECT_ROOT = "."
OUTPUT_FILE = "ai/project_map.json"

def detect_language(file):
    if file.endswith(".ts") or file.endswith(".tsx"):
        return "typescript"
    if file.endswith(".js"):
        return "javascript"
    if file.endswith(".py"):
        return "python"
    if file.endswith(".html"):
        return "html"
    if file.endswith(".dart"):
        return "dart"
    return "unknown"

def detect_layer(path):
    if path.startswith("pages") or path.startswith("frontend"):
        return "frontend"
    if path.startswith("backend") or "api" in path.lower():
        return "backend"
    return "unknown"

def detect_framework(path):
    if "next" in path.lower():
        return "nextjs"
    if "flutter" in path.lower():
        return "flutter"
    if "fastapi" in path.lower():
        return "fastapi"
    return "unknown"

files = []

for root, dirs, filenames in os.walk(PROJECT_ROOT):
    if root.startswith("./.git") or root.startswith("./node_modules"):
        continue

    for filename in filenames:
        path = os.path.join(root, filename).replace("\\", "/")
        files.append({
            "path": path.lstrip("./"),
            "layer": detect_layer(path),
            "language": detect_language(filename),
            "framework": detect_framework(path),
            "responsibility": "unknown"
        })

project_map = {
    "project": {
        "name": "AppTestes",
        "frontend": {
            "framework": "unknown",
            "language": "unknown"
        },
        "backend": {
            "framework": "unknown",
            "language": "unknown"
        }
    },
    "rules": {
        "assumptions": {
            "allow_framework_assumptions": False,
            "allow_language_assumptions": False
        },
        "instructions": [
            "Nunca inventar arquivos que não estejam listados",
            "Nunca assumir framework não declarado",
            "Se houver dúvida, responder de forma conceitual",
            "Backend é sempre fonte da verdade"
        ]
    },
    "files": files
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(project_map, f, indent=2, ensure_ascii=False)

print(f"✅ project_map.json gerado com {len(files)} arquivos")
