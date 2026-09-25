"""Shared helpers for the rhetoriq scripts (stdlib only)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS_DIR = ROOT / "src" / "data" / "videos"
ANALYSIS_DIR = ROOT / "analysis"
INDEX_FILE = ROOT / "src" / "data" / "videos.json"

_ID_RE = re.compile(r"(?:v=|youtu\.be/|shorts/|embed/|live/)([\w-]{11})")


def video_id_from(arg: str) -> str:
    """Accept a YouTube URL or a bare 11-char id."""
    m = _ID_RE.search(arg)
    if m:
        return m.group(1)
    if re.fullmatch(r"[\w-]{11}", arg):
        return arg
    raise SystemExit(f"Cannot extract a YouTube video id from: {arg}")


def transcript_path(vid: str) -> Path:
    return VIDEOS_DIR / vid / "transcript.json"


def analysis_out_path(vid: str) -> Path:
    return VIDEOS_DIR / vid / "analysis.json"


def analysis_dir(vid: str) -> Path:
    return ANALYSIS_DIR / vid


def load_transcript(vid: str) -> dict:
    p = transcript_path(vid)
    if not p.exists():
        raise SystemExit(f"{p.relative_to(ROOT)} missing: run `uv run scripts/fetch_transcript.py {vid}` first")
    return json.loads(p.read_text(encoding="utf-8"))


def norm(s: str) -> str:
    """Lowercase, strip accents-insensitive punctuation, collapse spaces (for tolerant quote matching)."""
    return re.sub(r"[^\w]+", " ", s.lower()).strip()


def write_index() -> list[dict]:
    """Regenerate src/data/videos.json from the per-video folders (used by the gallery page)."""
    entries = []
    for tp in sorted(VIDEOS_DIR.glob("*/transcript.json")):
        t = json.loads(tp.read_text(encoding="utf-8"))
        ap = tp.parent / "analysis.json"
        stats = {"fallacy": 0, "rhetoric": 0, "fact": 0, "avgFakeness": None, "moments": 0, "habermas": None}
        speakers: list[str] = []
        chapters = 0
        if ap.exists():
            a = json.loads(ap.read_text(encoding="utf-8"))
            fakes = []
            for ann in a.get("annotations", []):
                k = ann.get("kind")
                if k in stats:
                    stats[k] += 1
                if k == "fact" and isinstance(ann.get("fakeness"), (int, float)):
                    fakes.append(ann["fakeness"])
            stats["avgFakeness"] = round(sum(fakes) / len(fakes)) if fakes else None
            hab = a.get("habermas") or {}
            stats["moments"] = len(hab.get("moments") or [])
            stats["habermas"] = ((hab.get("ideal_speech") or {}).get("overall") or {}).get("score")
            speakers = [s.get("name", k) for k, s in (a.get("speakers") or {}).items() if s.get("kind") != "moderator"]
            chapters = len(a.get("chapters") or [])
        entries.append(
            {
                "id": t["videoId"],
                "title": t.get("title") or t["videoId"],
                "channel": t.get("channel"),
                "uploadDate": t.get("uploadDate"),
                "duration": t.get("duration"),
                "thumbnail": t.get("thumbnail"),
                "segments": len(t.get("segments", [])),
                "chapters": chapters,
                "annotations": stats["fallacy"] + stats["rhetoric"] + stats["fact"],
                "hasAnalysis": ap.exists(),
                "speakers": speakers,
                "stats": stats,
            }
        )
    entries.sort(key=lambda e: (e["uploadDate"] or ""), reverse=True)
    INDEX_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=1), encoding="utf-8")
    return entries
