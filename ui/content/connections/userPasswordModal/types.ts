export type UserPasswordModalInput = {
  mode: 'encrypt' | 'decrypt';
  onSubmit: (password: string) => Promise<void>;
};
