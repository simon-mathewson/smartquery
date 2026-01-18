// 1 Credit = $0.01 USD https://platform.openai.com/docs/pricing
export const pricing = {
  'gpt-5.1-codex-mini': {
    creditsPerInputToken: 25 / 1_000_000,
    creditsPerOutputToken: 200 / 1_000_000,
  },
};

export const getAiCreditsForTokens = (props: {
  model: keyof typeof pricing;
  inputTokens: number;
  outputTokens: number;
}) => {
  const { model, inputTokens, outputTokens } = props;
  const { creditsPerInputToken, creditsPerOutputToken } = pricing[model];

  return inputTokens * creditsPerInputToken + outputTokens * creditsPerOutputToken;
};
