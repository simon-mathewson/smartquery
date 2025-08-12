// 1 Credit = $0.00001 USD https://ai.google.dev/gemini-api/docs/pricing#gemini-2.5-flash
export const creditsPerInputToken = 0.03;
export const creditsPerOutputToken = 0.25;

export const getAiCreditsForTokens = (props: { inputTokens: number; outputTokens: number }) => {
  const { inputTokens, outputTokens } = props;

  return Math.floor(inputTokens * creditsPerInputToken + outputTokens * creditsPerOutputToken);
};
