import { prisma } from "../db.js";
import { NotFoundError } from "./sections.service.js";

export async function listSprays(
  userId: string,
  filters?: { sectionId?: string; from?: Date; to?: Date },
) {
  return prisma.sprayRecord.findMany({
    where: {
      userId,
      ...(filters?.sectionId && { sectionId: filters.sectionId }),
      ...((filters?.from || filters?.to) && {
        sprayedAt: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
    },
    include: { section: { select: { id: true, name: true, cropType: true } } },
    orderBy: { sprayedAt: "desc" },
  });
}

export async function getSpray(userId: string, sprayId: string) {
  const spray = await prisma.sprayRecord.findFirst({
    where: { id: sprayId, userId },
    include: { section: true },
  });
  if (!spray) throw new NotFoundError("Spray record not found");
  return spray;
}

export async function createSpray(
  userId: string,
  input: {
    sectionId: string;
    productName: string;
    category: string;
    doseLPerHa: number;
    sprayedAt: Date;
    weatherNote?: string;
    notes?: string;
  },
) {
  const section = await prisma.orchardSection.findFirst({
    where: { id: input.sectionId, userId },
  });
  if (!section) throw new NotFoundError("Section not found");

  return prisma.sprayRecord.create({
    data: { ...input, userId },
    include: { section: { select: { id: true, name: true, cropType: true } } },
  });
}

export async function deleteSpray(userId: string, sprayId: string) {
  await getSpray(userId, sprayId);
  await prisma.sprayRecord.delete({ where: { id: sprayId } });
}
