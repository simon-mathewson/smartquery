import { Connector } from "./types";
import { PostgresClient } from "./prisma";
import { PrismaValue } from "@/prisma/types";

export const runQuery = async (connector: Connector, statements: string[]) => {
  const { prisma } = connector;

  return (prisma as PostgresClient).$transaction(
    statements.map((statement) =>
      (prisma as PostgresClient).$queryRawUnsafe<
        Array<Record<string, PrismaValue>>
      >(statement)
    )
  );
};
