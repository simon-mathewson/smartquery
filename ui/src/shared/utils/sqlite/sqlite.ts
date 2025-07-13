export const sqliteChooseFileOptions = {
  types: [
    {
      description: 'SQLite database',
      accept: {
        'application/vnd.sqlite3': ['.sqlite', '.sqlite3', '.db'],
      },
    },
  ],
} satisfies Parameters<typeof window.showOpenFilePicker>[0];
