#!/usr/bin/env python3
"""
ClaimFlow AI - Unified Cross-Platform Developer CLI
Usage:
    python scripts/dev.py setup       # Install Python & Node dependencies
    python scripts/dev.py start       # Start FastAPI and Vite dev servers concurrently
    python scripts/dev.py test        # Run pytest backend test suite
    python scripts/dev.py evals       # Run LangGraph 15-case golden evaluation suite
    python scripts/dev.py smoke       # Run automated smoke test against running backend
    python scripts/dev.py e2e         # Run Playwright E2E and visual tests
    python scripts/dev.py reset       # Reset demo database to clean initial state
    python scripts/dev.py test-kit    # Regenerate 19 specimen test packets (TC01-TC19)
"""

import sys
import os
import subprocess
import argparse
import time
import urllib.request
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent


def run_command(cmd: list[str], cwd: Path = ROOT_DIR, env: dict = None) -> int:
    env_vars = os.environ.copy()
    if env:
        env_vars.update(env)
    print(f"--> Running: {' '.join(cmd)} (in {cwd})")
    res = subprocess.run(cmd, cwd=str(cwd), env=env_vars)
    return res.returncode


def cmd_setup():
    print("=== ClaimFlow AI Environment Setup ===")
    print("\n1. Installing Python dependencies...")
    ret = run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    if ret != 0:
        print("[!] Failed to install Python dependencies.")
        return ret

    print("\n2. Installing Frontend Node dependencies...")
    frontend_dir = ROOT_DIR / "frontend"
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    ret = run_command([npm_cmd, "install"], cwd=frontend_dir)
    if ret != 0:
        print("[!] Failed to install frontend dependencies.")
        return ret

    print("\n3. Generating Specimen Test Kit (TC01-TC19)...")
    run_command([sys.executable, "scripts/generate_test_kit.py"])

    print("\n[✓] Environment setup completed successfully!")
    return 0


def cmd_start():
    print("=== Starting ClaimFlow AI Services ===")
    print("Backend:  http://localhost:8000")
    print("Frontend: http://localhost:5173")
    print("Press Ctrl+C to stop both processes.\n")

    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
    frontend_dir = ROOT_DIR / "frontend"
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]

    procs = []
    try:
        p_back = subprocess.Popen(backend_cmd, cwd=str(ROOT_DIR))
        procs.append(p_back)
        time.sleep(1)

        p_front = subprocess.Popen(frontend_cmd, cwd=str(frontend_dir))
        procs.append(p_front)

        p_back.wait()
        p_front.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
    finally:
        for p in procs:
            if p.poll() is None:
                p.terminate()
    return 0


def cmd_test():
    print("=== Running Backend Pytest Suite ===")
    return run_command([sys.executable, "-m", "pytest", "tests/"])


def cmd_evals():
    print("=== Running LangGraph Golden Benchmark Evals ===")
    env = {"PYTHONPATH": "."}
    return run_command([sys.executable, "evals/run_evals.py"], env=env)


def cmd_smoke():
    print("=== Running ClaimFlow Smoke Test ===")
    return run_command([sys.executable, "scripts/smoke_test.py"])


def cmd_e2e():
    print("=== Running Playwright E2E & Accessibility Suite ===")
    frontend_dir = ROOT_DIR / "frontend"
    npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
    return run_command([npx_cmd, "playwright", "test"], cwd=frontend_dir)


def cmd_reset():
    print("=== Resetting Demo Database ===")
    try:
        req = urllib.request.Request(
            "http://localhost:8000/api/demo/reset",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[✓] Demo database reset: {data.get('message', 'Success')}")
            return 0
    except Exception as e:
        print(f"[!] Reset failed: Ensure backend server is running on localhost:8000. Error: {e}")
        return 1


def cmd_test_kit():
    print("=== Generating Test Kit Specimen Packets ===")
    return run_command([sys.executable, "scripts/generate_test_kit.py"])


def main():
    parser = argparse.ArgumentParser(
        description="ClaimFlow AI - Unified Developer Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "subcommand",
        choices=["setup", "start", "test", "evals", "smoke", "e2e", "reset", "test-kit"],
        help="Command action to perform"
    )

    args = parser.parse_args()

    commands = {
        "setup": cmd_setup,
        "start": cmd_start,
        "test": cmd_test,
        "evals": cmd_evals,
        "smoke": cmd_smoke,
        "e2e": cmd_e2e,
        "reset": cmd_reset,
        "test-kit": cmd_test_kit,
    }

    exit_code = commands[args.subcommand]()
    sys.exit(exit_code or 0)


if __name__ == "__main__":
    main()
