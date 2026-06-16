#!/usr/bin/env python3
"""Mirror AidMax Markdown reports as simple HTML pages.

The HTML mirror is meant for tools that can fetch normal web pages but cannot
fetch raw.githubusercontent.com URLs. It keeps the Markdown text intact inside a
preformatted block so downstream agents can parse it with minimal noise.
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INTAKE_DIR = PROJECT_ROOT / "intake"
DOCS_INTAKE_DIR = PROJECT_ROOT / "docs" / "intake"
DOCS_SOCIAL_DIR = PROJECT_ROOT / "docs" / "social-monitor"
INTAKE_REPORT_PATTERN = re.compile(r"^fafsa-intake-(\d{4}-\d{2}-\d{2})\.md$")
SOCIAL_REPORT_PATTERN = re.compile(r"^fafsa-css-social-monitor-(\d{4}-\d{2}-\d{2})\.md$")
SOCIAL_TRENDS_FILE = "fafsa-css-social-market-trends.md"
DEFAULT_PUBLIC_BASE_URL = "https://fennyy0416-eng.github.io/aidmax-bus"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create web_fetch-friendly HTML mirrors for AidMax reports."
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_PUBLIC_BASE_URL,
        help="Optional public base URL, for example https://fennyy0416-eng.github.io/aidmax-bus",
    )
    args = parser.parse_args()

    intake_reports = sorted(_find_reports(INTAKE_REPORT_PATTERN), key=lambda item: item[0])
    if not intake_reports:
        raise SystemExit("No intake/fafsa-intake-YYYY-MM-DD.md reports found.")

    social_reports = sorted(_find_reports(SOCIAL_REPORT_PATTERN), key=lambda item: item[0])

    intake_count = _mirror_dated_reports(
        reports=intake_reports,
        docs_dir=DOCS_INTAKE_DIR,
        url_dir="intake",
        page_title="AidMax Intake Report",
        output_prefix="fafsa-intake",
        index_title="AidMax Intake Reports",
        base_url=args.base_url,
    )

    social_count = 0
    if social_reports:
        social_count = _mirror_dated_reports(
            reports=social_reports,
            docs_dir=DOCS_SOCIAL_DIR,
            url_dir="social-monitor",
            page_title="AidMax Social Monitor Report",
            output_prefix="fafsa-css-social-monitor",
            index_title="AidMax Social Monitor Reports",
            base_url=args.base_url,
        )

    trends_path = INTAKE_DIR / SOCIAL_TRENDS_FILE
    if trends_path.exists():
        DOCS_SOCIAL_DIR.mkdir(parents=True, exist_ok=True)
        (DOCS_SOCIAL_DIR / "market-trends.html").write_text(
            _render_report_page(
                source_path=trends_path,
                report_label="Market Trends",
                page_title="AidMax Social Monitor Market Trends",
                canonical_url=_join_url(args.base_url, "social-monitor/market-trends.html"),
            ),
            encoding="utf-8",
        )

    print(f"Mirrored {intake_count} intake reports into {DOCS_INTAKE_DIR}")
    if social_count:
        print(f"Mirrored {social_count} social monitor reports into {DOCS_SOCIAL_DIR}")
    if trends_path.exists():
        print(f"Social trends mirror: {DOCS_SOCIAL_DIR / 'market-trends.html'}")
    return 0


def _find_reports(pattern: re.Pattern[str]) -> list[tuple[str, Path]]:
    reports: list[tuple[str, Path]] = []
    for path in INTAKE_DIR.glob("*.md"):
        match = pattern.match(path.name)
        if match:
            reports.append((match.group(1), path))
    return reports


def _mirror_dated_reports(
    reports: list[tuple[str, Path]],
    docs_dir: Path,
    url_dir: str,
    page_title: str,
    output_prefix: str,
    index_title: str,
    base_url: str,
) -> int:
    docs_dir.mkdir(parents=True, exist_ok=True)

    rendered_pages: list[tuple[str, str, Path]] = []
    for report_date, source_path in reports:
        target_path = docs_dir / f"{output_prefix}-{report_date}.html"
        target_path.write_text(
            _render_report_page(
                source_path=source_path,
                report_label=report_date,
                page_title=page_title,
                canonical_url=_join_url(base_url, f"{url_dir}/{target_path.name}"),
            ),
            encoding="utf-8",
        )
        rendered_pages.append((report_date, source_path.name, target_path))

    latest_date, latest_source_name, _latest_target_path = rendered_pages[-1]
    (docs_dir / "latest.html").write_text(
        _render_report_page(
            source_path=INTAKE_DIR / latest_source_name,
            report_label=latest_date,
            page_title=page_title,
            canonical_url=_join_url(base_url, f"{url_dir}/latest.html"),
        ),
        encoding="utf-8",
    )
    (docs_dir / "index.html").write_text(
        _render_index_page(
            rendered_pages=rendered_pages,
            latest_filename="latest.html",
            index_title=index_title,
            base_url=base_url,
            url_dir=url_dir,
        ),
        encoding="utf-8",
    )
    return len(rendered_pages)


def _render_report_page(
    source_path: Path,
    report_label: str,
    page_title: str,
    canonical_url: str,
) -> str:
    markdown_text = source_path.read_text(encoding="utf-8")
    escaped_markdown = html.escape(markdown_text)
    title = f"{page_title} {report_label}".strip()

    return f"""<!doctype html>
<html lang="zh-Hans">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="robots" content="noindex">
  <style>
    body {{
      margin: 0;
      background: #f9f6ef;
      color: #1a2b4a;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      line-height: 1.6;
    }}
    main {{
      max-width: 960px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }}
    h1 {{
      margin: 0 0 8px;
      font-size: 28px;
      line-height: 1.25;
    }}
    .meta {{
      margin: 0 0 24px;
      color: #526071;
      font-size: 14px;
    }}
    pre {{
      margin: 0;
      padding: 20px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      background: #ffffff;
      border: 1px solid #e5dfd3;
      border-radius: 8px;
      color: #172033;
      font-size: 15px;
    }}
    a {{ color: #9a5a00; }}
  </style>
</head>
<body>
  <main>
    <h1>{html.escape(title)}</h1>
    <p class="meta">Source: intake/{source_path.name}{_canonical_note(canonical_url)}</p>
    <pre>{escaped_markdown}</pre>
  </main>
</body>
</html>
"""


def _render_index_page(
    rendered_pages: list[tuple[str, str, Path]],
    latest_filename: str,
    index_title: str,
    base_url: str,
    url_dir: str,
) -> str:
    items = "\n".join(
        f'      <li><a href="{html.escape(path.name)}">{report_date}</a> '
        f'<span>({html.escape(source_name)})</span></li>'
        for report_date, source_name, path in reversed(rendered_pages)
    )
    latest_url = _join_url(base_url, f"{url_dir}/{latest_filename}")

    return f"""<!doctype html>
<html lang="zh-Hans">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(index_title)}</title>
  <meta name="robots" content="noindex">
  <style>
    body {{
      margin: 0;
      background: #f9f6ef;
      color: #1a2b4a;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      line-height: 1.6;
    }}
    main {{
      max-width: 820px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }}
    h1 {{ margin: 0 0 8px; font-size: 28px; }}
    p {{ color: #526071; }}
    a {{ color: #9a5a00; }}
    li {{ margin: 8px 0; }}
    span {{ color: #526071; }}
  </style>
</head>
<body>
  <main>
    <h1>{html.escape(index_title)}</h1>
    <p>Use <a href="{html.escape(latest_filename)}">latest.html</a> for the newest web_fetch-friendly report.{_canonical_note(latest_url)}</p>
    <ul>
{items}
    </ul>
  </main>
</body>
</html>
"""


def _canonical_note(url: str) -> str:
    if not url:
        return ""
    return f' | Public URL: <a href="{html.escape(url)}">{html.escape(url)}</a>'


def _join_url(base_url: str, path: str) -> str:
    if not base_url:
        return ""
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


if __name__ == "__main__":
    raise SystemExit(main())
