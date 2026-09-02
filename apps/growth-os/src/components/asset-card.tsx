"use client";

import { useState } from "react";
import { Check, CircleSlash, Pencil, Send, Undo2, X } from "lucide-react";
import type { AssetField, CampaignAsset } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { AssetStatusBadge } from "./status-badge";
import { CHANNEL_LABEL } from "./channel-allocation";
import { Button } from "./ui";

function FieldView({ field }: { field: AssetField }) {
  if (field.type === "list") {
    const items = Array.isArray(field.value) ? field.value : [field.value];
    return (
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
            <span className="w-4 shrink-0 text-right text-ink-muted tabular-nums">{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-ink-soft">
      {String(field.value)}
    </p>
  );
}

function FieldEdit({
  field,
  onChange,
}: {
  field: AssetField;
  onChange: (value: string | string[]) => void;
}) {
  const shared =
    "w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-[13px] leading-relaxed text-ink outline-none focus:border-ink";
  if (field.type === "list") {
    const items = Array.isArray(field.value) ? field.value : [String(field.value)];
    return (
      <textarea
        className={`${shared} min-h-32`}
        value={items.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
      />
    );
  }
  if (field.type === "multiline") {
    return (
      <textarea
        className={`${shared} min-h-24`}
        value={String(field.value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input className={shared} value={String(field.value)} onChange={(e) => onChange(e.target.value)} />
  );
}

export function AssetCard({ asset, compact = false }: { asset: CampaignAsset; compact?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [changeMode, setChangeMode] = useState(false);
  const [note, setNote] = useState(asset.changeNote ?? "");
  const [expanded, setExpanded] = useState(!compact);
  const updateAssetField = useAppStore((s) => s.updateAssetField);
  const setAssetStatus = useAppStore((s) => s.setAssetStatus);

  const approve = () => {
    if (asset.requiresSpendApproval) {
      const ok = confirm(
        `这个动作会产生真实广告花费。\n\n${asset.title}\n${asset.budgetNote ?? ""}\n\n批准后仍需你自己在广告后台手动创建，本系统不会自动投放。确认批准吗？`,
      );
      if (!ok) return;
    }
    setAssetStatus(asset.id, "approved");
    setChangeMode(false);
  };

  return (
    <article className="rounded-xl border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-line-strong bg-surface-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
              {CHANNEL_LABEL[asset.channel]}
            </span>
            <AssetStatusBadge status={asset.status} />
            {asset.requiresSpendApproval ? (
              <span className="rounded-md border border-clay/30 bg-clay-soft px-1.5 py-0.5 text-[11px] font-medium text-clay">
                涉及广告花费 · 需单独确认
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-[15px] font-semibold text-ink">{asset.title}</h3>
          <p className="mt-0.5 text-[13px] text-ink-muted">{asset.subtitle}</p>
        </div>
        {compact ? (
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "收起" : "展开"}
          </Button>
        ) : null}
      </header>

      {expanded ? (
        <>
          <div className="space-y-4 px-5 py-4">
            {asset.fields.map((field) => (
              <div key={field.key}>
                <div className="mb-1.5 flex items-center gap-2">
                  <h4 className="text-[13px] font-medium text-ink">{field.label}</h4>
                  {field.editable ? (
                    <span className="rounded border border-line px-1 py-0.5 text-[10px] text-ink-muted">
                      可编辑
                    </span>
                  ) : null}
                </div>
                {editing && field.editable ? (
                  <>
                    <FieldEdit
                      field={field}
                      onChange={(value) => updateAssetField(asset.id, field.key, value)}
                    />
                    {field.hint ? (
                      <p className="mt-1 text-[11px] text-ink-muted">{field.hint}</p>
                    ) : null}
                  </>
                ) : (
                  <FieldView field={field} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-line bg-surface-muted/50 px-5 py-4 text-[13px] leading-relaxed">
            <p className="text-ink-soft">
              <span className="font-medium text-ink">要验证的假设：</span>
              {asset.hypothesis}
            </p>
            <p className="text-sage">
              <span className="font-medium">成功信号：</span>
              {asset.successSignal}
            </p>
            <p className="text-clay">
              <span className="font-medium">失败信号：</span>
              {asset.failSignal}
            </p>
            {asset.budgetNote ? (
              <p className="text-ink-muted">
                <span className="font-medium">预算：</span>
                {asset.budgetNote}
              </p>
            ) : null}
            {asset.changeNote ? (
              <p className="text-clay">
                <span className="font-medium">修改意见：</span>
                {asset.changeNote}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {changeMode ? (
        <div className="border-t border-line px-5 py-4">
          <label className="mb-1.5 block text-[13px] font-medium text-ink">
            要求修改的具体内容
          </label>
          <textarea
            className="min-h-20 w-full rounded-lg border border-line-strong bg-canvas px-3 py-2 text-[13px] text-ink outline-none focus:border-ink"
            placeholder="例如：Hook 太像广告，改成第一人称的真实经历。"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setAssetStatus(asset.id, "changes_requested", note.trim() || "未填写具体修改意见");
                setChangeMode(false);
              }}
            >
              提交修改意见
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setChangeMode(false)}>
              取消
            </Button>
          </div>
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />}
          {editing ? "完成编辑" : "编辑"}
        </Button>
        {asset.status === "draft" ? (
          <Button size="sm" variant="secondary" onClick={() => setAssetStatus(asset.id, "pending")}>
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
            送审
          </Button>
        ) : null}
        <Button size="sm" onClick={approve} disabled={asset.status === "approved"}>
          <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
          Approve
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setChangeMode(true)}>
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          Request Changes
        </Button>
        <Button size="sm" variant="danger" onClick={() => setAssetStatus(asset.id, "paused")}>
          <CircleSlash className="h-3.5 w-3.5" strokeWidth={1.75} />
          Pause
        </Button>
        {asset.status !== "draft" ? (
          <Button size="sm" variant="ghost" onClick={() => setAssetStatus(asset.id, "draft")}>
            <Undo2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            退回草稿
          </Button>
        ) : null}
      </footer>
    </article>
  );
}
