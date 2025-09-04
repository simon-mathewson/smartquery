import * as monaco from 'monaco-editor';
import 'monaco-sql-languages/esm/languages/mysql/mysql.contribution';
import 'monaco-sql-languages/esm/languages/pgsql/pgsql.contribution';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import PostgresWorker from 'monaco-sql-languages/esm/languages/pgsql/pgsql.worker?worker';
import MysqlWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';

import { LanguageIdEnum } from 'monaco-sql-languages';

// Set up global monaco reference for JSON contribution
(globalThis as unknown as { monaco: typeof monaco }).monaco = monaco;

// Import JSON contribution after setting up global reference
import 'monaco-editor/esm/vs/language/json/monaco.contribution';

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    switch (label) {
      case LanguageIdEnum.PG:
        return new PostgresWorker();
      case LanguageIdEnum.MYSQL:
        return new MysqlWorker();
      case 'json':
        return new JsonWorker();
      default:
        return new EditorWorker();
    }
  },
};
