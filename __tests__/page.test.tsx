import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Workspace } from "@/components/workspace/Workspace";
import caseDemoData from "@/data/case-demo.json";
import {
  CASE_STORAGE_KEY,
  loadCaseStorage,
  saveCaseStorage,
} from "@/lib/koyasu/storage";
import {
  DEFAULT_PANE1_INTAKE,
  DEFAULT_PANE2_STEP1_HYPOTHESES,
  koyasuCaseSeedSchema,
} from "@/lib/koyasu/schema";

const seed = koyasuCaseSeedSchema.parse(caseDemoData);

describe("workspace-ui-kit smoke tests", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("page module can be imported", async () => {
    const mod = await import("../app/page");
    expect(mod).toBeDefined();
  });

  it("Pane2-Step1 を表示し、localStorage 復元後も hydration mismatch を出さない", async () => {
    vi.useFakeTimers();
    saveCaseStorage({
      case_a00: seed.case_a00,
      selected_phenomenon_id: seed.selected_phenomenon_id,
      phenomena: seed.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        core_phenomenon: "若手が育つ前に離職してしまう",
        gap: "育成の意図はあるのに、現場で機能不全が繰り返される",
      },
      pane2_step1: {
        hypotheses: [
          {
            structural_hypothesis: "会議の決裁者が曖昧",
            evidence: "持ち帰りが繰り返される",
            follow_up_question: "誰が最終判断を持つのか",
          },
          ...DEFAULT_PANE2_STEP1_HYPOTHESES.slice(1),
        ],
      },
    });

    const html = renderToString(<Workspace seed={seed} />);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      await act(async () => {
        hydrateRoot(container, <Workspace seed={seed} />);
      });
      await act(async () => {
        vi.runAllTimers();
        await Promise.resolve();
      });

      expect(container.textContent).toContain("なぜ、このGAPが繰り返し生まれるのか？");
      expect(container.textContent).toContain("責任連鎖のどこで切れているか");
      expect(container.textContent).toContain("仮説の優先度を見立てる");
      expect(container.textContent).toContain("構造仮説マップ");
      expect(container.textContent).toContain("構造図解を見る");
      expect(container.textContent).not.toContain(
        "この構造を変えるなら、どこに最初の一手を入れるか？",
      );

      const openMapButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.includes("構造図解を見る"),
      );
      expect(openMapButton).toBeDefined();
      await act(async () => {
        openMapButton?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });

      expect(document.body.textContent).toContain("責任回避・他部門転嫁");
      expect(document.body.textContent).toContain("再生産ハブ");
      expect(document.body.textContent).toContain("この構造図の見るべき視点");
      expect(document.body.textContent).toContain("背景にある深層条件");
      expect(document.body.textContent).toContain("救済の副作用");
      expect(document.body.textContent).toContain("負荷集中・疲弊");
      expect(document.body.textContent).toContain(
        "この構造を放置すると、問題の温存だけでなく、支える側の疲弊・離脱を招く",
      );
      expect(document.body.textContent).toContain(
        "この構造を変えるなら、どこに最初の一手を入れるか？",
      );
      expect(container.textContent).toContain("介入可能性");
      expect(container.textContent).toContain("若手が育つ前に離職してしまう");
      expect(container.textContent).toContain(
        "育成の意図はあるのに、現場で機能不全が繰り返される",
      );
      expect(container.textContent).toContain("改革戦略設計");
      expect(container.textContent).toContain("SKILL資産化");
      expect(
        container.querySelector('[aria-label="Pane2 構造仮説 1"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Pane2 根拠 1"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Pane2 確認したいこと 1"]'),
      ).not.toBeNull();
      expect(
        container.querySelectorAll('[aria-label^="Pane2 構造仮説 "]'),
      ).toHaveLength(3);
      expect(
        container.querySelector(
          '[aria-label="起票・共有 → 推進責任者決定 に断絶がある"]',
        ),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="仮説 1 をPane3候補にする"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="仮説 1 の説明力"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="仮説 1 の介入可能性"]'),
      ).not.toBeNull();
      expect(
        container.querySelector('[aria-label="Pane2 優先理由 1"]'),
      ).not.toBeNull();
      expect(
        loadCaseStorage(seed).pane2_step1.hypotheses[0].structural_hypothesis,
      ).toBe("会議の決裁者が曖昧");

      const consoleOutput = errorSpy.mock.calls
        .flatMap((call) => call.map(String))
        .join(" ");
      expect(consoleOutput).not.toMatch(/hydration|did not match|server rendered/i);
    } finally {
      errorSpy.mockRestore();
      vi.useRealTimers();
      container.remove();
    }
  });

  it("旧 koyasu:case:v1 でも Pane2-Step1 の default が補われる", () => {
    window.localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify({
      case_a00: seed.case_a00,
      selected_phenomenon_id: seed.selected_phenomenon_id,
      phenomena: seed.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        core_phenomenon: "既存Pane1値",
      },
    }));

    const loaded = loadCaseStorage(seed);
    expect(loaded.pane1_intake.core_phenomenon).toBe("既存Pane1値");
    expect(loaded.pane2_step1.hypotheses).toEqual([
      ...DEFAULT_PANE2_STEP1_HYPOTHESES,
    ]);
    expect(loaded.pane2_step3).toEqual({
      evaluations: [
        {
          explanatory_power: "",
          intervene_ability: "",
          priority_reason: "",
        },
        {
          explanatory_power: "",
          intervene_ability: "",
          priority_reason: "",
        },
        {
          explanatory_power: "",
          intervene_ability: "",
          priority_reason: "",
        },
      ],
      selected_for_pane3: [],
    });
  });
});
