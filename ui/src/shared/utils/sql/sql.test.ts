import { describe, expect, test } from 'vitest';
import { addQuotes, escapeValue, splitSqlStatements } from './sql';

describe('SQL utils', () => {
  describe('addQuotes', () => {
    test('MySQL', () => {
      expect(addQuotes('mysql', 'table')).toBe('`table`');
    });

    test('PostgreSQL', () => {
      expect(addQuotes('postgres', 'table')).toBe('"table"');
    });

    test('SQLite', () => {
      expect(addQuotes('sqlite', 'table')).toBe('"table"');
    });
  });

  describe('escapeValue', () => {
    test('MySQL escapes single quotes and backslashes', () => {
      expect(escapeValue('mysql', "Hello 'World'")).toBe("Hello ''World''");
      expect(escapeValue('mysql', 'Back\\slash')).toBe('Back\\\\slash');
      expect(escapeValue('mysql', 'It\'s a "test"')).toBe('It\'\'s a "test"');
    });

    test('PostgreSQL escapes single quotes', () => {
      expect(escapeValue('postgres', "Hello 'World'")).toBe("Hello ''World''");
      expect(escapeValue('postgres', 'Back\\slash')).toBe('Back\\slash');
      expect(escapeValue('postgres', 'It\'s a "test"')).toBe('It\'\'s a "test"');
    });

    test('SQLite escapes single quotes', () => {
      expect(escapeValue('sqlite', "Hello 'World'")).toBe("Hello ''World''");
      expect(escapeValue('sqlite', 'Back\\slash')).toBe('Back\\slash');
      expect(escapeValue('sqlite', 'It\'s a "test"')).toBe('It\'\'s a "test"');
    });

    test('handles multiple consecutive quotes', () => {
      expect(escapeValue('mysql', "Multiple''quotes")).toBe("Multiple''''quotes");
      expect(escapeValue('postgres', "Multiple''quotes")).toBe("Multiple''''quotes");
      expect(escapeValue('sqlite', "Multiple''quotes")).toBe("Multiple''''quotes");
    });

    test('handles empty string', () => {
      expect(escapeValue('mysql', '')).toBe('');
      expect(escapeValue('postgres', '')).toBe('');
      expect(escapeValue('sqlite', '')).toBe('');
    });

    test('handles string without special characters', () => {
      expect(escapeValue('mysql', 'Hello World')).toBe('Hello World');
      expect(escapeValue('postgres', 'Hello World')).toBe('Hello World');
      expect(escapeValue('sqlite', 'Hello World')).toBe('Hello World');
    });

    test('handles newlines and other special characters', () => {
      expect(escapeValue('mysql', 'Line\nbreak')).toBe('Line\nbreak');
      expect(escapeValue('postgres', 'Line\nbreak')).toBe('Line\nbreak');
      expect(escapeValue('sqlite', 'Line\nbreak')).toBe('Line\nbreak');
    });
  });

  describe('splitSqlStatements', () => {
    test('splits SQL statements', () => {
      const sql = `
        CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255));
        INSERT INTO users (id, name) VALUES (1, 'Alice')
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255))',
        "INSERT INTO users (id, name) VALUES (1, 'Alice')",
      ]);
    });

    test('ignores comments', () => {
      const sql = `
        CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255));
        -- This is a comment
        INSERT INTO users (id, name) /* comment */ VALUES (1, 'Alice')
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255))',
        "INSERT INTO users (id, name)  VALUES (1, 'Alice')",
      ]);
    });

    test('preserves comments inside single quotes', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, 'Alice -- This is not a comment');
        INSERT INTO users (id, name) VALUES (2, 'Bob /* This is also not a comment */');
      `;

      expect(splitSqlStatements(sql)).toEqual([
        "INSERT INTO users (id, name) VALUES (1, 'Alice -- This is not a comment')",
        "INSERT INTO users (id, name) VALUES (2, 'Bob /* This is also not a comment */')",
      ]);
    });

    test('preserves comments inside double quotes', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, "Alice -- This is not a comment");
        INSERT INTO users (id, name) VALUES (2, "Bob /* This is also not a comment */");
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'INSERT INTO users (id, name) VALUES (1, "Alice -- This is not a comment")',
        'INSERT INTO users (id, name) VALUES (2, "Bob /* This is also not a comment */")',
      ]);
    });

    test('preserves comments inside backticks', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, \`Alice -- This is not a comment\`);
        INSERT INTO users (id, name) VALUES (2, \`Bob /* This is also not a comment */\`);
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'INSERT INTO users (id, name) VALUES (1, `Alice -- This is not a comment`)',
        'INSERT INTO users (id, name) VALUES (2, `Bob /* This is also not a comment */`)',
      ]);
    });

    test('handles mixed quotes and comments', () => {
      const sql = `
        -- This comment should be removed
        INSERT INTO users (id, name) VALUES (1, 'Alice -- This comment should stay');
        /* This comment should be removed */
        INSERT INTO users (id, name) VALUES (2, "Bob /* This comment should stay */");
      `;

      expect(splitSqlStatements(sql)).toEqual([
        "INSERT INTO users (id, name) VALUES (1, 'Alice -- This comment should stay')",
        'INSERT INTO users (id, name) VALUES (2, "Bob /* This comment should stay */")',
      ]);
    });

    test('handles semicolons inside single-quoted strings', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, 'Alice; Bob');
        INSERT INTO users (id, name) VALUES (2, 'Charlie; David');
      `;

      expect(splitSqlStatements(sql)).toEqual([
        "INSERT INTO users (id, name) VALUES (1, 'Alice; Bob')",
        "INSERT INTO users (id, name) VALUES (2, 'Charlie; David')",
      ]);
    });

    test('handles semicolons inside double-quoted strings', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, "Alice; Bob");
        INSERT INTO users (id, name) VALUES (2, "Charlie; David");
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'INSERT INTO users (id, name) VALUES (1, "Alice; Bob")',
        'INSERT INTO users (id, name) VALUES (2, "Charlie; David")',
      ]);
    });

    test('handles semicolons inside backtick strings', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, \`Alice; Bob\`);
        INSERT INTO users (id, name) VALUES (2, \`Charlie; David\`);
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'INSERT INTO users (id, name) VALUES (1, `Alice; Bob`)',
        'INSERT INTO users (id, name) VALUES (2, `Charlie; David`)',
      ]);
    });

    test('handles multiline quoted strings with semicolons', () => {
      const sql = `
        INSERT INTO users (id, name) VALUES (1, 'Alice;
        Bob; Charlie');
        INSERT INTO users (id, name) VALUES (2, "David;
        Eve; Frank");
      `;

      expect(splitSqlStatements(sql)).toEqual([
        "INSERT INTO users (id, name) VALUES (1, 'Alice;\n        Bob; Charlie')",
        'INSERT INTO users (id, name) VALUES (2, "David;\n        Eve; Frank")',
      ]);
    });

    test('handles complex nested quotes and semicolons', () => {
      const sql = `
        INSERT INTO users (id, name, description) VALUES (1, 'Alice', "She said 'Hello; World!'");
        INSERT INTO users (id, name, description) VALUES (2, 'Bob', 'He said "Goodbye; Universe!"');
      `;

      expect(splitSqlStatements(sql)).toEqual([
        "INSERT INTO users (id, name, description) VALUES (1, 'Alice', \"She said 'Hello; World!'\")",
        "INSERT INTO users (id, name, description) VALUES (2, 'Bob', 'He said \"Goodbye; Universe!\"')",
      ]);
    });

    test('returns empty array for empty string', () => {
      expect(splitSqlStatements('')).toEqual([]);
    });
  });
});
