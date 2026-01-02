import os

def read_project_tree(root="."):
    tree = []
    for root_dir, dirs, files in os.walk(root):
        if ".git" in root_dir or "node_modules" in root_dir:
            continue
        for f in files:
            tree.append(os.path.join(root_dir, f))
    return tree