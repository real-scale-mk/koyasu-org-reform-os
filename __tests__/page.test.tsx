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
  DEFAULT_PANE2_STEP3,
  DEFAULT_PANE3_STEP1,
  DEFAULT_PANE3_STEP2,
  DEFAULT_PANE3_STEP3,
  DEFAULT_PANE3_STEP3_FIELD,
  PANE3_STEP3_DEFAULT_PROPOSALS,
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
      expect(container.textContent).toContain(
        "Pane3 Step1–3 | 本丸／最初の一手、役割の引き受け、今回試す BABY STEP",
      );
      expect(container.textContent).toContain(
        "Pane2で優先仮説を選択してください",
      );
      expect(container.textContent).toContain("詳細・旧分析");
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
      expect(loadCaseStorage(seed).pane3_step1).toEqual(DEFAULT_PANE3_STEP1);
      expect(loadCaseStorage(seed).pane3_step2).toEqual(DEFAULT_PANE3_STEP2);
      expect(loadCaseStorage(seed).pane3_step3).toEqual(DEFAULT_PANE3_STEP3);

      const selectPane3Button = Array.from(
        container.querySelectorAll("button"),
      ).find((button) =>
        button.getAttribute("aria-label")?.includes("仮説 1 をPane3候補にする"),
      );
      expect(selectPane3Button).toBeDefined();
      await act(async () => {
        selectPane3Button?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });

      expect(container.textContent).toContain("優先構造仮説 1");
      expect(container.textContent).toContain("構造上の本丸候補");
      expect(container.textContent).toContain("最初に手を入れる場面候補");
      expect(container.textContent).toContain("なぜ、ここから始めるのか");
      expect(container.textContent).toContain("本丸 ≠");
      expect(container.textContent).toContain(
        "Pane3 Step2 | 誰が何を引き受けるか",
      );
      expect(container.textContent).toContain(
        "責任を明確にするだけでは不十分です。必要な権限・支援・完了条件もセットで確認します。",
      );
      expect(container.textContent).toContain("今回の介入前提");
      expect(container.textContent).toContain("今回、役割を設計する場面");
      expect(container.textContent).toContain("発見・起票者");
      expect(container.textContent).toContain("推進責任者");
      expect(container.textContent).toContain("実務担当");
      expect(container.textContent).toContain("支援・承認者");
      expect(container.textContent).toContain("基本案");
      expect(container.textContent).toContain("この基本案で進める");
      expect(container.textContent).toContain("補足・修正する");
      expect(container.textContent).toContain(
        "以下の基本案は出発点の提案です。正解ではありません",
      );
      expect(
        container.querySelector(
          '[aria-label="Pane3 構造上の本丸候補 仮説1"]',
        ),
      ).not.toBeNull();
      expect(
        container.querySelector(
          '[aria-label="Pane3 最初に手を入れる場面候補 仮説1"]',
        ),
      ).not.toBeNull();
      expect(
        container.querySelector(
          '[aria-label="Pane3 なぜここから始めるのか 仮説1"]',
        ),
      ).not.toBeNull();

      const supplementTrigger = Array.from(
        container.querySelectorAll("button"),
      ).find((button) => button.textContent?.includes("補足・修正する"));
      expect(supplementTrigger).toBeDefined();
      await act(async () => {
        supplementTrigger?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });

      expect(
        container.querySelector(
          '[aria-label="Pane3 Step2 発見・起票者 補足・修正"]',
        ),
      ).not.toBeNull();
      expect(container.textContent).not.toContain("未決定に戻す");

      const adoptButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.includes("この基本案で進める"),
      );
      expect(adoptButton).toBeDefined();
      await act(async () => {
        adoptButton?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });

      expect(container.textContent).toContain("✓ 基本案で進める");
      expect(container.textContent).toContain("未決定に戻す");

      const resetButton = Array.from(container.querySelectorAll("button")).find(
        (button) => button.textContent?.includes("未決定に戻す"),
      );
      expect(resetButton).toBeDefined();
      await act(async () => {
        resetButton?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });

      expect(container.textContent).not.toContain("未決定に戻す");
      expect(container.textContent).toContain("この基本案で進める");
      expect(
        loadCaseStorage(seed).pane3_step2.roles.discovery.adopted_default,
      ).toBe(false);

      expect(container.textContent).toContain(
        "Pane3 Step3 | 今回試す BABY STEP",
      );
      expect(container.textContent).toContain("今回試す BABY STEP");
      expect(container.textContent).toContain("今回のBABY STEPの前提");
      expect(container.textContent).toContain("最初に手を入れる場面候補（Step1）");
      expect(container.textContent).toContain("4役割の採用状況（Step2）");
      expect(container.textContent).toContain("発見・起票者 未決定");
      expect(container.textContent).toContain("何を試すか");
      expect(container.textContent).toContain("誰がやるか");
      expect(container.textContent).toContain("いつまでに／いつ実施するか");
      expect(container.textContent).toContain(
        "何ができたら「まず成功」と言えるか",
      );
      expect(container.textContent).toContain("この案で進める");
      expect(container.textContent).toContain(
        "次に発生する不具合案件1件について、最初の対応会議で",
      );
      expect(container.textContent).toContain(
        "このBABY STEPを意味ある実験にする前提",
      );
      expect(container.textContent).toContain("向かうTO BE");
      expect(container.textContent).toContain("後ろ盾・お墨付き");
      expect(container.textContent).toContain(
        "Step2の推進責任者（誰が前に進めるか）とは別に",
      );
      expect(container.textContent).toContain("つまずきを次のGAPとして拾う");
      expect(container.textContent).toContain("役割の曖昧さ");
      expect(container.textContent).toContain("権限不足");
      expect(container.textContent).toContain("判断待ち");
      expect(container.textContent).toContain("未確認");
      expect(container.textContent).toContain("確認済み");
      expect(container.textContent).toContain(
        "大きなTO BEへ向かう実行単位を小さくします",
      );
      expect(container.textContent).toContain(
        "つまずきをGAPとして拾う",
      );
      expect(container.textContent).toContain(
        "構造仮説が妥当かを小さく確かめる実験です",
      );
      expect(container.textContent).toContain("SKILL資産化");
      expect(container.textContent).not.toContain(
        "基本案ではなく別案を書く",
      );

      const babyStepAdoptButton = Array.from(
        container.querySelectorAll("button"),
      ).find((button) =>
        button.textContent?.includes("この案で進める"),
      );
      expect(babyStepAdoptButton).toBeDefined();
      await act(async () => {
        babyStepAdoptButton?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });
      await act(async () => {
        vi.runAllTimers();
        await Promise.resolve();
      });

      expect(container.textContent).toContain("✓ この案で進める");
      expect(
        loadCaseStorage(seed).pane3_step3.what_to_try.adopted_default,
      ).toBe(true);
      expect(loadCaseStorage(seed).pane3_step3.what_to_try.value).toContain(
        "次に発生する不具合案件1件について",
      );

      const backingConfirmed = Array.from(
        container.querySelectorAll("button"),
      ).find((button) => button.textContent === "確認済み");
      expect(backingConfirmed).toBeDefined();
      await act(async () => {
        backingConfirmed?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });
      await act(async () => {
        vi.runAllTimers();
        await Promise.resolve();
      });
      expect(loadCaseStorage(seed).pane3_step3.backing.status).toBe(
        "confirmed",
      );

      const backingSupplementTrigger = Array.from(
        container.querySelectorAll("button"),
      ).find((button) => button.textContent?.includes("補足する（任意）"));
      expect(backingSupplementTrigger).toBeDefined();
      await act(async () => {
        backingSupplementTrigger?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });
      expect(
        container.querySelector(
          '[aria-label="Pane3 Step3 後ろ盾・お墨付き 補足"]',
        ),
      ).not.toBeNull();

      const step3SupplementTriggers = Array.from(
        container.querySelectorAll("button"),
      ).filter((button) => button.textContent?.includes("補足・修正する"));
      const lastSupplement = step3SupplementTriggers.at(-1);
      expect(lastSupplement).toBeDefined();
      await act(async () => {
        lastSupplement?.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
        await Promise.resolve();
      });
      expect(
        container.querySelector(
          '[aria-label="Pane3 Step3 何ができたら「まず成功」と言えるか 補足・修正"]',
        ),
      ).not.toBeNull();

      expect(container.textContent).toContain("Pane3 Step2 | 誰が何を引き受けるか");
      expect(container.textContent).toContain("構造上の本丸候補");
      expect(container.textContent).toContain("SKILL資産化");

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

  it("Pane3-Step3 の採用状態を localStorage から復元しても hydration mismatch を出さない", async () => {
    vi.useFakeTimers();
    saveCaseStorage({
      case_a00: seed.case_a00,
      selected_phenomenon_id: seed.selected_phenomenon_id,
      phenomena: seed.phenomena,
      pane1_intake: {
        ...DEFAULT_PANE1_INTAKE,
        to_be: "不具合対応が責任連鎖のまま完了まで届く現場",
      },
      pane2_step3: {
        evaluations: DEFAULT_PANE2_STEP3.evaluations,
        selected_for_pane3: [0],
      },
      pane3_step1: {
        entries: [
          {
            structural_core_candidate: "決裁が閉じない構造",
            first_entry_candidate: "不具合初動会議で役割と期限を閉じる",
            why_start_here: "上流が閉じないと下流が再生産される",
          },
          ...DEFAULT_PANE3_STEP1.entries.slice(1),
        ],
      },
      pane3_step2: {
        roles: {
          discovery: {
            ...DEFAULT_PANE3_STEP2.roles.discovery,
            adopted_default: true,
          },
          driver: {
            ...DEFAULT_PANE3_STEP2.roles.driver,
            adopted_default: true,
          },
          practitioner: DEFAULT_PANE3_STEP2.roles.practitioner,
          supporter: DEFAULT_PANE3_STEP2.roles.supporter,
        },
        entries: DEFAULT_PANE3_STEP2.entries,
      },
      pane3_step3: {
        ...DEFAULT_PANE3_STEP3,
        what_to_try: {
          adopted_default: true,
          supplement: "Teamsで記録する",
          value: PANE3_STEP3_DEFAULT_PROPOSALS.what_to_try,
        },
        who_does_it: {
          ...DEFAULT_PANE3_STEP3_FIELD,
          adopted_default: true,
          value: PANE3_STEP3_DEFAULT_PROPOSALS.who_does_it,
        },
        backing: {
          status: "confirmed",
          supplement: "工場長が支持し、部門間調整を担う",
        },
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

      expect(container.textContent).toContain("今回試す BABY STEP");
      expect(container.textContent).toContain(
        "不具合初動会議で役割と期限を閉じる",
      );
      expect(container.textContent).toContain(
        "不具合対応が責任連鎖のまま完了まで届く現場",
      );
      expect(container.textContent).toContain("このBABY STEPを意味ある実験にする前提");
      expect(container.textContent).toContain("工場長が支持し、部門間調整を担う");
      expect(container.textContent).toContain("つまずきを次のGAPとして拾う");
      expect(container.textContent).toContain("発見・起票者 採用");
      expect(container.textContent).toContain("推進責任者 採用");
      expect(container.textContent).toContain("実務担当 未決定");
      expect(container.textContent).toContain("✓ この案で進める");
      expect(container.textContent).toContain("✓ 補足・修正を含めて進める");
      expect(container.textContent).toContain("Teamsで記録する");
      expect(container.textContent).toContain("SKILL資産化");
      expect(loadCaseStorage(seed).pane3_step1.entries[0].first_entry_candidate).toBe(
        "不具合初動会議で役割と期限を閉じる",
      );
      expect(loadCaseStorage(seed).pane3_step2.roles.discovery.adopted_default).toBe(
        true,
      );
      expect(loadCaseStorage(seed).pane3_step3.what_to_try).toEqual({
        adopted_default: true,
        supplement: "Teamsで記録する",
        value: PANE3_STEP3_DEFAULT_PROPOSALS.what_to_try,
      });
      expect(loadCaseStorage(seed).pane3_step3.backing).toEqual({
        status: "confirmed",
        supplement: "工場長が支持し、部門間調整を担う",
      });

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
    expect(loaded.pane2_step3).toEqual(DEFAULT_PANE2_STEP3);
    expect(loaded.pane3_step1).toEqual(DEFAULT_PANE3_STEP1);
    expect(loaded.pane3_step2).toEqual(DEFAULT_PANE3_STEP2);
    expect(loaded.pane3_step3).toEqual(DEFAULT_PANE3_STEP3);
  });
});
