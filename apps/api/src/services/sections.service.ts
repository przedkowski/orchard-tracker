import { prisma } from "../db.js";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export async function listSections(userId: string) {
  return prisma.orchardSection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSection(userId: string, sectionId: string) {
  const section = await prisma.orchardSection.findFirst({
    where: { id: sectionId, userId },
  });
  if (!section) throw new NotFoundError("Section not found");
  return section;
}

export async function createSection(
  userId: string,
  input: { name: string; cropType: string; areaHa: number; notes?: string },
) {
  return prisma.orchardSection.create({
    data: { ...input, userId },
  });
}

export async function updateSection(
  userId: string,
  sectionId: string,
  input: { name?: string; cropType?: string; areaHa?: number; notes?: string },
) {
  await getSection(userId, sectionId);
  return prisma.orchardSection.update({
    where: { id: sectionId },
    data: input,
  });
}

export async function deleteSection(userId: string, sectionId: string) {
  await getSection(userId, sectionId);
  await prisma.orchardSection.delete({ where: { id: sectionId } });
}
