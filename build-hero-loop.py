r"""Build the Hello Projects Pro homepage hero loop.

Run:  python build-hero-loop.py

Eight fast-motion clips, none of them used on americaninnovationllc.com — the
two sites should not open with the same footage. The order walks a remodel the
way the page reads: arrive, open the walls, floors, tile, kitchen, the counter
detail, the yard, then back outside.

Two encodes, because a 16:9 background on a phone either crops the sides off or
letterboxes:

  video/hero-loop.mp4         1280x720   desktop and tablet
  video/hero-loop-mobile.mp4   720x1280  centre-cropped to fill a phone

Both silent and small: an autoplaying hero is paid for by the visitor's data.
"""

import os
import subprocess
import sys

FFMPEG = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE = r"C:\ffmpeg\bin\ffprobe.exe"
SRC_DIR = r"C:\Users\realc\Downloads\American Innovation\Videos"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "video")
WORK = os.path.join(os.environ.get("TEMP", "/tmp"), "hpp_hero")

FPS = 24
SHOT = 3.6
XFADE = 0.6

CLIPS = [
    ("Drone_view_of_single-storey_home_20260922222055.mp4", 1.0),   # arrive
    ("Workers_repiping_house_with_PEX_20260922221943.mp4", 1.2),    # open walls
    ("Workers_installing_flooring_in_room_20260922221623.mp4", 1.4),# floors
    ("Workers_tiling_shower_wall_20260922221657.mp4", 1.2),         # bathroom tile
    ("Kitchen_renovation_time-lapse_20260922221919.mp4", 1.4),      # kitchen
    ("Camera_tracking_along_quartz_cou…_20260922222540.mp4", 1.0),  # the finish
    ("Workers_building_patio_and_yard_20260922222048.mp4", 1.2),    # outside
    ("Drone_view_of_single-storey_home_20260922222142.mp4", 1.0),   # close
]


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(args[:8]), "...")
        print(r.stderr[-1500:])
        sys.exit(1)


def prep(src, start, out, w, h):
    vf = (f"scale={w}:{h}:force_original_aspect_ratio=increase,"
          f"crop={w}:{h},setsar=1,fps={FPS},format=yuv420p")
    run([FFMPEG, "-v", "error", "-y", "-ss", str(start), "-t", str(SHOT),
         "-i", src, "-an", "-vf", vf,
         "-c:v", "libx264", "-crf", "20", "-preset", "medium", out])


def stitch(parts, out):
    inputs = []
    for p in parts:
        inputs += ["-i", p]
    filters, prev, offset = [], "0:v", 0.0
    for i in range(1, len(parts)):
        offset += SHOT - XFADE
        filters.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}[x{i}]")
        prev = f"x{i}"
    args = [FFMPEG, "-v", "error", "-y", *inputs]
    if filters:
        args += ["-filter_complex", ";".join(filters), "-map", f"[{prev}]"]
    args += ["-c:v", "libx264", "-crf", "30", "-maxrate", "1800k", "-bufsize", "3600k",
             "-preset", "slow", "-pix_fmt", "yuv420p", "-g", str(FPS * 2),
             "-movflags", "+faststart", "-an", out]
    run(args)


def main():
    os.makedirs(WORK, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, (w, h, outfile) in {
        "desktop": (1280, 720, "hero-loop.mp4"),
        "mobile": (720, 1280, "hero-loop-mobile.mp4"),
    }.items():
        parts = []
        for i, (clip, start) in enumerate(CLIPS):
            src = os.path.join(SRC_DIR, clip)
            if not os.path.exists(src):
                print("missing, skipping:", clip)
                continue
            p = os.path.join(WORK, f"{name}_{i}.mp4")
            prep(src, start, p, w, h)
            parts.append(p)
        if not parts:
            print("no clips for", name)
            continue
        out = os.path.join(OUT_DIR, outfile)
        stitch(parts, out)
        dur = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration",
                              "-of", "default=nw=1:nk=1", out], capture_output=True, text=True).stdout.strip()
        print(f"{outfile:22} {float(dur):5.1f}s  {os.path.getsize(out)/1024/1024:5.2f} MB  {w}x{h}")

    poster = os.path.join(OUT_DIR, "hero-poster.jpg")
    run([FFMPEG, "-v", "error", "-y", "-ss", "1.0",
         "-i", os.path.join(OUT_DIR, "hero-loop.mp4"), "-frames:v", "1", "-q:v", "4", poster])
    print(f"{'hero-poster.jpg':22} {os.path.getsize(poster)/1024:5.0f} KB")


if __name__ == "__main__":
    main()
