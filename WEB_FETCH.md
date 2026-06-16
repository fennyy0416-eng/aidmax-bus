# Web Fetch Mirrors

`raw.githubusercontent.com` may be unavailable to some agent `web_fetch` tools.
For future AidMax reports, keep the repo Markdown file and also mirror it as a
normal HTML page under `docs/`.

## Standard Flow

After creating a new Monday intake file such as:

```text
intake/fafsa-intake-YYYY-MM-DD.md
```

or syncing a new Wednesday social-monitor file such as:

```text
intake/fafsa-css-social-monitor-YYYY-MM-DD.md
intake/fafsa-css-social-market-trends.md
```

run:

```bash
python3 tools/mirror_intake_for_web_fetch.py
```

Then commit both the Markdown reports and the generated HTML mirrors:

```text
docs/intake/fafsa-intake-YYYY-MM-DD.html
docs/intake/latest.html
docs/intake/index.html
docs/social-monitor/fafsa-css-social-monitor-YYYY-MM-DD.html
docs/social-monitor/latest.html
docs/social-monitor/market-trends.html
docs/social-monitor/index.html
```

## Claude Code Read Paths

If GitHub Pages is enabled for this repo from the `docs/` folder, Claude Code can
read the latest Monday intake report from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/intake/latest.html
```

It can read a dated report from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/intake/fafsa-intake-YYYY-MM-DD.html
```

Claude Code can read the latest Wednesday social-monitor report from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/social-monitor/latest.html
```

It can read the social-monitor trend archive from:

```text
https://fennyy0416-eng.github.io/aidmax-bus/social-monitor/market-trends.html
```

Keep the original Markdown in `intake/` as the source of truth. The `docs/`
version is only a web_fetch-friendly mirror.
