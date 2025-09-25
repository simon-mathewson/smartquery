import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

export const responseSchema = {
  type: Type.ARRAY,
  items: {
    anyOf: [
      {
        type: Type.STRING,
      },
      {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
          },
          sql: {
            type: Type.STRING,
          },
          chart: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                enum: ['bar', 'line', 'pie'],
              },
              xColumn: {
                type: Type.STRING,
              },
              xTable: {
                type: Type.STRING,
                nullable: true,
              },
              yColumn: {
                type: Type.STRING,
              },
              yTable: {
                type: Type.STRING,
                nullable: true,
              },
            },
            required: ['type', 'xColumn', 'xTable', 'yColumn', 'yTable'],
          },
        },
        required: ['name', 'sql'],
      },
    ],
  },
} satisfies Schema;
