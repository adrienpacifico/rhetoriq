# /// script
# requires-python = ">=3.11"
# ///
"""
Merge the agent outputs (analysis/<id>/*.json) into src/data/videos/<id>/analysis.json for the UI,
then refresh the src/data/videos.json index.

Usage:
    uv run scripts/build_analysis.py <video-id-or-url>

Missing inputs are tolerated (warning) so the UI can run with partial analyses. Quotes are
validated against the transcript; non-matching ones are kept but flagged `approx: true`.
"""
from __future__ import annotations

import json
import sys

from _common import ROOT, analysis_dir, analysis_out_path, load_transcript, norm, video_id_from, write_index

DIMS = {"truth", "rightness", "sincerity", "comprehensibility"}


def load(path):
    if not path.exists():
        print(f"[warn] {path.relative_to(ROOT)} missing, skipping", file=sys.stderr)
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"[error] {path.relative_to(ROOT)}: invalid JSON ({e})", file=sys.stderr)
        return None


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    vid = video_id_from(sys.argv[1])
    transcript = load_transcript(vid)
    seg_text = {s["id"]: s["text"] for s in transcript["segments"]}
    ad = analysis_dir(vid)

    speakers_doc = load(ad / "speakers.json") or {}
    fallacies = load(ad / "fallacies.json") or {"annotations": []}
    facts = load(ad / "facts.json") or {"annotations": []}
    habermas = load(ad / "habermas.json")

    speakers: dict[str, dict] = {}
    for sid, info in (speakers_doc.get("speakers") or {}).items():
        kind = info.get("kind") or ("moderator" if "moder" in sid.lower() or "modér" in (info.get("role") or "").lower() else "debater")
        speakers[sid] = {"name": info.get("name") or sid, "role": info.get("role") or "", "party": info.get("party"), "kind": kind}
        if info.get("color"):
            speakers[sid]["color"] = info["color"]

    turns: dict[str, str] = {}
    for t in speakers_doc.get("turns") or []:
        if t.get("speaker") in speakers and t.get("segmentId") in seg_text:
            turns[t["segmentId"]] = t["speaker"]

    annotations = []
    seen: set[str] = set()
    stats = {"ok": 0, "approx": 0, "dropped": 0}
    for a in list(fallacies.get("annotations") or []) + list(facts.get("annotations") or []):
        sid = a.get("segmentId")
        if sid not in seg_text or a.get("id") in seen:
            stats["dropped"] += 1
            print(f"[drop] {a.get('id')}: bad segmentId or duplicate", file=sys.stderr)
            continue
        if speakers and a.get("speaker") not in speakers and sid not in turns:
            stats["dropped"] += 1
            print(f"[drop] {a.get('id')}: unknown speaker {a.get('speaker')}", file=sys.stderr)
            continue
        seen.add(a["id"])
        q = a.get("quote") or ""
        if q and (q in seg_text[sid] or norm(q) in norm(seg_text[sid])):
            a["approx"] = False
            stats["ok"] += 1
        else:
            a["approx"] = True
            stats["approx"] += 1
            print(f"[approx] {a['id']}: quote not found in {sid}", file=sys.stderr)
        if sid in turns:  # diarization is the source of truth for who speaks
            a["speaker"] = turns[sid]
        annotations.append(a)

    hab = None
    if habermas:
        moments = []
        for m in habermas.get("moments") or []:
            if m.get("segmentId") in seg_text and m.get("dimension") in DIMS:
                if m["segmentId"] in turns:
                    m["speaker"] = turns[m["segmentId"]]
                moments.append(m)
        hab = {**habermas, "moments": moments}

    out = {
        "speakers": speakers,
        "turns": turns,
        "chapters": speakers_doc.get("chapters") or [],
        "annotations": annotations,
        "habermas": hab,
    }
    op = analysis_out_path(vid)
    op.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    write_index()
    print(
        f"wrote {op.relative_to(ROOT)}: {len(annotations)} annotations "
        f"(exact {stats['ok']}, approx {stats['approx']}, dropped {stats['dropped']}), "
        f"{len(turns)} turns, {len(out['chapters'])} chapters, "
        f"{len(hab['moments']) if hab else 0} habermas moments, {len(speakers)} speakers"
    )


if __name__ == "__main__":
    main()
