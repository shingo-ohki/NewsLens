export function buildAnalyzePrompt(inputText: string): string {
  return `記事を分析してJSON形式で返してください。JSON以外は出力しないでください。

出力形式（必ず完全で有効なJSONを返す）:
{
  "summary": {"100": "約100文字", "300": "約300文字", "600": "約600文字"},
  "key_points": ["要点1", "要点2", "要点3"],
  "actors": [{"name": "X", "type": "individual|organization|region|institution|other", "description": "簡潔な説明"}],
  "issues": ["論点1", "論点2"],
  "stances": [{"actor": "X", "stance": "立場説明", "stance_type": "support|oppose|mixed|unclear|neutral|other", "evidence": "引用"}],
  "causal_map": [{"problem": "問題", "causes": ["原因"], "mechanisms": ["メカニズム"], "consequences": ["結果"], "notes": ""}],
  "underlying_values": ["価値観1", "価値観2"],
  "uncertainties": ["不確実性1", "不確実性2"]
}

厳密なルール:
1. JSONのみを出力。他のテキストは絶対に出力しない。
2. すべてのテキストを極めて簡潔に。1文のみ。
3. key_pointsは最大3-5項目。
4. actorsは最大3-4項目。
5. issuesは最大2-3項目。
6. causal_mapは1エントリのみ。
7. underlying_valuesは最大2項目。
8. uncertaintiesは最大2項目。
9. 記事にない事実を追加しない。
10. 不明なactorを追加しない。
11. JSONを途中で切らない。完全で有効なJSONを返す。
12. JSONの末尾に余分なカンマを付けない。
13. 出力は日本語で。

記事:
${inputText}

JSONを返してください:`
}

export function buildCorrectionPrompt(originalRawOutput: string, inputText: string) {
  return `Your previous output did not follow the schema. Return corrected JSON only using the same schema description.

Original Article:
${inputText}

Previous output:
${originalRawOutput}

Return corrected JSON only. Do not add commentary.`
}

export default buildAnalyzePrompt
