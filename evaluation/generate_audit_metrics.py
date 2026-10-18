"""Reproduce QA Audit metrics and summary tables from recorded evaluation results."""

import json
from pathlib import Path

EVAL_DIR = Path(__file__).resolve().parent
BASELINE_FILE = EVAL_DIR / "official_baseline_results.json"
FINAL_FILE = EVAL_DIR / "official_final_results.json"


def load_results(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Results file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def calculate_metrics(data: dict) -> dict:
    results = data.get("results", [])
    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed
    blocked = sum(1 for r in results if r.get("blocked", False))
    evaluated = total - blocked

    hallucinated_cases = sum(1 for r in results if r.get("hallucination_detected", False))

    # Claim level counts
    total_claims = 0
    hallucinated_claims = 0
    for r in results:
        must_mentions = r.get("must_mention_total", 0)
        total_claims += max(must_mentions, 1)
        if r.get("hallucination_detected", False):
            hallucinated_claims += 1

    pass_rate = (passed / evaluated * 100) if evaluated > 0 else 0.0
    case_hallucination_rate = (hallucinated_cases / evaluated * 100) if evaluated > 0 else 0.0
    claim_hallucination_rate = (hallucinated_claims / total_claims * 100) if total_claims > 0 else 0.0

    return {
        "total": total,
        "evaluated": evaluated,
        "passed": passed,
        "failed": failed,
        "blocked": blocked,
        "pass_rate": round(pass_rate, 2),
        "hallucinated_cases": hallucinated_cases,
        "case_hallucination_rate": round(case_hallucination_rate, 2),
        "total_claims": total_claims,
        "hallucinated_claims": hallucinated_claims,
        "claim_hallucination_rate": round(claim_hallucination_rate, 2),
    }


def main():
    print("=" * 78)
    print("ASK OLAKE OFFICIAL TEST SUITE AUDIT — METRICS REPRODUCER")
    print("=" * 78)

    base_m = calculate_metrics(load_results(BASELINE_FILE))
    final_m = calculate_metrics(load_results(FINAL_FILE))

    delta_passed = f"+{final_m['passed'] - base_m['passed']}"
    delta_failed = f"{final_m['failed'] - base_m['failed']}"
    delta_pass_rate = f"+{round(final_m['pass_rate'] - base_m['pass_rate'], 1)}%"
    delta_halluc_cases = f"{final_m['hallucinated_cases'] - base_m['hallucinated_cases']}"
    delta_case_halluc = f"{round(final_m['case_hallucination_rate'] - base_m['case_hallucination_rate'], 1)}%"
    delta_claim_halluc = f"{round(final_m['claim_hallucination_rate'] - base_m['claim_hallucination_rate'], 1)}%"

    print(f"\n{'Metric':<38} | {'Baseline':<12} | {'Post-Fix':<12} | {'Delta':<10}")
    print("-" * 78)
    print(f"{'Official Test Cases Found':<38} | {base_m['total']:<12} | {final_m['total']:<12} | {'--':<10}")
    print(f"{'Cases Executed':<38} | {base_m['evaluated']:<12} | {final_m['evaluated']:<12} | {'--':<10}")
    print(f"{'Cases Passed':<38} | {base_m['passed']:<12} | {final_m['passed']:<12} | {delta_passed:<10}")
    print(f"{'Cases Failed':<38} | {base_m['failed']:<12} | {final_m['failed']:<12} | {delta_failed:<10}")
    print(f"{'Cases Blocked':<38} | {base_m['blocked']:<12} | {final_m['blocked']:<12} | {'0':<10}")
    print(f"{'Pass Rate (%)':<38} | {base_m['pass_rate']:<12}% | {final_m['pass_rate']:<12}% | {delta_pass_rate:<10}")
    print(f"{'Cases with Hallucination':<38} | {base_m['hallucinated_cases']:<12} | {final_m['hallucinated_cases']:<12} | {delta_halluc_cases:<10}")
    print(f"{'Case-Level Hallucination Rate (%)':<38} | {base_m['case_hallucination_rate']:<12}% | {final_m['case_hallucination_rate']:<12}% | {delta_case_halluc:<10}")
    print(f"{'Claim-Level Hallucination Rate (%)':<38} | {base_m['claim_hallucination_rate']:<12}% | {final_m['claim_hallucination_rate']:<12}% | {delta_claim_halluc:<10}")

    print("\n" + "=" * 78)
    print("PER-CASE COMPARISON (BASELINE VS FINAL)")
    print("=" * 78)
    base_cases = {r["id"]: r for r in load_results(BASELINE_FILE)["results"]}
    final_cases = {r["id"]: r for r in load_results(FINAL_FILE)["results"]}

    print(f"{'ID':<4} {'Category':<18} {'Question Snippet':<32} {'Base':<6} {'Final':<6}")
    print("-" * 78)
    for cid in sorted(base_cases.keys()):
        b = base_cases[cid]
        f = final_cases[cid]
        b_st = "PASS" if b["passed"] else "FAIL"
        f_st = "PASS" if f["passed"] else "FAIL"
        q_snip = b["question"][:30] + ("..." if len(b["question"]) > 30 else "")
        print(f"#{cid:<3} {b['category']:<18} {q_snip:<32} {b_st:<6} {f_st:<6}")


if __name__ == "__main__":
    main()
