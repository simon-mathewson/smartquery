// 1 Credit = $0.00000001 USD (one millionth of a cent) https://platform.openai.com/docs/pricing
export const pricing = {
  'gpt-5-nano': {
    creditsPerInputToken: 5,
    creditsPerOutputToken: 40,
  },
  'gpt-5-mini': {
    creditsPerInputToken: 25,
    creditsPerOutputToken: 200,
  },
};

export const getAiCreditsForTokens = (props: {
  model: keyof typeof pricing;
  inputTokens: number;
  outputTokens: number;
}) => {
  const { model, inputTokens, outputTokens } = props;
  const { creditsPerInputToken, creditsPerOutputToken } = pricing[model];

  return Math.floor(inputTokens * creditsPerInputToken + outputTokens * creditsPerOutputToken);
};
