"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarRange,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  LineChart,
  PackagePlus,
  PenLine,
  RotateCcw,
  Route,
} from "lucide-react";
import { useAppStore, useHydrated } from "@/lib/store";

const NAV = [
  { href: "/", label: "Dashboard", zh: "总览", icon: LayoutDashboard, step: 0 },
  { href: "/intake", label: "Product Intake", zh: "导入商品", icon: PackagePlus, step: 1 },
  { href: "/diagnosis", label: "Market Diagnosis", zh: "市场诊断", icon: Compass, step: 2 },
  { href: "/strategy", label: "Channel Strategy", zh: "渠道策略", icon: Route, step: 3 },
  { href: "/studio", label: "Creative Studio", zh: "执行资产", icon: PenLine, step: 4 },
  { href: "/calendar", label: "Experiment Calendar", zh: "实验日历", icon: CalendarRange, step: 5 },
  { href: "/approvals", label: "Approval Center", zh: "审批中心", icon: ClipboardCheck, step: 6 },
  { href: "/report", label: "Learning Report", zh: "学习报告", icon: LineChart, step: 7 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const product = useAppStore((s) => s.product);
  const diagnosis = useAppStore((s) => s.diagnosis);
  const assets = useAppStore((s) => s.assets);
  const resetAll = useAppStore((s) => s.resetAll);

  const done = (step: number) => {
    if (!hydrated) return false;
    if (step === 1) return !!product;
    if (step === 2 || step === 3) return !!diagnosis;
    if (step >= 4 && step <= 6) return assets.length > 0;
    if (step === 7) return assets.length > 0;
    return false;
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-line bg-surface lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-ink">US Market Growth OS</p>
            <p className="mt-0.5 text-[11px] text-ink-muted">V1 · Demo 数据 · Mock engine</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("重新开始会清空当前商品、诊断结果和所有审批状态，确定吗？")) resetAll();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs text-ink-soft transition-colors hover:bg-surface-muted lg:hidden"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            重新开始
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-4">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors lg:shrink ${
                  active ? "bg-ink text-canvas" : "text-ink-soft hover:bg-surface-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="whitespace-nowrap">{item.zh}</span>
                <span
                  className={`hidden text-[11px] lg:inline ${active ? "text-canvas/50" : "text-ink-muted"}`}
                >
                  {item.label}
                </span>
                {done(item.step) ? (
                  <span
                    className={`ml-auto hidden h-1.5 w-1.5 rounded-full lg:block ${
                      active ? "bg-canvas/70" : "bg-sage"
                    }`}
                    aria-hidden
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-line px-5 py-4 lg:block">
          {hydrated && product ? (
            <div className="mb-3">
              <p className="text-[11px] tracking-wide text-ink-muted">当前商品</p>
              <p className="mt-1 text-[13px] leading-snug font-medium text-ink">{product.name}</p>
            </div>
          ) : (
            <p className="mb-3 text-[12px] leading-relaxed text-ink-muted">
              还没有导入商品。从「导入商品」开始，或直接使用 Demo 商品。
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm("重新开始会清空当前商品、诊断结果和所有审批状态，确定吗？")) resetAll();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs text-ink-soft transition-colors hover:bg-surface-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            重新开始一次诊断
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
