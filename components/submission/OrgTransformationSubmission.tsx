"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrgTransformationSubmissionProps = {
  toolName: string;
  caseName: string;
};

const HERO_CAPTURE_ITEMS = [
  "Pane1：若手離職を選択",
  "Pane2：右上・大きい点（本質問題域）",
  "Pane3：主ループ ＋ ★ L1",
  "Pane4：課長行と「今回の学び」が見える",
] as const;

export function OrgTransformationSubmission({
  toolName,
  caseName,
}: OrgTransformationSubmissionProps) {
  const [screenshotMissing, setScreenshotMissing] = useState(false);

  return (
    <article className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">AI-Driven School 月次課題 提出用</p>
          <h1 className="text-2xl font-semibold text-foreground">{toolName}</h1>
          <p className="text-sm text-muted-foreground">{caseName}</p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            1. ツール画面キャプチャ
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            上段が操作可能なツール画面です。提出用の静止画は、若手離職を選択したヒーロー状態でキャプチャしたものを表示します。
          </p>
          <figure className="flex flex-col gap-2">
            {!screenshotMissing ? (
              // eslint-disable-next-line @next/next/no-img-element -- 提出用静止画は public に手動配置
              <img
                src="/submission-screenshot.png"
                alt={`${toolName}のツール画面（若手離職選択・4ペイン連動）`}
                className="w-full rounded-lg border border-border bg-card"
                onError={() => setScreenshotMissing(true)}
              />
            ) : (
              <Card size="sm">
                <CardContent className="flex flex-col gap-3 p-6">
                  <p className="text-sm font-medium text-foreground">
                    キャプチャ画像（準備中）
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    上段のワークスペースをヒーロー状態でスクリーンショットし、
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      public/submission-screenshot.png
                    </code>
                    として保存すると、この欄に表示されます。
                  </p>
                  <ul className="flex flex-col gap-1">
                    {HERO_CAPTURE_ITEMS.map((item) => (
                      <li
                        key={item}
                        className="text-sm text-muted-foreground"
                      >
                        · {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            <figcaption className="text-center text-xs text-muted-foreground">
              {toolName} — {caseName}（若手離職選択時）
            </figcaption>
          </figure>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            2. 解決する課題
          </h2>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">誰の課題か</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              組織変革に関わる
              <strong className="font-medium text-foreground">コンサルタント</strong>
              （およびトップ・ナンバー2への「観方・視点」の提供を行う立場）。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">何が困るか</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              組織問題は個人の問題ではなく、
              <strong className="font-medium text-foreground">
                風土・文化・見えにくい背景・社会的潮流
              </strong>
              まで絡む。既存ツール（スプレッドシート、ロジックツリー、汎用プロジェクト管理）では次が同時に見えない。
            </p>
            <ul className="flex flex-col gap-2">
              <li className="text-sm leading-relaxed text-muted-foreground">
                目に見える <strong className="font-medium text-foreground">現象</strong>
                （離職、会議の押し付け合い 等）
              </li>
              <li className="text-sm leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">
                  どれだけ危険か・どの規模で介入すべきか
                </strong>
              </li>
              <li className="text-sm leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">
                  なぜその現象が続くか
                </strong>
                （生態系・悪循環）
              </li>
              <li className="text-sm leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">
                  明日、誰に何を聞くか
                </strong>
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              画面や資料を行ったり来たりすると、
              <strong className="font-medium text-foreground">
                「今どこを見るべきか」
              </strong>
              が失われ、構造議論が研究化する。
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              このツールがすること
            </h3>
            <blockquote className="rounded-lg border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              1つの案件（A社）について、
              <strong className="font-medium text-foreground">選んだ現象</strong>
              を起点に、危険の地図（Pane2）と構造仮説（Pane3）と次の一手（Pane4）を
              <strong className="font-medium text-foreground">
                1画面で連動表示
              </strong>
              し、トップや現場への <strong className="font-medium text-foreground">観方</strong>{" "}
              を渡す。
            </blockquote>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              既存ツールとの差（90→100）
            </h3>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-foreground">
                      既存（90点）
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-foreground">
                      自作（100点）
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="px-3 py-2">表・ツリー・スライドが別々</td>
                    <td className="px-3 py-2">
                      <strong className="font-medium text-foreground">
                        現象選択 → 地図 → ループ → 一手
                      </strong>{" "}
                      が切れない
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2">診断軸が散在</td>
                    <td className="px-3 py-2">
                      <strong className="font-medium text-foreground">
                        6軸＋四象限
                      </strong>{" "}
                      で介入規模（対症↔構造）まで一枚
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">原因は縦に並ぶ</td>
                    <td className="px-3 py-2">
                      <strong className="font-medium text-foreground">
                        因果ループ
                      </strong>{" "}
                      で悪循環とレバレッジが見える
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            3. 工夫したポイント
          </h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              組織改革を実際に何年も経験して分かったのは、誰もが賛成すると思える提案でも、
              <strong className="font-medium text-foreground">
                「自己保身」という価値観によって簡単につぶされる
              </strong>
              ことがあるという現実だった。
            </p>
            <p>
              そこで本ツールでは、表面的な問題を管理するのではなく、次を見つけるための
              <strong className="font-medium text-foreground">「思考OS」</strong>
              を目指した。
            </p>
            <ul className="flex flex-col gap-2">
              <li>· どこが本質問題なのか</li>
              <li>· 何が悪循環を作っているのか</li>
              <li>· どこを変えれば組織全体が動くのか</li>
            </ul>
            <p>
              <strong className="font-medium text-foreground">
                現象 → 現在地 → 構造 → 次の一手
              </strong>
              を一画面でつなぎ、レバレッジポイントを見つけやすくしたことを最大の工夫としている。
            </p>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            4. 苦戦したポイント
          </h2>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              一番苦労したのは、組織問題の複雑な関係性を、
              <strong className="font-medium text-foreground">
                短時間で理解できる形に落とし込むこと
              </strong>
              だった。
            </p>
            <p>
              実際の現場では、多くの要因が絡み合って悪循環を作っている。そのため、次が理解できる画面を目指して試行錯誤を繰り返した。
            </p>
            <ul className="flex flex-col gap-2">
              <li>· 5秒で全体像</li>
              <li>· 30秒で構造</li>
              <li>· 1分で次の一手</li>
            </ul>
            <p>本来であれば、次のところまで作り込みたいと考えている。</p>
            <ul className="flex flex-col gap-2">
              <li>· 危険度を赤・橙・黄・緑で表現する</li>
              <li>· レバレッジポイントから複数の介入シナリオを選択する</li>
              <li>· if-then形式で次の一手を分岐させる</li>
            </ul>
            <p>
              本当は if-then で介入シナリオを分岐させたかったが、今回はMVPとして
              <strong className="font-medium text-foreground">見える化まで</strong>
              に絞った。
            </p>
            <p>
              今回はMVPとして、まずは4ペインが連動して
              <strong className="font-medium text-foreground">
                「今どこを見るべきか」
              </strong>
              が分かるところまでを実現した。
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
