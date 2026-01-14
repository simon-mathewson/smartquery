export type UserPasswordModalInput = {
  title?: string;
  onSubmit: (password: string) => Promise<void>;
};
