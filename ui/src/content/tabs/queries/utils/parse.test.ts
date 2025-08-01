import { describe, expect, test } from 'vitest';
import { parseQuery } from './parse';
import type { Connection } from '@/connections/types';

describe('Query parsing utils', () => {
  const mysqlConnection: Connection = {
    engine: 'mysql',
    database: 'test_db',
  } as Connection;

  const postgresConnection: Connection = {
    engine: 'postgres',
    database: 'test_db',
    schema: 'public',
  } as Connection;

  describe('parseQuery', () => {
    describe('MySQL', () => {
      test('parses simple SELECT statement', async () => {
        const sql = 'SELECT id, name FROM users';
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toEqual(['SELECT id, name FROM users']);
        expect(result.select).toEqual({
          database: 'test_db',
          schema: undefined,
          table: 'users',
          parsed: expect.any(Object),
        });
      });

      test('handles database-qualified table', async () => {
        const sql = 'SELECT id, name FROM other_db.users';
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toEqual(['SELECT id, name FROM other_db.users']);
        expect(result.select).toEqual({
          database: 'other_db',
          schema: undefined,
          table: 'users',
          parsed: expect.any(Object),
        });
      });

      test('returns null select for non-SELECT statements', async () => {
        const sql = 'INSERT INTO users (id, name) VALUES (1, "test")';
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toEqual(['INSERT INTO users (id, name) VALUES (1, "test")']);
        expect(result.select).toBeNull();
      });

      test('returns null select for complex SELECT statements', async () => {
        const sql = 'SELECT COUNT(*) as count FROM users';
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toEqual(['SELECT COUNT(*) as count FROM users']);
        expect(result.select).toBeNull();
      });

      test('returns null select for multi-table SELECT statements', async () => {
        const sql = 'SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id';
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toEqual([
          'SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id',
        ]);
        expect(result.select).toBeNull();
      });
    });

    describe('PostgreSQL', () => {
      test('parses simple SELECT statement', async () => {
        const sql = 'SELECT id, name FROM users';
        const result = await parseQuery({ connection: postgresConnection, sql });

        expect(result.statements).toEqual(['SELECT id, name FROM users']);
        expect(result.select).toEqual({
          database: 'test_db',
          schema: 'public',
          table: 'users',
          parsed: expect.any(Object),
        });
      });

      test('handles schema-qualified table', async () => {
        const sql = 'SELECT id, name FROM custom_schema.users';
        const result = await parseQuery({ connection: postgresConnection, sql });

        expect(result.statements).toEqual(['SELECT id, name FROM custom_schema.users']);
        expect(result.select).toEqual({
          database: 'test_db',
          schema: 'custom_schema',
          table: 'users',
          parsed: expect.any(Object),
        });
      });

      test('returns null select for non-SELECT statements', async () => {
        const sql = "INSERT INTO users (id, name) VALUES (1, 'test')";
        const result = await parseQuery({ connection: postgresConnection, sql });

        expect(result.statements).toEqual(["INSERT INTO users (id, name) VALUES (1, 'test')"]);
        expect(result.select).toBeNull();
      });

      test('returns null select for complex SELECT statements', async () => {
        const sql = 'SELECT COUNT(*) as count FROM users';
        const result = await parseQuery({ connection: postgresConnection, sql });

        expect(result.statements).toEqual(['SELECT COUNT(*) as count FROM users']);
        expect(result.select).toBeNull();
      });

      test('returns null select for multi-table SELECT statements', async () => {
        const sql = 'SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id';
        const result = await parseQuery({ connection: postgresConnection, sql });

        expect(result.statements).toEqual([
          'SELECT u.id, u.name FROM users u JOIN orders o ON u.id = o.user_id',
        ]);
        expect(result.select).toBeNull();
      });
    });

    describe('General', () => {
      test('returns null select for multiple statements', async () => {
        const sql = `
          SELECT id, name FROM users;
          SELECT id, name FROM products;
        `;
        const result = await parseQuery({ connection: mysqlConnection, sql });

        expect(result.statements).toHaveLength(2);
        expect(result.select).toBeNull();
      });

      test('handles empty SQL input', async () => {
        const result = await parseQuery({ connection: mysqlConnection, sql: '' });

        expect(result.statements).toEqual([]);
        expect(result.select).toBeNull();
      });
    });
  });
});
