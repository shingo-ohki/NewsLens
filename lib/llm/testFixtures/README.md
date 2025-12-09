# LLM Test Fixtures ガイド

実APIレスポンスをテスト用フィクスチャとして保存・再利用することで、開発時のAPI費用を削減できます。

---

## 使い方

### 1️⃣ 実APIレスポンスを保存

`.env.local`を以下のように設定：

```env
USE_MOCK_LLM=false
OPENAI_API_KEY=sk-...（実際のキー）
SAVE_LLM_FIXTURES=true
```

このとき、実記事のURL/テキストを入力してAnalyzeボタンをクリックします。

✅ 成功時、ターミナルに以下のログが出力：
```
✅ Test fixture saved: testFixture.json
```

### 2️⃣ 保存したフィクスチャを自動使用

以降の開発では、`.env.local`を以下のように設定：

```env
USE_MOCK_LLM=true
SAVE_LLM_FIXTURES=false
```

`USE_MOCK_LLM=true`のとき、自動的に`testFixture.json`が読み込まれます。

ターミナルログ：
```
📦 Using test fixture (gpt-4o-mini)
```

これで**API費用なしで** 保存済みレスポンスを使い回せます。

---

## ファイル構成

```
lib/llm/testFixtures/
├── testFixture.json      ← 保存済みレスポンス（常に最新版に上書き）
├── saveFixture.ts        ← 保存/読み込み関数
└── README.md             ← このファイル
```

### testFixture.json の内容例

```json
{
  "timestamp": "2025-12-09T09:45:40.817Z",
  "inputHash": "cd92d1f5",
  "rawOutput": "{\"summary\": {...}, ...}",
  "model": "gpt-4o-mini"
}
```

---

## 推奨フロー

| 段階              | 設定                                           | 目的                |
|-------------------|------------------------------------------------|-------------------|
| **初期テスト**    | `USE_MOCK_LLM=false` + `SAVE_LLM_FIXTURES=true` | 実APIで検証＆保存  |
| **反復開発**      | `USE_MOCK_LLM=true` + `SAVE_LLM_FIXTURES=false` | API費用削減       |
| **本番検証**      | `USE_MOCK_LLM=false` + `SAVE_LLM_FIXTURES=false` | 最新の精度確認     |

---

## 注意事項

- フィクスチャはサーバーサイドのみ保存（`Node.js`環境前提）
- クライアントサイド（ブラウザ）では保存・読み込みは実行されません
- `testFixture.json`は常に最新版で上書きされます
- 旧フィクスチャは自動削除されます
