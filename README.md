# aidmax-bus

AidMax content-intelligence delivery repo.

## Reports

Weekly source-material and social-monitor reports live in `intake/`.

For agents that cannot fetch `raw.githubusercontent.com`, mirror intake reports
and Wednesday social-monitor reports as normal HTML pages:

```bash
python3 tools/mirror_intake_for_web_fetch.py
```

See `WEB_FETCH.md` for the Claude Code / `web_fetch` read paths.
