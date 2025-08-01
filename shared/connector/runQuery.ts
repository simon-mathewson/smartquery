import { Connector } from "./types";
import { PostgresClient } from "./prisma";
import { PrismaValue } from "@/prisma/types";

export type Results = Array<Array<Record<string, PrismaValue>>>;

export const runQuery = async (
  connector: Connector,
  statements: string[]
): Promise<Results> => {
  const { prisma } = connector;

  return (prisma as PostgresClient).$transaction(
    statements.map((statement) =>
      (prisma as PostgresClient).$queryRawUnsafe<
        Array<Record<string, PrismaValue>>
      >(statement)
    )
  );
};
