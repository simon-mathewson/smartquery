import 'monaco-sql-languages/esm/languages/mysql/mysql.contribution';
import 'monaco-sql-languages/esm/languages/pgsql/pgsql.contribution';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import PGSQLWorker from 'monaco-sql-languages/esm/languages/pgsql/pgsql.worker?worker';
import MySQLWorker from 'monaco-sql-languages/esm/languages/mysql/mysql.worker?worker';
import { LanguageIdEnum } from 'monaco-sql-languages';

self.MonacoEnvironment = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWorker(_: any, label: string) {
    if (label === LanguageIdEnum.PG) {
      return new PGSQLWorker();
    }
    if (label === LanguageIdEnum.MYSQL) {
      return new MySQLWorker();
    }
    return new EditorWorker();
  },
};
