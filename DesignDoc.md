 
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

NewsLens は、1つのニュース記事を **深く・正確に理解するための AI ツール**。

ニュースには以下の構造的課題がある：

- 要点が掴みにくい  
- 争点（論点）が分かりにくい  
- 因果関係が複雑  
- メディアによって論調が異なり、誤解が生じやすい  

NewsLens は LLM に **明確な分析テンプレート（ガイドレール思考）** を与え、  
再現性のある以下の一連の構造化分析を自動生成する：

**「要点 → 論点 → 立場 → 因果 → 価値観 → 不確実性」**

MVP は「読むだけ・理解するだけ」に特化。  
将来的には以下へ拡張する基盤を提供する：

- 複数記事比較（NewsSphere）  
- 社会的対話マップ（PublicSense）  

---

## 2. ミッション (Mission)

- ニュース理解を民主化する  
- 情報の偏り・誤解・断片化による分断を減らす  
- 構造化データで「共通の理解の土台」を提供し、議論を滑らかにする  
- 初心者・専門家を問わず「深い理解」を支援する  

---

## 3. コアバリュー (Core Values)

- **透明性**：どの情報をどう構造化したかを明示（JSON 出力）  
- **再現性**：テンプレート / バリデーション / 例外処理  
- **アクセシビリティ**：誰でも深い構造で理解できる  
- **拡張性**：比較・可視化・対話マップへの展開が容易  
- **ガイドレール思考**：自由生成ではなく構造化生成を重視  

---

## 4. ユーザーセグメント & ペルソナ (Users & Personas)

| ペルソナ | ニーズ / 課題 |
|---------|----------------|
| 一般読者 | 短時間で要点・論点・影響を理解したい |
| SNS 情報に流されがちな人 | 偏りなく整理された事実が欲しい |
| 教育者・学生 | 構造化ニュースを教材として活用したい |
| ジャーナリスト・研究者 | 複数記事比較のための構造化データが欲しい |
| NPO / 市民活動家 | 社会課題の因果・価値観・立場を整理したい |

---

## 5. ユースケース (Use Cases)

- 通勤中にニュースの「要点 → 論点 → 構造」を 5 分で把握  
- SNS で流れてきた記事の信頼性をチェック  
- 教材としてニュースの構造を説明  
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
- 入力：URL or 本文  
- 処理：抽出 → 正規化 → LLM 解析  
- 出力：JSON + result_id  

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

### analysis_result table
| column | description |
|--------|-------------|
| result_id | 結果ページ用短縮 ID |
| json_result | 解析結果 JSON |
| version_id | LLM / Schema バージョン |
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
- 5000 字超 → 要約抽出モード  
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

---

## 13. UI/UX デザインガイドライン (UI Design System)

### 13.1 基本方針
- 階層構造が直感的に見える  
- モバイル最適  
- 「解析 → 理解 → 共有」を短く  

### 13.2 コンポーネント
- URLInput  
- SummaryBlock  
- IssuesList  
- CausalMapTree  
- ShareURLButton  
- ResultCardMeta  

### 13.3 共有 UI
- /r/:result_id ページ  
- Summary / Issues / Stances をコンパクトに  
- SNS 共有ボタン  

---

## 14. ワークフロー (Workflow)

1. URL / テキスト入力  
2. 本文抽出  
3. 正規化  
4. LLM 分析  
5. JSON バリデーション  
6. JSON Correction Flow  
7. Supabase 保存  
8. result_id 発行  
9. 結果ページ生成  

---

## 15. 運用・モニタリング (Operations & Monitoring)

- 抽出成功率  
- LLM 応答時間  
- JSON パースエラー率  
- API コスト  
- 結果ページ閲覧数・共有数  

これらを継続改善に活用する。

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

---

## 17. リスク & 検証ポイント (Risks & Validation)

### 主なリスク
- 抽出失敗  
- ハルシネーション  
- モデル更新による揺れ  
- JSON 不整形  
- バイアス再生産  

### 対策
- Text Extraction Policy  
- LLM I/O Policy  
- JSON Correction Flow  
- version_id 管理  
- uncertainties 分離  

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
