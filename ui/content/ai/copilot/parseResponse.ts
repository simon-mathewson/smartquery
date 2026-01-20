import type { ThreadMessage } from './types';

export const parseResponse = (response: string): ThreadMessage[] => {
  const result: ThreadMessage[] = [];

  try {
    // Try to parse the complete response as JSON first
    const parsed = JSON.parse(response);
    if ('parts' in parsed && Array.isArray(parsed.parts)) {
      return parsed.parts;
    }
  } catch {
    // If parsing fails, try to extract partial items
  }

  // Strip leading boilerplate
  const cleanResponse = response.replace(/^{"parts":\[/, '');

  let i = 0;
  while (i < cleanResponse.length) {
    const char = cleanResponse[i];

    // Skip whitespace and commas between items
    if (/[,\s]/.test(char)) {
      i++;
      continue;
    }

    if (char === '"') {
      const extractedString = extractString(cleanResponse, i) ?? '';
      try {
        const [stringItem] = JSON.parse(`["${extractedString}"]`) as string[];
        if (stringItem) {
          result.push(stringItem);
          i += extractedString.length + 2; // +2 for the quotes
        } else {
          i++;
        }
        continue;
      } catch {
        return result;
      }
    }

    if (char === '{') {
      // Object item - find the closing brace
      const objectResult = extractObject(cleanResponse, i);

      if (result) {
        try {
          const parsed = JSON.parse(objectResult);
          result.push(parsed);
        } catch {
          // Try to get name and SQL from incomplete JSON object
          const matchResult = objectResult.match(
            /\{\s*"name"\s*:\s*"((?:\\"|[^"])*)(?:"\s*,\s*"sql"\s*:\s*"((?:\\"|[^"])*))?/,
          );
          if (matchResult) {
            const [, name, sql] = matchResult;

            try {
              // Unescape the strings by parsing them as JSON string values
              const unescapePartialString = (str: string) => {
                // Remove trailing backslashes (incomplete control characters)
                const cleanStr = str.replace(/\\+$/, '');
                return JSON.parse(`"${cleanStr}"`);
              };

              const unescapedName = unescapePartialString(name ?? '');
              const unescapedSql = unescapePartialString(sql ?? '');

              result.push({
                name: unescapedName,
                sql: unescapedSql,
              });
            } catch (error) {
              console.error(error);
              return result;
            }
          }
        }
        i += objectResult.length;
        continue;
      }
    }

    i++;
  }

  return result;
};

function extractString(str: string, startIndex: number): string | null {
  let i = startIndex + 1; // Skip opening quote
  let result = '';
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
    } else if (char === '\\') {
      result += char;
      escapeNext = true;
    } else if (char === '"') {
      // Found closing quote
      return result;
    } else {
      result += char;
    }
    i++;
  }

  return result;
}

function extractObject(str: string, startIndex: number) {
  let i = startIndex;
  let result = '';
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];

    if (escapeNext) {
      result += char;
      escapeNext = false;
    } else if (char === '\\') {
      result += char;
      escapeNext = true;
    } else if (char === '"' && !escapeNext) {
      inString = !inString;
      result += char;
    } else if (char === '{' && !inString) {
      braceCount++;
      result += char;
    } else if (char === '}' && !inString) {
      braceCount--;
      result += char;
      if (braceCount === 0) {
        // Found closing brace
        return result;
      }
    } else {
      result += char;
    }
    i++;
  }

  return result;
}
