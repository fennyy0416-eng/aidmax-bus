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

## Apps

- `apps/growth-os/` — **US Market Growth OS V1**：面向中国跨境卖家的美国市场增长操作系统（Next.js + mock engine，本地可完整点击测试）。启动方式见 `apps/growth-os/README.md`。
