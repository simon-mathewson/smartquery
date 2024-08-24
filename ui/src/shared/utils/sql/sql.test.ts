import { describe, expect, test } from 'vitest';
import { addQuotes, splitSqlStatements } from './sql';

describe('SQL utils', () => {
  describe('addQuotes', () => {
    test('MySQL', () => {
      expect(addQuotes('mysql', 'table')).toBe('`table`');
    });

    test('PostgreSQL', () => {
      expect(addQuotes('postgresql', 'table')).toBe('"table"');
    });
  });

  describe('splitSqlStatements', () => {
    test('splits SQL statements', () => {
      const sql = `
        CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255));
        INSERT INTO users (id, name) VALUES (1, 'Alice')
      `;

      expect(splitSqlStatements(sql)).toEqual([
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255));',
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
        'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(255));',
        "INSERT INTO users (id, name)  VALUES (1, 'Alice')",
      ]);
    });

    test('returns empty array for empty string', () => {
      expect(splitSqlStatements('')).toEqual([]);
    });
  });
});
