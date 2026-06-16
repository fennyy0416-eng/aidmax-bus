# Web Fetch Mirrors

`raw.githubusercontent.com` may be unavailable to some agent `web_fetch` tools.
For future AidMax intake reports, keep the repo Markdown file and also mirror it
as a normal HTML page under `docs/intake/`.

## Standard Flow

After creating a new weekly file such as:

```text
intake/fafsa-intake-YYYY-MM-DD.md
```

run:

```bash
python3 tools/mirror_intake_for_web_fetch.py
```

Then commit both the Markdown report and the generated HTML mirrors:

```text
docs/intake/fafsa-intake-YYYY-MM-DD.html
docs/intake/latest.html
docs/intake/index.html
```

## Claude Code Read Path

If GitHub Pages is enabled for this repo from the `docs/` folder, Claude Code can
read the latest intake report from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/intake/latest.html
```

It can read a dated report from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/intake/fafsa-intake-YYYY-MM-DD.html
```

Keep the original Markdown in `intake/` as the source of truth. The `docs/`
version is only a web_fetch-friendly mirror.
