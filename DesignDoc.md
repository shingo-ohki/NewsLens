
# 📘 NewsLens — Design Doc

## Table of Contents

- [1. プロダクト概要 (Overview)](#1-プロダクト概要-overview)
- [2. ミッション (Mission)](#2-ミッション-mission)
- [3. コアバリュー (Core Values)](#3-コアバリュー-core-values)
- [4. ユーザーセグメント & ペルソナ (Users & Personas)](#4-ユーザーセグメント--ペルソナ-users--personas)
- [5. ユースケース (Use Cases)](#5-ユースケース-use-cases)
- [6. 機能要件 (Functional Requirements)](#6-機能要件-functional-requirements)
- [7. 非機能要件 (Non-Functional Requirements)](#7-非機能要件-non-functional-requirements)
- [8. 全体アーキテクチャ (System Architecture)](#8-全体アーキテクチャ-system-architecture)
- [9. システム構成 (System Components)](#9-システム構成-system-components)
- [10. API 方針 (API Strategy)](#10-api-方針-api-strategy)
- [11. データモデル (Data Model)](#11-データモデル-data-model)
- [12. プロダクト固有情報 (Product-Specific Policies)](#12-プロダクト固有情報-product-specific-policies)
- [13. UI/UX デザインガイドライン (UI Design System)](#13-uiux-デザインガイドライン-ui-design-system)
- [14. ワークフロー (Workflow)](#14-ワークフロー-workflow)
- [15. 運用・モニタリング (Operations & Monitoring)](#15-運用・モニタリング-operations--monitoring)
- [16. ロードマップ (Roadmap)](#16-ロードマップ-roadmap)
- [17. リスク & 検証ポイント (Risks & Validation)](#17-リスク--検証ポイント-risks--validation)
- [18. JSON Schema（解析結果データ仕様）](#18-json-schema解析結果データ仕様)

## 1. プロダクト概要 (Overview)

```md
NewsLens は、意見を生むためのツールではない。
問いが生まれる前の、静かな理解の場をつくるツールである。
```

### 役割の明確化（Sharpness Positioning）

NewsLens は、専門家のように鋭い結論や批評を下すことを目的としない。
代わりに、そうした鋭さが必要になる 「前段」 を社会に広げることを目的とする。

高度な専門的議論や批評は、前提・論点・構造が十分に整理されていて初めて成立する。
しかし現実には、その前段が共有されないまま、断片的な情報や感情的な言葉だけが流通している。

NewsLens は鋭い答えを出さない。「ここで立ち止まる必要がある」という地点を照らす。
議論の刃が振るわれる前に、地形を可視化するための Lens である。

### 設計上の前提（Design Premise）

NewsLens は、「偏りのない記事」や「完全に中立な要約」が理論的に存在するとは考えない。

ニュース記事は、
- どの事実を拾うか
- どの順序で語るか
- どの因果関係を強調するか
- どの価値観を暗黙の前提とするか

といった選択の積み重ねによって構成されており、理論や前提なしに書かれることはない。

NewsLens の目的は、こうした偏りを「除去」することではなく、偏りが生まれる 前提・論点・構造 を可視化することである。

そのため NewsLens は、
- 結論や評価を提示しない
- 正しい読みや唯一の解釈を定義しない
- 中立を「結果」ではなく「設計上の制約」として扱う

NewsLens は、「中立な答え」を出すツールではなく、ユーザーが自分自身の問いに到達するための理解の地形図（Lens） を提供するツールである。

NewsLens は、1つのニュース記事を 深く・正確に理解するための AI ツール。

ニュースには以下の構造的課題がある：
- 要点が掴みにくい
- 争点（論点）が分かりにくい
- 因果関係が複雑
- メディアによって論調が異なり、誤解が生じやすい

こうした課題の結果、多くの人が 「気になるが、よく分からないままスルーしてしまう」 状態に陥る。
特に SNS では情報が断片的で、背景知識が不足したまま意見だけが流通するため、理解の非対称性が生まれ、分断の温床 になりやすい。

NewsLens はこの「理解の谷（Gap）」を埋め、
ユーザーが自分なりの見方・解釈を持つための理解の助走路を提供する。

NewsLens は LLM に 明確な分析テンプレート（ガイドレール思考） を与え、
再現性のある以下の一連の構造化分析を自動生成する。

「要点 → 論点 → 立場 → 因果 → 価値観 → 不確実性」

この構造化により、ユーザーは
- 何が事実なのか
- どこが争点なのか
- どの立場が存在するか
- どこが不確実なのか

を短時間で把握できる。

さらに、NewsLens は 美談化・単純化・偏ったナラティブ を検知するための
「Bias & Context Notes」も生成し、表面的なストーリーに隠れた欠落・偏りを補う。

これは、理解の前提を整え、
不必要な対立や誤解による分断を抑制する効果 をもつ。

MVP は「読むだけ・理解するだけ」に特化。
将来的には以下へ拡張する基盤を提供する
- 複数記事比較（NewsSphere）
- 社会的対話マップ（PublicSense）

NewsLens は単なる要約ツールではない。
理解を開始するための“入口”をつくり、対話の土台を揃えるプロダクトである。

---

## 2. ミッション (Mission)
**NewsLens の使命は、ニュースを理解させることではない。ニュースを「考え続けられる状態」に人を導くことである。**

- 複雑なニュースに対して、誰もが「入口に立てる」状態をつくる
- 情報の偏り・誤解・断片化による分断を減らす
- 判断を揃えるためではなく、議論が分断に陥らないための認知的前提を整える
- 初心者・専門家を問わず「深い理解」を支援する
- 「分からないから意見を持てない」という状態を減らし、
- 社会的テーマに対する 自分なりの立場・解釈 へ到達するための橋渡しを行う
- 誰もが複雑なニュースについて “入り口に立てる” 世界をつくる
- 興味はあるが知識が足りず理解が始まらないユーザーに 最初の一歩 を提供する
- 誰もが同じ“理解の前提”に立てるようにし、誤解・前提の非対称性から生じる不必要な分断を抑制する
- 異なる立場の人々が、「相手が何をどのように理解しているか」を構造的に把握できる環境 を整える
- 反対意見を「敵」とみなすのではなく、異なる構造理解に基づく立場の違い として扱えるようにする

NewsLens はニュースの評価や結論を提供しない。
ニュースを理解し、自分なりの判断に到達するために必要な視点・論点・背景を付加することで、思考を支援する。

NewsLens の使命は、ニュースを理解させることではない。ニュースを「考え続けられる状態」に人を導くことである。
そのために NewsLens は、ユーザーに答えや意見を与えるのではなく、問いが自然に立ち上がるための前提条件を整える。
---

## 3. コアバリュー (Core Values)

- **透明性**：どの情報をどう構造化したかを明示（JSON 出力）
- **再現性**：テンプレート / バリデーション / 例外処理
- **アクセシビリティ**：誰でも深い構造で理解できる
- **拡張性**：比較・可視化・対話マップへの展開が容易
- **ガイドレール思考**：自由生成ではなく構造化生成を重視
- 理解の助走路

ニュース理解の最も大きなボトルネックは「前提が分からない」ことである。
SNSで流れてきた記事やポストは、本文を読まないと理解できず、多くが「気になるけど内容が分からないままスルー」されている。

NewsLens は、背景・論点・関係者・価値観などを構造化して提示することで、
ユーザーが “意見形成のスタートライン” に立つための入口 を提供する。

- 意見形成の支援
NewsLens はユーザーに特定の立場を与えない。
代わりに、記事に含まれている論点・立場・価値観を中立的に整理し、
自分なりの考えを形成する材料 を提供する。

NewsLens は「情報を読む」のではなく、
「自分の考えが生まれるきっかけ」を用意するツール を目指す。

- Shared Understanding（共通理解の基盤）
現代の分断の多くは、意見の違いではなく、
前提知識の違い（認知の非対称性） から生まれる。

NewsLens は、ユーザー間の理解の前提条件を揃えることで、
意見の衝突ではなく 建設的な対話へと向かう道筋 をつくる。

- Anti-Polarization Design（分断抑制設計）

NewsLens の構造化出力は、分断の原因となる：
- 過度な美談化・単純化
- 立場の隠蔽
- 反対意見の欠落
- 因果の単線化
- 価値観の一方向化

といった“偏ったナラティブの兆候”を捉えやすいよう設計されている。

ここで提示される情報は、誤りの指摘や断罪を目的としない。
議論が進む前に、立ち止まって確認すべき前提や論点の混在を静かに示すためのものである。

さらに「Bias & Context Notes」は、
記事の理解に必要な背景や欠落論点を補い、
誤解による不必要な敵意・対立の発生を未然に防ぐ。

- Neutrality by Design（中立性の設計）
NewsLens は立場を持たず、本文に基づく情報のみを構造化し、不確実性は uncertainties に隔離する。
これにより、ユーザー自身が自由に考える余地 が保たれ、強い誘導が生む分断を避ける。

-  Layer-Aware Design（論点レイヤーを意識した設計）
NewsLens は、ニュースを単一の軸や対立構造で整理しない。

代わりに、社会的な議論には以下のような **異なるレイヤーの問いが同時に存在する** ことを前提とする。

  - WHY：何のための議論か（目的・問い）
  - WHAT：何が価値とされているか（意味・解釈）
  - HOW：どの手段・手法が語られているか（制度・技術・運用）
  - SUCCESS：何をもって成功・失敗とみなすか（評価基準）

多くの混乱や対立は、意見の対立ではなく、**異なるレイヤーの問いが無自覚に混在すること** から生じる。

NewsLens は、これらのレイヤーを「分類」するのではなく、ユーザーがそれらの **ズレに気づける状態** をつくることを目指す。

- Question-First Design（問いを先に立たせる設計）

NewsLens は「意見を生成するツール」ではない。人が自分自身の問いを持てる状態を最優先の成果とする。
問いは、情報が不足しているときではなく、情報が整理され、前提が可視化されたときに初めて生まれる。

NewsLens の構造化出力は、答えを与えるためではなく、「問いが立ち上がる前段を照らすための装置」である。

---

## 4. ユーザーセグメント & ペルソナ (Users & Personas)

| ペルソナ | ニーズ / 課題 |
|---------|----------------|
| 一般生活者（断片接触が多い） | 見出し・SNS断片から入ることが多く、初手の印象で理解が早期に閉じやすい。論点・立場・不確実性を同時に見て、決めつけずに理解を開始したい |
| 一般生活者（関心はあるが追えていない） | 争点や因果が複雑で「気になるがスルー」になりやすい。短時間で要点→論点→構造を掴みたい |
| 教育者・学生 | 構造化ニュースを教材として活用したい |
| ジャーナリスト・研究者 | 比較・検証のための構造化データが欲しい |
| NPO / 市民活動家 | 社会課題の因果・価値観・立場を整理し、説明・対話の土台にしたい |

---

## 5. ユースケース (Use Cases)

- 通勤中にニュースの「要点 → 論点 → 構造」を 5 分で把握
- SNS で流れてきた記事の信頼性をチェック
- 教材としてニュースの構造を説明
- 見出しやSNS断片で形成された「わかった気」を、論点・立場・不確実性の並置でほどき、検討に入る
- 社会課題の記事を媒体別に比較（Phase 2）
- 論点・立場・価値観の対話マップ生成（Phase 3）

---

## 6. 機能要件 (Functional Requirements)

### 6.1 MVP 必須機能
- URL / 本文テキスト入力
- URL 入力時の本文抽出
- LLM によるニュース構造化分析
- JSON スキーマに沿った厳密な構造化出力
- 階層的 UI 表示（Summary → Issues → …）
- 結果 URL 発行
- SNS 共有機能（X, Facebook, LINE）

### 6.2 将来拡張（Phase 2+）
- 複数記事比較（NewsSphere）
- バイアス・論調の可視化
- 社会対話マップ生成（PublicSense）
- OGP 画像自動生成
- コメント / 議論機能
- ニュースクラスタリング


### 6.3 Bias & Context Notes（理解前段ノート）

NewsLens の Notes は、ニュースの正誤・是非・評価を示すものではない。
また、記事を批評・断罪するための機能でもない。

これらの Notes は、
議論が本格的に始まる前に確認すべき「前提の抜け」や「論点の混在」を静かに照らすための装置 である。
ユーザーが自分なりの判断に到達するために必要な視点・論点・背景（解釈の軸）を補助的に提示することを目的とする。

Notes は「批評」ではなく、問いが立ち上がる前段の照明 として機能する。

具体的には、ニュース記事の分析結果に対して以下の要素を自動検知し、
X（旧Twitter）のコミュニティノートに近い形式で、補足として提示する。

#### 6.3.1 目的
- 感情的な美談化や論点の偏りを可視化
- 記事に不足している背景情報を補う
- メディア間での論点差異を提示
- 読者が誤解しそうなポイントを明示
- “理解の助走路”を強化

#### 6.3.2 ノートの種類
- Issue Bias Note（論点偏り）
感情・努力・ヒューマンドラマへの偏りを検知。
- Context Supplement Note（背景補足）
記事の理解に必要な一般論や業界構造を補足。
- Viewpoint Gap Note（メディア観点ギャップ）
他メディアの論点とのズレを提示。
- Misinterpretation Warning（誤解防止）
誤解を誘導する可能性のある記述に警告。

#### 6.3.3 自動検知ロジック（要件）
- “奮闘”“努力”“総力戦”“奇跡”など感情語の多発
- 技術的・構造的原因の言及ゼロ
- 経営責任・ガバナンスへの欠落
- SNS と報道の論点乖離
- 類似インシデントの分析パターンとのギャップ
→ 閾値を超えるとノート生成

#### 6.3.4 出力データ仕様（analysis_result 追加項目）
"notes": [
  {
    "type": "bias | context | gap | warning",
    "title": "string",
    "content": "string"
  }
]

#### 6.3.5 MVP 範囲

※現状の実装では Notes は未実装。
このセクションは Phase 2 以降の実装対象として扱う。

（Phase 2 初期範囲）最大3件のノート生成

- 4種類の note type
- 自動トリガーの基本スコアリング
- 結果ページへの表示（折りたたみ式）

#### 6.3.6 将来拡張

- 複数記事比較と連動した Note
- ユーザー評価（Good Note / Bad Note）
- メディア偏りスコア
- 個人向け理解補助ノート生成

---

## 7. 非機能要件 (Non-Functional Requirements)

- **応答時間**：10〜数十秒
- **信頼性**：抽出 / JSON 整形成功率の改善
- **コスト**：LLM API コスト最適化
- **セキュリティ**：URL / 本文テキストの安全管理
- **スケーラビリティ**：Supabase + Vercel 基盤

---

## 8. 全体アーキテクチャ (System Architecture)

- **Frontend**：Next.js 16, React 19, Tailwind 4
- **Backend**：Next.js API Routes
- **本文抽出**：Mercury Parser / Readability
- **LLM Engine**：OpenAI API（モデルは動的選定）
- **Storage**：Supabase
- **Hosting**：Vercel

---

## 9. システム構成 (System Components)

### フロントエンド
- URLInput
- ArticleTextArea
- StartAnalysisButton
- SummaryBlock
- KeyPointsList …

### バックエンド
- extraction module
- llm analyzer
- json validator
- json correction flow
- result save API

---

## 10. API 方針 (API Strategy)

### POST /api/analyze
- 入力：URL or 本文（どちらか一方のみ）
- 処理：抽出（URL時）→ LLM 解析 → JSON 抽出 → スキーマ検証（必要に応じて 1 回だけ補正リトライ）
- 出力：
  - validated（boolean）
  - result（validated=true のときのみ）
  - rawOutput（LLMの生出力。デバッグ用途）
  - warnings（抽出時の注意。例：本文が短い/長い等）
  - model / isUsingMockLLM（実装依存）

※現状の実装では、開発/デモ環境で USE_MOCK_LLM=true の場合はモック応答を返す（入力内容に依存しない固定結果になることがある）。

### POST /api/result
- 入力：result（解析結果JSON）
- 処理：Supabase に保存し result_id を発行
- 出力：result_id

### GET /api/result/:id
- 保存済み解析結果を返却

### JSON Correction Flow
- JSON パース失敗 → LLM に修正依頼 → バリデーション再試行
- それでも失敗 → UI に通知

---

## 11. データモデル (Data Model)

### article table
| column | description |
|--------|-------------|
| url | 入力された URL |
| input_text_cleaned | 抽出・正規化された本文 |
| extraction_status | success / fail |
| created_at | 作成日時 |

※現状の実装では article への保存は未実装（将来拡張用）。

### analysis_result table
| column | description |
|--------|-------------|
| result_id | 結果ページ用短縮 ID |
| json_result | 解析結果 JSON |
| version_id | LLM / Schema バージョン（任意） |
| schema_version | スキーマバージョン（任意） |
| model | 使用モデル名（任意） |
| created_at | 作成日時 |

---

## 12. プロダクト固有情報 (Product-Specific Policies)

### 12.1 Analysis Template（分析テンプレート）

生成順序（固定）：

1. summary（100 / 300 / 600）
2. key_points
3. actors
4. issues
5. stances
6. causal_map
7. underlying_values
8. uncertainties

### 12.2 Text Extraction Exception Policy

- 抽出失敗時は本文コピペを要求
- 500 字未満 → 警告
- 5000 字超 → 警告（現状は自動で要約抽出モードへ切り替えない）
- 非ニュース記事 → 警告
- URL だけ渡して LLM 推測は禁止

### 12.3 LLM I/O Policy（モデル選定・禁止事項）

**禁止事項：**

- 本文にない事実の補足
- 憶測で新しい actor を追加
- 感情的評価・価値判断
- 政治的なラベリング

**出力は JSON のみ（自然文禁止）**

### 12.4 Result Integrity Policy

- version_id と schema_version を必ず付与
- モデル更新時は回帰テスト
- 変動が大きい場合は rollback 可能にする

### 12.5 Safety & Ethics

- 本文以外の推測禁止
- 不確実性は uncertainties に隔離
- NewsLens 自身は立場を取らない
- NewsLens はユーザーの「問い」を自動生成しない
- 問いは提示されるものではなく、立ち上がるものである
- 構造化は問いを誘導するためではなく、思考の余白を確保するために行う

---

## 13. UI/UX デザインガイドライン (UI Design System)

### 13.1 基本方針
- 階層構造が直感的に見える
- モバイル最適
- 「解析 → 理解 → 共有」を短く
- バイアスや背景を“敵意なく補足する”デザイン
- 情報を押し付けない、選択可能な UI

### 13.2 コンポーネント
- URLInput
- SummaryBlock
- IssuesList
- CausalMapTree
- ShareURLButton
- ResultCardMeta

※NotesSection（Bias & Context Notes）は Phase 2 以降の対象。

#### 13.2.1 ホーム画面（現状実装のUI文言）
- 入力モード切替（タブ）
  - 「記事URLで分析する」
  - 「文章を貼って分析する」
- 実行ボタン
  - 「分析する」（実行中は「分析中...」）

### 13.3 共有 UI
- /r/:result_id ページ
- Summary / Issues / Stances をコンパクトに
- SNS 共有ボタン

### 13.4 Notes UI（コミュニティノート風 補足・警告）［新規］
※Phase 2 以降の対象（現状の実装では未表示）。
#### 13.4.1 デザイン原則
- 過度に主張しないが見逃されない
- “批判”ではなく“理解補助”として表示
- 中立的で控えめなトーン
- 色だけに頼らない情報設計
- 1ノート＝1メッセージに絞り短く

#### 13.4.2 表示位置
- SummaryBlock の直下に NotesSection を挿入
- Issues や Stances より上（理解の出発点として配置）

#### 13.4.3 ノートのUI仕様
- カード型デザイン（角丸 + 薄い枠）
- タイプごとに淡い色バッジ：
  - Bias：🟨 #FFF6C4
  - Context：🟦 #E8F1FF
  - Gap：🟪 #F2E8FF
  - Warning：🟥 #FFEDEE
- タイトル：太字 + アイコン
- 本文：最大3〜5行
- 「詳細を見る」アコーディオン
- 「自動生成された補足です」ラベルを下部に表示

#### 13.4.4 アクセシビリティ
- 色依存しない “type” ラベル（bias / context / gap / warning）
- スクリーンリーダー対応
- スマホではアコーディオンで折り畳む

#### 13.5 NotesSection の例（UIイメージ）
🟨 論点偏り（Bias Note）
この記事は「復旧の努力」に焦点が当てられています。
技術的要因（VPN脆弱性・ガバナンス・MFA）への言及は限定的です。
［詳細を見る］

🟦 背景補足（Context Note）
一般的にサイバー攻撃では以下が原因になることが多い：VPN脆弱性、監視不足、MFA未導入。
［詳細を見る］

### 13.6 One-Screen Philosophy UI（思想を1画面で表現する設計）

#### 13.6.1 目的（Purpose）

この画面の目的は、ニュースを「理解させる」ことではない。
ユーザーを **ニュースについて考え続けられる状態** に導くことである。

- 結論を提示しない
- 重要度を決めない
- 対立構造を強制しない

代わりに、ニュースを構成する複数の要素
（論点・立場・因果・価値観・不確実性）を
**並置された構造として一望できる状態** を提供する。

この画面は、NewsLens における「理解の入口」であり、
思考の方向性を決める場所ではない。

---

#### 13.6.2 設計原則（UI Principles）

この画面は、以下の原則に従って設計される。

1. **No Central Answer**
   - 画面中央に「結論」「要点のまとめ」「最重要ポイント」を置かない
   - Summary は入口であり、答えではない

2. **Parallel Structure**
   - Summary / Issues / Stances / Causal Map / Underlying Values は
     同等の視覚的強度で配置する
   - UI 側から優先順位やおすすめを提示しない

3. **Layer-Aware, Not Layer-Labeled**
   - WHY / WHAT / HOW / SUCCESS といったレイヤー名は UI 上に表示しない
   - 異なるレイヤーの発話や論点が、自然に並んで見える構造を保つ

4. **Quiet Notes**
   - Bias & Context Notes は警告ではなく補足として扱う
   - 初期状態では折り畳み、弱いトーンで配置する

---

#### 13.6.3 1画面レイアウト仕様（Desktop 基準）

```text
[Article Meta]
- title
- source / date

┌───────────────────┬───────────────────┐
│ Summary           │ Issues            │
│ （入口・答えなし）│ ・issue A            │
│                   │ ・issue B         │
└───────────────────┴───────────────────┘

┌───────────────────┬───────────────────┐
│ Stances           │ Causal Map        │
│ ・actor X の見方 │ problem → cause     │
│ ・actor Y の見方 │ → consequence       │
└───────────────────┴───────────────────┘

┌───────────────────────────────────────┐
│ Underlying Values / Assumptions       │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ Bias & Context Notes                  │
│ （collapsed by default）               │
└───────────────────────────────────────┘
```
---

## 14. ワークフロー (Workflow)

1. URL / テキスト入力
2. 本文抽出（URL入力時のみ）
3. LLM 分析
4. JSON 抽出
5. JSON バリデーション
6. JSON Correction Flow（必要に応じて 1 回だけ再試行）
7. クライアントが POST /api/result で Supabase に保存
8. result_id を受け取り /r/:result_id へ遷移
9. /r/:result_id が GET /api/result/:id で結果を取得して表示

---

## 15. 運用・モニタリング (Operations & Monitoring)

NewsLens は、解析の安定性だけでなく、
ユーザーが「理解が閉じない入口」に入れているかを継続的に観測し、改善に活用する。

- 抽出成功率
- LLM 応答時間
- JSON パースエラー率
- API コスト
- 結果ページ閲覧数・共有数

- 原文クリック率（追加確認行動）
- 滞在時間（読み込み・検討の継続）
- セクション開閉率（Issues / Stances / Uncertainties）
  - Summary 以外の構造が実際に参照されているかの指標

---

## 16. ロードマップ (Roadmap)

### Phase 1 — NewsLens（MVP）
- 単一記事解析
- JSON 構造化
- 結果 URL 生成

### Phase 2 — NewsSphere
- 複数記事比較
- 論調・バイアス可視化
- ニュースクラスタリング

### Phase 3 — PublicSense
- 立場・価値観マップ
- 対話構造可視化
- 広聴AIとの連携

### Phase 4 — 拡張
- 教育用パッケージ
- API 公開
- 動画・音声ニュースへ対応

### MVP 完成条件（Validation Criteria）
Phase 1 の NewsLens は、以下を満たせば完成と見なす：
- 単一ニュース記事について
  - 論点（issues）が複数可視化される
  - 賛否・立場の混在が把握できる
  - 不確実性が明示される
- ユーザーが
  - 読後に少なくとも 1 つ「自分の問い」を持てる状態になる
  - ニュースを読んだ後に「分かった」という感覚ではなく、「もう少し考えたい」「問いが整理されてきた」という状態に入れていること
- 専門家・研究者・行政担当者などによる、より高度な議論・批評・意思決定へ進むための前提整理として機能していること

これ以上の評価・結論・機能追加は Phase 2 以降で扱う。

---

## 17. リスク & 検証ポイント (Risks & Validation)

### 17.1 主なリスク
- 抽出失敗
- ハルシネーション
- モデル更新による揺れ
- JSON 不整形
- バイアス再生産
- 初手のフレーミング固定化（断片接触・時間制約下での早期確定）

#### 初手のフレーミング固定化（認知バイアス）
NewsLens は、最初に提示された要約やフレームがアンカーとなり、
その後の理解が単一の見取り図に固定されてしまうリスクを前提として扱う。

これは一般有権者に限らず、議員・政策スタッフを含むあらゆるユーザーで起こりうるが、
特に「見出し/短文/切り抜き」や「ブリーフィング」など、
断片的かつ時間制約の強い接触の場面で顕在化しやすい。

このリスクは、誤解や決めつけを強め、議論を不必要に単線化させうるため、
MVP段階から設計上の制約として扱う。

### 17.2 対策
- Text Extraction Policy
- LLM I/O Policy
- JSON Correction Flow
- version_id 管理
- uncertainties 分離
- No Central Answer / Parallel Structure / uncertainties可視化による“初手固定化”の抑制

初手の固定化に対して、UI は Summary を“答え”として強調せず、
Issues / Stances / Causal Map / Underlying Values / Uncertainties を並置し、
不確実性も含めた地形を最初から視界に入れる設計を採用する。

### 17.3 検証ポイント（Validation Checks）
- Summary だけで理解が閉じていないか（単一の結論に見えていないか）
  - 観測：Summary以外のセクション閲覧率（Issues/Stances/Uncertaintiesの表示・開閉）、早期離脱率

- Issues / Stances / Uncertainties を見た後に、追加確認行動（原文確認/検索）が増えるか
  - 観測：原文クリック率、滞在時間、結果ページの再訪・共有の発生

- 不確実性が uncertainties に隔離され、他フィールドへ漏れていないか
  - 観測：スキーマバリデーション＋ルールテスト、サンプリング監査（人手確認）

---

<!-- ChangeLog removed -->

## 18. JSON Schema（解析結果データ仕様）

### 18.1 ルート構造
```json
{
  "summary": {},
  "key_points": [],
  "actors": [],
  "issues": [],
  "stances": [],
  "causal_map": [],
  "underlying_values": [],
  "uncertainties": []
}
```

### 18.2 summary

```json
{
  "100": "string",
  "300": "string",
  "600": "string"
}
```

### 18.3 key_points

* min: 3
* max: 15

```json
["string", ...]
```

### 18.4 actors

```json
[
  {
    "name": "string",
    "type": "individual | organization | region | institution | other",
    "description": "string"
  }
]
```

### 18.5 issues

```json
["string", ...]
```

### 18.6 stances

```json
[
  {
    "actor": "string",
    "stance": "string",
    "stance_type": "support | oppose | mixed | unclear | neutral | other",
    "evidence": "string"
  }
]
```

### 18.7 causal_map

```json
[
  {
    "problem": "string",
    "causes": ["string"],
    "mechanisms": ["string"],
    "consequences": ["string"],
    "notes": "string"
  }
]
```

### 18.8 underlying_values

```json
["string"]
```

### 18.9 uncertainties

```json
["string"]
```

### 18.10 不足時の扱い

* 各フィールドのキーは必須
* 空配列 or null を必ず設定
