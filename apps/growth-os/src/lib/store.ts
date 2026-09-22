"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import { DEMO_PRODUCT } from "./demo-data";
import {
  buildCalendar,
  buildLearningReport,
  computeReadiness,
  generateAssets,
  routeChannels,
  runDiagnosis,
} from "./mock-engine";
import type {
  AssetStatus,
  CalendarTask,
  CampaignAsset,
  Channel,
  Diagnosis,
  LearningReport,
  Product,
  ReadinessReport,
  ScenarioKey,
  Strategy,
} from "./types";

export type Phase = "intake" | "readiness" | "diagnosis" | "strategy" | "assets" | "report";

interface AppState {
  product: Product | null;
  readiness: ReadinessReport | null;
  diagnosis: Diagnosis | null;
  strategy: Strategy | null;
  assets: CampaignAsset[];
  tasks: CalendarTask[];
  scenario: ScenarioKey;
  diagnosisLoading: boolean;
  generateLoading: boolean;

  loadDemoProduct: () => void;
  saveProduct: (product: Omit<Product, "id" | "createdAt"> & { id?: string }) => void;
  runDiagnosisAction: () => Promise<void>;
  setBudgets: (budgets: Record<Channel, number>) => void;
  generateCampaign: () => Promise<void>;
  updateAssetField: (assetId: string, fieldKey: string, value: string | string[]) => void;
  setAssetStatus: (assetId: string, status: AssetStatus, note?: string) => void;
  setScenario: (scenario: ScenarioKey) => void;
  resetAll: () => void;
}

const emptyDownstream = {
  diagnosis: null,
  strategy: null,
  assets: [] as CampaignAsset[],
  tasks: [] as CalendarTask[],
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      product: null,
      readiness: null,
      diagnosis: null,
      strategy: null,
      assets: [],
      tasks: [],
      scenario: "A",
      diagnosisLoading: false,
      generateLoading: false,

      loadDemoProduct: () => {
        const product: Product = { ...DEMO_PRODUCT, createdAt: Date.now() };
        set({ product, readiness: computeReadiness(product), ...emptyDownstream });
      },

      saveProduct: (input) => {
        const product: Product = {
          ...input,
          id: input.id ?? `p-${Date.now()}`,
          createdAt: Date.now(),
        };
        set({ product, readiness: computeReadiness(product), ...emptyDownstream });
      },

      runDiagnosisAction: async () => {
        const product = get().product;
        if (!product) return;
        set({ diagnosisLoading: true });
        await wait(900);
        const diagnosis = runDiagnosis(product);
        const strategy = routeChannels(product);
        set({ diagnosis, strategy, diagnosisLoading: false });
      },

      setBudgets: (budgets) => {
        const strategy = get().strategy;
        if (!strategy) return;
        set({
          strategy: {
            ...strategy,
            allocations: strategy.allocations.map((a) => ({
              ...a,
              budgetPercent: budgets[a.channel] ?? a.budgetPercent,
            })),
          },
        });
      },

      generateCampaign: async () => {
        const { product, strategy, assets: previous } = get();
        if (!product || !strategy) return;
        set({ generateLoading: true });
        await wait(1100);
        const fresh = generateAssets(product, strategy);
        const byTitle = new Map(previous.map((a) => [a.title, a]));
        const merged = fresh.map((a) => {
          const old = byTitle.get(a.title);
          if (!old) return a;
          return {
            ...a,
            status: old.status,
            changeNote: old.changeNote,
            fields: a.fields.map((f) => {
              const oldField = old.fields.find((x) => x.key === f.key);
              return oldField && f.editable ? { ...f, value: oldField.value } : f;
            }),
          };
        });
        set({
          assets: merged,
          tasks: buildCalendar(product, strategy, merged),
          generateLoading: false,
        });
      },

      updateAssetField: (assetId, fieldKey, value) => {
        set({
          assets: get().assets.map((a) =>
            a.id === assetId
              ? {
                  ...a,
                  updatedAt: Date.now(),
                  fields: a.fields.map((f) => (f.key === fieldKey ? { ...f, value } : f)),
                }
              : a,
          ),
        });
      },

      setAssetStatus: (assetId, status, note) => {
        set({
          assets: get().assets.map((a) =>
            a.id === assetId
              ? { ...a, status, changeNote: status === "changes_requested" ? note : undefined, updatedAt: Date.now() }
              : a,
          ),
        });
      },

      setScenario: (scenario) => set({ scenario }),

      resetAll: () =>
        set({
          product: null,
          readiness: null,
          scenario: "A",
          diagnosisLoading: false,
          generateLoading: false,
          ...emptyDownstream,
        }),
    }),
    {
      name: "growth-os-v1",
      version: 1,
      partialize: (s) => ({
        product: s.product,
        readiness: s.readiness,
        diagnosis: s.diagnosis,
        strategy: s.strategy,
        assets: s.assets,
        tasks: s.tasks,
        scenario: s.scenario,
      }),
    },
  ),
);

/** 避免 SSR / localStorage 水合不一致 */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}

export function useLearningReport(): LearningReport | null {
  const product = useAppStore((s) => s.product);
  const scenario = useAppStore((s) => s.scenario);
  const assets = useAppStore((s) => s.assets);
  if (!product || assets.length === 0) return null;
  return buildLearningReport(scenario, product);
}

export function currentPhase(state: {
  product: Product | null;
  diagnosis: Diagnosis | null;
  strategy: Strategy | null;
  assets: CampaignAsset[];
}): Phase {
  if (!state.product) return "intake";
  if (!state.diagnosis) return "readiness";
  if (!state.strategy) return "diagnosis";
  if (state.assets.length === 0) return "strategy";
  return "assets";
}
