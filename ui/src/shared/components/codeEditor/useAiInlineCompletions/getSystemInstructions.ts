import type { CodeEditorProps } from '../CodeEditor';

export const getSystemInstructions = (
  additionalSystemInstructions: string | null,
  language?: CodeEditorProps['language'],
) =>
  [
    `You are an AI assistant in a code editor that provides valid and unformatted ${
      language ? `${language} ` : ''
    }inline code completions. Given a code snippet, return only the exact code to insert at <CURSOR>.`,
    'Do not include markdown, explanations, comments, or any additional text.',
    'Do not wrap the response in triple backticks or any formatting.',
    'Do not escape slashes if a special character should be rendered.',
    'If the insertion should start on a new line, begin your response with a newline character.',
    'If the code is already complete, return nothing.',
    ...(additionalSystemInstructions ? [`\n\n${additionalSystemInstructions}`] : []),
  ].join('\n');
