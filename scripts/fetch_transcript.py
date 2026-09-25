# /// script
# requires-python = ">=3.11"
# dependencies = ["yt-dlp"]
# ///
"""
Fetch YouTube captions (the video itself is never downloaded) and build a word-timed transcript.

Usage:
    uv run scripts/fetch_transcript.py <youtube-url-or-id> [--lang fr]

Outputs:
    src/data/videos/<id>/transcript.json   -> segments with per-word timings (used by the UI)
    analysis/<id>/transcript.txt           -> one segment per line, for the analysis agents
    src/data/videos.json                   -> refreshed video index
"""
from __future__ import annotations

import argparse
import json
import re
import urllib.request

import yt_dlp

from _common import ROOT, analysis_dir, transcript_path, video_id_from, write_index

PUNCT_END = re.compile(r"[.?!…]$")
PUNCT_SOFT = re.compile(r"[,;:]$")


def fetch_json3(video_id: str, lang: str) -> tuple[dict, dict]:
    opts = {"skip_download": True, "quiet": True, "no_warnings": True}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
    manual = info.get("subtitles") or {}
    auto = info.get("automatic_captions") or {}
    # manual subtitles first (better quality), then auto captions in the original language
    candidates = [(manual, lang), (auto, f"{lang}-orig"), (auto, lang)]
    for source, key in candidates:
        for f in source.get(key) or []:
            if f.get("ext") == "json3":
                with urllib.request.urlopen(f["url"]) as r:
                    return info, json.load(r)
    available = sorted(set(manual) | set(auto))
    raise SystemExit(f"No json3 captions in '{lang}' for {video_id}. Available: {available[:30]}")


def extract_words(data: dict) -> list[dict]:
    words: list[dict] = []
    for ev in data.get("events", []):
        base = ev.get("tStartMs", 0)
        for seg in ev.get("segs", []) or []:
            w = (seg.get("utf8") or "").strip()
            if not w:
                continue
            words.append({"w": w, "t": round((base + seg.get("tOffsetMs", 0)) / 1000.0, 3)})
    for i, w in enumerate(words):
        nxt = words[i + 1]["t"] if i + 1 < len(words) else w["t"] + 0.6
        w["e"] = round(min(max(nxt, w["t"] + 0.05), w["t"] + 1.5), 3)
    return words


def segment(words: list[dict]) -> list[dict]:
    segments: list[dict] = []
    cur: list[dict] = []

    def flush() -> None:
        if not cur:
            return
        segments.append(
            {
                "id": f"s{len(segments) + 1:03d}",
                "start": cur[0]["t"],
                "end": cur[-1]["e"],
                "text": " ".join(w["w"] for w in cur),
                "words": [{"w": w["w"], "t": w["t"], "e": w["e"]} for w in cur],
            }
        )
        cur.clear()

    for w in words:
        if cur:
            gap = w["t"] - cur[-1]["e"]
            prev = cur[-1]["w"]
            n = len(cur)
            # captions without punctuation (older videos) rely on pauses and a hard cap
            if (
                (gap > 1.4 and n >= 3)
                or (PUNCT_END.search(prev) and n >= 5)
                or (n >= 18 and gap > 0.6)
                or (n >= 28 and (PUNCT_SOFT.search(prev) or gap > 0.3))
                or n >= 36
            ):
                flush()
        cur.append(w)
    flush()
    return segments


def fmt_ts(sec: float) -> str:
    m, s = divmod(int(sec), 60)
    return f"{m:02d}:{s:02d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("video", help="YouTube URL or 11-char video id")
    ap.add_argument("--lang", default="fr", help="caption language (default: fr)")
    ap.add_argument("--force", action="store_true", help="overwrite an existing transcript even if analyses exist")
    args = ap.parse_args()
    vid = video_id_from(args.video)

    existing = [p for p in ("speakers.json", "fallacies.json", "facts.json", "habermas.json") if (analysis_dir(vid) / p).exists()]
    if existing and transcript_path(vid).exists() and not args.force:
        raise SystemExit(
            f"{vid}: transcript already exists and analyses reference its segment ids ({', '.join(existing)}). "
            "Re-segmenting would invalidate them; pass --force to overwrite anyway."
        )

    info, data = fetch_json3(vid, args.lang)
    words = extract_words(data)
    segments = segment(words)
    out = {
        "videoId": vid,
        "title": info.get("title"),
        "channel": info.get("uploader"),
        "uploadDate": info.get("upload_date"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "language": args.lang,
        "segments": segments,
    }
    tp = transcript_path(vid)
    tp.parent.mkdir(parents=True, exist_ok=True)
    tp.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    ad = analysis_dir(vid)
    ad.mkdir(parents=True, exist_ok=True)
    lines = [
        f"# {out['title']}",
        f"# channel: {out['channel']}  date: {out['uploadDate']}  duration: {out['duration']}s  videoId: {vid}",
        "",
    ]
    for s in segments:
        lines.append(f"[{s['id']} {fmt_ts(s['start'])}-{fmt_ts(s['end'])}] {s['text']}")
    (ad / "transcript.txt").write_text("\n".join(lines), encoding="utf-8")
    write_index()
    print(f"{vid}: {len(words)} words -> {len(segments)} segments, {out['duration']}s")
    print(f"  {tp.relative_to(ROOT)}")
    print(f"  {(ad / 'transcript.txt').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
