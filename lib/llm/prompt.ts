export function buildAnalyzePrompt(inputText: string): string {
  return `You are an assistant that extracts the structure of a news article.
Return JSON only following the exact schema: summary (100/300/600), key_points (3-15 strings), actors (name,type,description), issues (strings), stances (actor,stance,stance_type,evidence), causal_map (problem, causes[], mechanisms[], consequences[], notes), underlying_values[], uncertainties[].

Rules:
- Output JSON only, without any additional commentary or explanation.
- If information is not present, return an empty array or empty string.
- Do not invent new actors beyond what is in the article.

Article:
${inputText}

Return the JSON now.`
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
