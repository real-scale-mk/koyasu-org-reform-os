# 組織改革 methodology（SKILL 置き場）

## 目的

別途整理中の**組織改革SKILL**を、リポジトリ内で Cursor / AI が参照できる形で置く。

- 設計思想・判断基準
- 構造分析の型
- レバレッジ・打ち手の型

案件ごとのデータ（案件A00・現象・目指す姿・メモ等）とは分離する。境界は [data-boundary.md](../data-boundary.md) を参照。

## ファイル構成（予定）

| ファイル | 内容 | 主に流し込む先 |
|---------|------|---------------|
| `diagnostic-axes.md` | 診断観点の定義 | Pane2 |
| `structure-analysis.md` | 構造分析の手順・問い | Pane2 詳細 |
| `leverage-thinking.md` | レバレッジの見つけ方 | Pane3 |
| `action-patterns.md` | 打ち手の型・事例 | Pane3 |

## 今回のフェーズ

- [x] 本 README（置き場の説明）
- [ ] 各 methodology ファイルの中身（SKILL 整理後に追加）
- [ ] アプリ画面への流し込み（grill-me 後の実装フェーズ）

## 運用イメージ

1. 現場で得た学び（Pane4）を振り返る
2. 再利用価値が高いものを methodology に昇格
3. 次案件の Pane2/3 の初期カード・問いの型として使う
