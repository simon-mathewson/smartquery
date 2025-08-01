import { Decimal } from "@prisma/client/runtime/library";

export type PrismaValue =
  | string
  | string[]
  | number
  | boolean
  | Date
  | Decimal
  | null;
