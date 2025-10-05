import { describe, it, expect } from 'vitest';
import { parseResponse } from './parseResponse';

describe('parseResponse', () => {
  it('should parse a complete JSON array', () => {
    const response = '["Hello", {"name": "Test Query", "sql": "SELECT * FROM users"}]';
    const result = parseResponse(response);

    expect(result).toEqual([
      'Hello',
      {
        name: 'Test Query',
        sql: 'SELECT * FROM users',
      },
    ]);
  });

  it('should parse partial text', () => {
    const response = `[\n  "Here are a few example q`;
    const result = parseResponse(response);

    expect(result).toEqual(['Here are a few example q']);
  });

  it('should parse partial name', () => {
    const response = `[\n  "Here are a few example queries:",\n  {\n    "name": "Select all ar`;
    const result = parseResponse(response);

    expect(result).toEqual([
      'Here are a few example queries:',
      {
        name: 'Select all ar',
        sql: '',
      },
    ]);
  });

  it('should parse partial SQL', () => {
    const response = `[\n  "Here are a few example queries:",\n  {\n    "name": "Select all artists",\n    "sql": "SELECT * FROM `;
    const result = parseResponse(response);

    expect(result).toEqual([
      'Here are a few example queries:',
      {
        name: 'Select all artists',
        sql: 'SELECT * FROM ',
      },
    ]);
  });

  it('should parse partial chart', () => {
    const response = `[\n  "Here are a few example queries:",\n  {\n    "name": "Select all artists",\n    "sql": "SELECT * FROM artists;",\n    "chart": {\n      "type": "bar",\n      "xColumn": "ArtistId",\n      "xTable": "artists",\n      "yColumn": "Name",\n      "yTable":\n`;
    const result = parseResponse(response);

    expect(result).toEqual([
      'Here are a few example queries:',
      {
        name: 'Select all artists',
        sql: 'SELECT * FROM artists;',
      },
    ]);
  });

  it('should handle escaped quotes in strings', () => {
    const response = `["This query retrieves all columns and all rows from the \\"artists\\" table"]`;
    const result = parseResponse(response);

    expect(result).toEqual([
      'This query retrieves all columns and all rows from the "artists" table',
    ]);
  });

  it('should handle multiple complete objects in partial response', () => {
    const response = `[\n  "Here are a few example queries:",\n  {\n    "name": "Select all artists",\n    "sql": "SELECT * FROM artists;"\n  },\n  "This query retrieves all columns",\n  {\n    "name": "Find albums by artist",\n    "sql": "SELECT * FROM albums WHERE artist_id = 1"\n  }\n]`;
    const result = parseResponse(response);

    expect(result).toEqual([
      'Here are a few example queries:',
      {
        name: 'Select all artists',
        sql: 'SELECT * FROM artists;',
      },
      'This query retrieves all columns',
      {
        name: 'Find albums by artist',
        sql: 'SELECT * FROM albums WHERE artist_id = 1',
      },
    ]);
  });

  it('should handle objects with chart configuration', () => {
    const response = `{\n  "name": "Count of tracks per genre",\n  "sql": "SELECT COUNT(*) FROM tracks GROUP BY genre",\n  "chart": {\n    "type": "bar",\n    "xColumn": "Genre",\n    "xTable": "genres",\n    "yColumn": "Count",\n    "yTable": null\n  }\n}`;
    const result = parseResponse(response);

    expect(result).toEqual([
      {
        name: 'Count of tracks per genre',
        sql: 'SELECT COUNT(*) FROM tracks GROUP BY genre',
        chart: {
          type: 'bar',
          xColumn: 'Genre',
          xTable: 'genres',
          yColumn: 'Count',
          yTable: null,
        },
      },
    ]);
  });

  it('should handle empty response', () => {
    const response = '';
    const result = parseResponse(response);

    expect(result).toEqual([]);
  });

  it('should handle malformed JSON gracefully', () => {
    const response = '["Hello", {"name": "Test", "sql": "SELECT * FROM users",';
    const result = parseResponse(response);

    expect(result).toEqual([
      'Hello',
      {
        name: 'Test',
        sql: 'SELECT * FROM users',
      },
    ]);
  });

  it('should handle Gemini example chunks', () => {
    const exampleChunks = [
      `[\n  "Here are a few example queries to demonstrate different functionalities:",\n  {\n    "name": "Select all artists",\n    "sql": "SELECT *\\nFROM artists;",\n`,
      `    "chart": {\n      "type": "bar",\n      "xColumn": "ArtistId",\n      "xTable": "artists",\n      "yColumn": "Name",\n      "yTable":\n`,
      `"artists"\n    }\n  },\n  "This query retrieves all columns and all rows from the \\"artists\\" table, showing a complete list of artists in the database.",\n  {\n    "name": "Find all",\n`,
      `    "sql": "SELECT T1.Title FROM albums AS T1 INNER JOIN artists AS T2 ON T1.ArtistId = T2.ArtistId WHERE T2`,
      `.Name = 'AC/DC';",\n    "chart": {\n      "type": "bar",\n      "xColumn": "Title",\n      "xTable": "albums",\n      "yColumn": "Title`,
      `",\n      "yTable": "albums"\n    }\n  },\n  "This query joins the \\"albums\\" and \\"artists\\" tables to find all album titles associated with the artist named 'AC/DC'. It demonstrates`,
      ` how to combine information from related tables.",\n  {\n    "name": "Count of tracks per genre",\n    "sql": "SELECT T2.Name AS Genre, COUNT(T1.TrackId) AS NumberOfTracks FROM tracks `,
      `AS T1 INNER JOIN genres AS T2 ON T1.GenreId = T2.GenreId GROUP BY T2.Name ORDER BY NumberOfTracks DESC;",\n    "chart": {\n      "type": "bar",\n`,
      `      "xColumn": "Genre",\n      "xTable": "genres",\n      "yColumn": "NumberOfTracks",\n      "yTable": null\n    }\n  },\n  "This query calculates the total number of `,
      `tracks for each music genre. It uses a JOIN, an aggregate function (COUNT), and a GROUP BY clause to summarize data, then orders the results by the number of tracks in descending order."\n]`,
    ];

    const finalResult = parseResponse(exampleChunks.join(''));

    // expect(finalResult).toHaveLength(7);
    expect(finalResult).toEqual([
      'Here are a few example queries to demonstrate different functionalities:',
      {
        name: 'Select all artists',
        sql: 'SELECT *\nFROM artists;',
        chart: {
          type: 'bar',
          xColumn: 'ArtistId',
          xTable: 'artists',
          yColumn: 'Name',
          yTable: 'artists',
        },
      },
      'This query retrieves all columns and all rows from the "artists" table, showing a complete list of artists in the database.',
      {
        name: 'Find all',
        sql: "SELECT T1.Title FROM albums AS T1 INNER JOIN artists AS T2 ON T1.ArtistId = T2.ArtistId WHERE T2.Name = 'AC/DC';",
        chart: {
          type: 'bar',
          xColumn: 'Title',
          xTable: 'albums',
          yColumn: 'Title',
          yTable: 'albums',
        },
      },
      'This query joins the "albums" and "artists" tables to find all album titles associated with the artist named \'AC/DC\'. It demonstrates how to combine information from related tables.',
      {
        name: 'Count of tracks per genre',
        sql: 'SELECT T2.Name AS Genre, COUNT(T1.TrackId) AS NumberOfTracks FROM tracks AS T1 INNER JOIN genres AS T2 ON T1.GenreId = T2.GenreId GROUP BY T2.Name ORDER BY NumberOfTracks DESC;',
        chart: {
          type: 'bar',
          xColumn: 'Genre',
          xTable: 'genres',
          yColumn: 'NumberOfTracks',
          yTable: null,
        },
      },
      'This query calculates the total number of tracks for each music genre. It uses a JOIN, an aggregate function (COUNT), and a GROUP BY clause to summarize data, then orders the results by the number of tracks in descending order.',
    ]);
  });
});
