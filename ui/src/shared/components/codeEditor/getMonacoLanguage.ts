import { LanguageIdEnum } from 'monaco-sql-languages';

export const getMonacoLanguage = (language: string | undefined) => {
  switch (language) {
    case 'json':
      return 'json';
    case 'sqlite':
      return 'sql';
    case 'mysql':
      return LanguageIdEnum.MYSQL;
    case 'postgres':
      return LanguageIdEnum.PG;
    default:
      return language;
  }
};
