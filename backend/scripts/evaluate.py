"""Automated evaluation script for Ask OLake."""

import asyncio
import json
import sys
import os
import time
import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

API_URL = os.getenv("ASK_OLAKE_API_URL", "http://localhost:8000")


async def run_evaluation():
    """Run the evaluation question set against the API."""
    # Load questions
    from pathlib import Path
    base = Path(__file__).resolve().parent
    eval_file = None
    for candidate in [base.parent.parent / "evaluation" / "questions.json", base.parent / "evaluation" / "questions.json"]:
        if candidate.exists():
            eval_file = candidate
            break

    if not eval_file or not eval_file.exists():
        raise FileNotFoundError("Could not find evaluation/questions.json")

    eval_dir = str(eval_file.parent)
    with open(eval_file, "r", encoding="utf-8") as f:
        eval_data = json.load(f)

    questions = eval_data["questions"]
    results = []
    total = len(questions)
    passed = 0

    print(f"=== Ask OLake Evaluation — {total} questions ===\n")

    # Check if remote server is reachable; otherwise use ASGITransport in-process
    use_asgi = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as check_client:
            r = await check_client.get(f"{API_URL}/health")
            if r.status_code != 200:
                use_asgi = True
    except Exception:
        use_asgi = True

    if use_asgi:
        from app.main import app
        transport = httpx.ASGITransport(app=app)
        client_kwargs = {"transport": transport, "base_url": "http://testserver"}
        endpoint = "/ask"
        print("Using in-process ASGI client (FastAPI)\n")
    else:
        client_kwargs = {}
        endpoint = f"{API_URL}/ask"
        print(f"Connecting to live server at {API_URL}\n")

    async with httpx.AsyncClient(timeout=60.0, **client_kwargs) as client:
        for i, q in enumerate(questions):
            print(f"[{i+1}/{total}] {q['category']}: {q['question'][:60]}...")

            start = time.time()
            try:
                if q.get("expect_error"):
                    resp = await client.post(endpoint, json={"question": q["question"]})
                    elapsed = time.time() - start
                    test_passed = resp.status_code == q.get("expected_status", 422)
                    result = {
                        "id": q["id"],
                        "category": q["category"],
                        "question": q["question"],
                        "status_code": resp.status_code,
                        "passed": test_passed,
                        "latency_s": round(elapsed, 2),
                        "reason": "Expected error status" if test_passed else f"Got {resp.status_code}",
                    }
                else:
                    resp = await client.post(endpoint, json={"question": q["question"]})
                    elapsed = time.time() - start
                    data = resp.json()

                    # Check response contract
                    has_answer = "answer" in data and isinstance(data["answer"], str) and len(data["answer"]) > 10
                    has_sources = "sources" in data and isinstance(data["sources"], list)
                    valid_sources = all(s.startswith("http") for s in data.get("sources", []))

                    # Check expected facts
                    answer_lower = data.get("answer", "").lower()
                    facts_found = sum(1 for f in q["expected_facts"] if f.lower() in answer_lower)
                    facts_ratio = facts_found / max(len(q["expected_facts"]), 1)

                    test_passed = has_answer and has_sources and valid_sources and resp.status_code in [200, 503]

                    result = {
                        "id": q["id"],
                        "category": q["category"],
                        "question": q["question"],
                        "status_code": resp.status_code,
                        "answer_length": len(data.get("answer", "")),
                        "num_sources": len(data.get("sources", [])),
                        "sources_valid": valid_sources,
                        "expected_facts_found": f"{facts_found}/{len(q['expected_facts'])}",
                        "facts_ratio": round(facts_ratio, 2),
                        "passed": test_passed,
                        "latency_s": round(elapsed, 2),
                    }

            except Exception as e:
                elapsed = time.time() - start
                result = {
                    "id": q["id"],
                    "category": q["category"],
                    "question": q["question"],
                    "passed": False,
                    "error": str(e),
                    "latency_s": round(elapsed, 2),
                }

            results.append(result)
            status = "✓ PASS" if result["passed"] else "✗ FAIL"
            print(f"  {status} ({result['latency_s']}s)")
            if result["passed"]:
                passed += 1

    # Summary
    print(f"\n=== Results: {passed}/{total} passed ({100*passed//total}%) ===\n")

    # Category breakdown
    from collections import defaultdict
    by_cat = defaultdict(lambda: {"passed": 0, "total": 0})
    for r in results:
        by_cat[r["category"]]["total"] += 1
        if r["passed"]:
            by_cat[r["category"]]["passed"] += 1

    for cat, stats in sorted(by_cat.items()):
        print(f"  {cat}: {stats['passed']}/{stats['total']}")

    # Average latency
    latencies = [r["latency_s"] for r in results if "latency_s" in r]
    if latencies:
        print(f"\n  Avg latency: {sum(latencies)/len(latencies):.2f}s")
        print(f"  Max latency: {max(latencies):.2f}s")

    # Save results
    output_path = os.path.join(eval_dir, "results.json")
    with open(output_path, "w") as f:
        json.dump({
            "summary": {"passed": passed, "total": total, "pass_rate": f"{100*passed//total}%"},
            "results": results,
        }, f, indent=2)
    print(f"\n  Results saved to {output_path}")


if __name__ == "__main__":
    asyncio.run(run_evaluation())
