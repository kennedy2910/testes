import os
import sys

print("=== ENV VARS (OPENAI) ===")
for k, v in os.environ.items():
    if "OPENAI" in k:
        print(k, "=", v)

print("\n=== sys.argv ===")
print(sys.argv)

print("\n=== Python executable ===")
print(sys.executable)

print("\n=== Process ID ===")
print(os.getpid())
