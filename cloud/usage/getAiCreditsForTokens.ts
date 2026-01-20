// 1 Credit = $0.01 USD https://platform.openai.com/docs/pricing
export const pricing = {
  'gpt-5.1-codex-mini': {
    creditsPerInputToken: 25 / 1_000_000,
    creditsPerCachedInputToken: 2.5 / 1_000_000,
    creditsPerOutputToken: 200 / 1_000_000,
  },
};

export const getAiCreditsForTokens = (props: {
  model: keyof typeof pricing;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}) => {
  const { model, inputTokens, cachedInputTokens = 0, outputTokens } = props;
  const { creditsPerInputToken, creditsPerCachedInputToken, creditsPerOutputToken } =
    pricing[model];

  const uncachedInputTokens = inputTokens - cachedInputTokens;

  return (
    uncachedInputTokens * creditsPerInputToken +
    cachedInputTokens * creditsPerCachedInputToken +
    outputTokens * creditsPerOutputToken
  );
};
