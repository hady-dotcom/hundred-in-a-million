# 1 (hundred) in a million (static build)
Plain HTML, CSS and JS. No build step, no server code, relative paths only, hash routing.
Works unchanged on GitHub Pages: push this folder's contents to the `gh-pages` branch (or serve `/docs`), then open `https://<user>.github.io/<repo>/`.
Locally: `python3 -m http.server` in this folder.
Data: `data/` (hand-sourced records and overlays) and `harvest/` (harvested records, events, places). Images and media are linked from their sources (Wikimedia Commons, Internet Archive, museums); nothing is rehosted.
Status: prototype; every record is "candidate, unreviewed" with its source linked.
Rebuild from the project: `python3 scripts/build_static.py`.
