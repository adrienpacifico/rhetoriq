# /// script
# requires-python = ">=3.11"
# ///
"""
Validate the agent outputs of a video against analysis/SCHEMA.md and the transcript.

Usage:
    uv run scripts/check_analysis.py <video-id> [--file speakers|fallacies|facts|habermas]

Exit code 1 when any error is found. Agents run this until it prints "OK".
"""
from __future__ import annotations

import argparse
import json
import sys

from _common import ROOT, analysis_dir, load_transcript, norm

DIMS = {"truth", "rightness", "sincerity", "comprehensibility"}
FALLACY_KINDS = {"fallacy", "rhetoric"}
VERDICTS = {"true", "mostly_true", "misleading", "mostly_false", "false", "unverifiable"}


def load(path):
    if not path.exists():
        return None, [f"{path.name}: file missing"]
    try:
        return json.loads(path.read_text(encoding="utf-8")), []
    except json.JSONDecodeError as e:
        return None, [f"{path.name}: invalid JSON ({e})"]


def in_range(v, lo=0, hi=100) -> bool:
    return isinstance(v, (int, float)) and lo <= v <= hi


def check_speakers(d, seg_ids, duration) -> list[str]:
    errs = []
    sp = d.get("speakers") or {}
    if not sp:
        errs.append("speakers: empty")
    for sid, info in sp.items():
        for k in ("name", "role", "kind"):
            if not info.get(k):
                errs.append(f"speakers.{sid}: missing '{k}'")
        if info.get("kind") not in ("moderator", "debater"):
            errs.append(f"speakers.{sid}: kind must be moderator|debater")
    turns = d.get("turns") or []
    if len(turns) != len(seg_ids):
        errs.append(f"turns: {len(turns)} entries, expected {len(seg_ids)}")
    for i, t in enumerate(turns[: len(seg_ids)]):
        if t.get("segmentId") != seg_ids[i]:
            errs.append(f"turns[{i}]: segmentId {t.get('segmentId')} != {seg_ids[i]}")
            break
        if t.get("speaker") not in sp:
            errs.append(f"turns[{i}]: unknown speaker {t.get('speaker')}")
    ch = d.get("chapters") or []
    if not 3 <= len(ch) <= 10:
        errs.append(f"chapters: {len(ch)} (expected 3..10)")
    for i, c in enumerate(ch):
        if not c.get("title"):
            errs.append(f"chapters[{i}]: missing title")
        if i and abs(c["start"] - ch[i - 1]["end"]) > 1.0:
            errs.append(f"chapters[{i}]: not contiguous with previous")
    if ch and (ch[0]["start"] > 2 or ch[-1]["end"] < duration - 5):
        errs.append("chapters: must cover the whole video")
    return errs


def check_annotation_common(a, seg_text, speaker_ids) -> list[str]:
    errs = []
    sid = a.get("segmentId")
    if sid not in seg_text:
        return [f"{a.get('id')}: unknown segmentId {sid}"]
    q = a.get("quote") or ""
    if not q:
        errs.append(f"{a.get('id')}: empty quote")
    elif q not in seg_text[sid] and norm(q) not in norm(seg_text[sid]):
        errs.append(f"{a.get('id')}: quote not found in {sid}")
    if speaker_ids and a.get("speaker") not in speaker_ids:
        errs.append(f"{a.get('id')}: unknown speaker {a.get('speaker')}")
    for k in ("title", "explanation", "label", "type"):
        if not a.get(k):
            errs.append(f"{a.get('id')}: missing '{k}'")
    if not in_range(a.get("confidence")):
        errs.append(f"{a.get('id')}: confidence out of range")
    for d in a.get("habermas") or []:
        if d not in DIMS:
            errs.append(f"{a.get('id')}: bad habermas dimension {d}")
    return errs


def check_fallacies(d, seg_text, speaker_ids) -> list[str]:
    errs, seen = [], set()
    anns = d.get("annotations") or []
    if len(anns) < 10:
        errs.append(f"only {len(anns)} annotations (expected 25..45)")
    for a in anns:
        if a.get("id") in seen:
            errs.append(f"duplicate id {a.get('id')}")
        seen.add(a.get("id"))
        errs += check_annotation_common(a, seg_text, speaker_ids)
        if a.get("kind") not in FALLACY_KINDS:
            errs.append(f"{a.get('id')}: kind must be fallacy|rhetoric")
        if not in_range(a.get("severity")):
            errs.append(f"{a.get('id')}: severity out of range")
    return errs


def check_facts(d, seg_text, speaker_ids) -> list[str]:
    errs, seen = [], set()
    anns = d.get("annotations") or []
    if len(anns) < 6:
        errs.append(f"only {len(anns)} annotations (expected 12..20)")
    for a in anns:
        if a.get("id") in seen:
            errs.append(f"duplicate id {a.get('id')}")
        seen.add(a.get("id"))
        errs += check_annotation_common(a, seg_text, speaker_ids)
        if a.get("kind") != "fact":
            errs.append(f"{a.get('id')}: kind must be fact")
        if a.get("verdict") not in VERDICTS:
            errs.append(f"{a.get('id')}: bad verdict {a.get('verdict')}")
        if not in_range(a.get("fakeness")):
            errs.append(f"{a.get('id')}: fakeness out of range")
        if not a.get("claim"):
            errs.append(f"{a.get('id')}: missing claim")
        srcs = a.get("sources")
        if not isinstance(srcs, list):
            errs.append(f"{a.get('id')}: sources must be a list")
        else:
            for s in srcs:
                if not (isinstance(s, dict) and s.get("title") and str(s.get("url", "")).startswith("http")):
                    errs.append(f"{a.get('id')}: bad source entry")
            if a.get("verdict") != "unverifiable" and not srcs:
                errs.append(f"{a.get('id')}: verdict {a.get('verdict')} needs at least one source")
    return errs


def check_habermas(d, seg_ids, speakers) -> list[str]:
    errs = []
    debaters = [k for k, v in (speakers or {}).items() if v.get("kind") != "moderator"]
    sp = d.get("speakers") or {}
    for sid in debaters or sp.keys():
        s = sp.get(sid)
        if not s:
            errs.append(f"speakers.{sid}: missing")
            continue
        for k in DIMS:
            if not in_range(s.get(k)):
                errs.append(f"speakers.{sid}.{k}: out of range")
        if not s.get("verdict"):
            errs.append(f"speakers.{sid}: missing verdict")
    moments = d.get("moments") or []
    if len(moments) < 8:
        errs.append(f"only {len(moments)} moments (expected 12..25)")
    seg_set = set(seg_ids)
    for m in moments:
        if m.get("segmentId") not in seg_set:
            errs.append(f"{m.get('id')}: unknown segmentId")
        if m.get("dimension") not in DIMS:
            errs.append(f"{m.get('id')}: bad dimension")
        if m.get("polarity") not in ("positive", "negative"):
            errs.append(f"{m.get('id')}: bad polarity")
        if m.get("weight") not in (1, 2, 3):
            errs.append(f"{m.get('id')}: weight must be 1..3")
        if speakers and m.get("speaker") not in speakers:
            errs.append(f"{m.get('id')}: unknown speaker {m.get('speaker')}")
        if not m.get("title") or not m.get("note"):
            errs.append(f"{m.get('id')}: missing title/note")
    ideal = d.get("ideal_speech") or {}
    for k in ("equal_participation", "no_coercion", "argument_over_power", "overall"):
        if not in_range((ideal.get(k) or {}).get("score")):
            errs.append(f"ideal_speech.{k}: score out of range")
    if not (ideal.get("overall") or {}).get("verdict"):
        errs.append("ideal_speech.overall: missing verdict")
    return errs


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--file", choices=["speakers", "fallacies", "facts", "habermas"], default=None)
    args = ap.parse_args()
    from _common import video_id_from

    vid = video_id_from(args.video)
    tr = load_transcript(vid)
    seg_ids = [s["id"] for s in tr["segments"]]
    seg_text = {s["id"]: s["text"] for s in tr["segments"]}
    ad = analysis_dir(vid)

    speakers_doc, sp_errs = load(ad / "speakers.json")
    speakers = (speakers_doc or {}).get("speakers") or {}
    speaker_ids = set(speakers)
    if not speakers:
        print(f"[warn] no speakers.json yet: speaker ids not checked", file=sys.stderr)

    report: dict[str, list[str]] = {}
    files = [args.file] if args.file else ["speakers", "fallacies", "facts", "habermas"]
    for name in files:
        doc, errs = (speakers_doc, sp_errs) if name == "speakers" else load(ad / f"{name}.json")
        if doc is not None:
            if name == "speakers":
                errs += check_speakers(doc, seg_ids, tr.get("duration") or seg_ids and tr["segments"][-1]["end"])
            elif name == "fallacies":
                errs += check_fallacies(doc, seg_text, speaker_ids)
            elif name == "facts":
                errs += check_facts(doc, seg_text, speaker_ids)
            elif name == "habermas":
                errs += check_habermas(doc, seg_ids, speakers)
        report[name] = errs

    bad = 0
    for name, errs in report.items():
        status = "OK" if not errs else f"{len(errs)} error(s)"
        print(f"{name:10s} {status}")
        for e in errs[:40]:
            print(f"   - {e}")
        bad += len(errs)
    print("OK" if bad == 0 else f"FAILED ({bad} errors)")
    sys.exit(0 if bad == 0 else 1)


if __name__ == "__main__":
    main()
