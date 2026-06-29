# データ境界 — Markdown / JSON / DB（Neon）

## 基本方針

| 置き場所 | 何を置くか | 誰が書くか | 更新頻度 |
|---------|-----------|-----------|---------|
| **Git / Markdown** | 組織改革SKILL、思想、判断基準、分析の型、打ち手の型 | コンサル本人 | 低（思想の更新） |
| **JSON（MVP seed）** | デモ案件の初期表示データ | 開発時 | リリース単位 |
| **DB / Neon（将来）** | 案件ごとの案件A00、現象、メモ、進捗、学び | 現場＋コンサル | 高（案件ごと） |

## Markdown に置くもの

- 診断観点・分析手順（[methodology/](./methodology/)）
- レバレッジの考え方、打ち手の型
- 問いの型（誰に何を聞くかのテンプレ）
- Cursor / AI が参照する設計思想・判断基準

## JSON（MVP）に置くもの

- デモ案件1件の初期 seed
- Pane2/Pane3 の静的カード文言（SKILL から流し込んだ初期値）
- Pane4 の実行結果・成果（現象ごとの seed、MVP 編集不可）
- 画面が動くための固定テンプレ（DB 接続前）

## localStorage（MVP）に置くもの

- Pane1 の編集フィールド + 選択状態
- Pane4 の気づき・SKILL化候補（現象 ID キー）

## DB（Neon）に置くもの（将来）

### 第1接続フェーズ（MVP 提出後）

- **案件** `cases` — 案件名、**案件A00**（`case_a00`）、最後に選んだ現象 ID
- **現象** `phenomena` — ラベル、**目指す姿**（`target_state`）、重要度、状態、メモ
- **学び** `learnings` — Pane4 の気づき（将来）
- **SKILL候補** `skill_candidates` — Pane4 の SKILL化候補（将来）
- **成果** `outcomes` — Pane4 の実行結果・成果（将来、MVP は JSON seed）

### 第2接続フェーズ以降

- 構造仮説の更新履歴
- 打ち手の実行状況・KPI
- if-then 介入シナリオ（将来）

## 今回のMVP（grill 確定）

- **保存対象（localStorage）**
  - **Pane1:** 案件A00、現象（目指す姿/重要度/状態/メモ）、選択状態
  - **Pane4:** 気づき、SKILL化候補（現象ごと）
- **seed 表示のみ（編集不可）**
  - **Pane2:** 構造分析カード + Sheet 詳細
  - **Pane3:** レバレッジ + 打ち手 + 比較 Dialog
  - **Pane4:** 実行結果、成果
- **実装タイミング:** 4ペイン grill 完了 → schema + 画面実装フェーズ

## 4現象 seed 方針（MVP 確定）

Pane1 には4現象を seed する。Pane2〜4 の seed は **ヒーロー現象フル + 他3最小** とする。

| 現象 | Pane1 | Pane2〜4 |
|------|-------|----------|
| **若手離職**（初期選択） | フル seed | **フル seed** — 関連度・Sheet・レバレッジ/打ち手・実行結果/成果/気づき/SKILL |
| 他人事文化 | フル seed | **最小プレースホルダ** — 関連度のみ or 1行サマリー。Sheet/打ち手/成果は「準備中」表示可 |
| 技術伝承不足 | 同上 | 同上 |
| 不具合頻発 | 同上 | 同上 |

**理由:** デモ・提出の主経路は若手離職の Pane1→4 一気通貫。他3現象は Pane1 切替で「連動する」ことを示し、下流は後フェーズで肉付けする。

**用語（再掲）:** **案件A00** = 案件1件の北極星。**目指す姿**（`target_state`）= 現象1件の目標状態。「A00」は案件のみに使う。

## localStorage キー（MVP）

| キー | 内容 |
|------|------|
| `koyasu:case:v1` | 案件A00、selected_phenomenon_id、全現象フィールド（Pane1） |
| `koyasu:learning:v1` | insightsByPhenomenonId、skillCandidatesByPhenomenonId（Pane4） |

初期化: JSON seed を読み込み → localStorage があればマージ（Pane1/Pane4 各キー独立）。debounce 自動保存。

## 判断の迷いが出たとき

> **「この案件の現場で変わるか？」** → DB  
> **「自分のコンサル手法として再利用するか？」** → Markdown
