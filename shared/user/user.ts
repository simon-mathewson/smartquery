import { z } from "zod";

export const currentUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  subscription: z.object({ type: z.enum(["plus", "pro"]) }).nullable(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;
