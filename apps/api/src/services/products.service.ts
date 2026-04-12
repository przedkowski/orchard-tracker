import { prisma } from "../db.js";

const DEFAULT_PRODUCTS = [
  // Fungicides
  { name: "Boscalid", category: "Fungicide" },
  { name: "Captan", category: "Fungicide" },
  { name: "Copper hydroxide", category: "Fungicide" },
  { name: "Cyprodinil", category: "Fungicide" },
  { name: "Difenoconazole", category: "Fungicide" },
  { name: "Fludioxonil", category: "Fungicide" },
  { name: "Mancozeb", category: "Fungicide" },
  { name: "Myclobutanil", category: "Fungicide" },
  { name: "Penconazole", category: "Fungicide" },
  { name: "Sulfur", category: "Fungicide" },
  { name: "Tebuconazole", category: "Fungicide" },
  { name: "Thiophanate-methyl", category: "Fungicide" },
  { name: "Trifloxystrobin", category: "Fungicide" },
  { name: "Ziram", category: "Fungicide" },
  // Insecticides
  { name: "Abamectin", category: "Insecticide" },
  { name: "Acetamiprid", category: "Insecticide" },
  { name: "Chlorpyrifos", category: "Insecticide" },
  { name: "Deltamethrin", category: "Insecticide" },
  { name: "Imidacloprid", category: "Insecticide" },
  { name: "Kaolin clay", category: "Insecticide" },
  { name: "Lambda-cyhalothrin", category: "Insecticide" },
  { name: "Pirimicarb", category: "Insecticide" },
  { name: "Spinosad", category: "Insecticide" },
  { name: "Thiacloprid", category: "Insecticide" },
  // Herbicides
  { name: "Clopyralid", category: "Herbicide" },
  { name: "Flazasulfuron", category: "Herbicide" },
  { name: "Glyphosate", category: "Herbicide" },
  { name: "Oxyfluorfen", category: "Herbicide" },
  { name: "Paraquat", category: "Herbicide" },
  { name: "Pendimethalin", category: "Herbicide" },
  { name: "Propyzamide", category: "Herbicide" },
  { name: "Simazine", category: "Herbicide" },
  // Fertilizers
  { name: "Boron", category: "Fertilizer" },
  { name: "Calcium nitrate", category: "Fertilizer" },
  { name: "Foliar calcium", category: "Fertilizer" },
  { name: "Iron chelate", category: "Fertilizer" },
  { name: "Magnesium sulfate", category: "Fertilizer" },
  { name: "NPK 20-20-20", category: "Fertilizer" },
  { name: "Potassium sulfate", category: "Fertilizer" },
  { name: "Urea", category: "Fertilizer" },
  // Other
  { name: "Dormant oil", category: "Other" },
  { name: "Kaolin clay (deterrent)", category: "Other" },
  { name: "Neem oil", category: "Other" },
  { name: "Plant growth regulator", category: "Other" },
];

async function ensureSeeded(userId: string) {
  const count = await prisma.userProduct.count({ where: { userId } });
  if (count === 0) {
    await prisma.userProduct.createMany({
      data: DEFAULT_PRODUCTS.map((p) => ({ ...p, userId })),
      skipDuplicates: true,
    });
  }
}

export async function listProducts(userId: string) {
  await ensureSeeded(userId);
  return prisma.userProduct.findMany({
    where: { userId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true },
  });
}

export async function createProduct(
  userId: string,
  input: { name: string; category: string },
) {
  return prisma.userProduct.upsert({
    where: { userId_name: { userId, name: input.name } },
    create: { ...input, userId },
    update: { category: input.category },
    select: { id: true, name: true, category: true },
  });
}

export async function deleteProduct(userId: string, productId: string) {
  const product = await prisma.userProduct.findFirst({
    where: { id: productId, userId },
  });
  if (!product) throw new Error("Product not found");
  await prisma.userProduct.delete({ where: { id: productId } });
}

export async function autoSaveProduct(
  userId: string,
  name: string,
  category: string,
) {
  await prisma.userProduct.upsert({
    where: { userId_name: { userId, name } },
    create: { name, category, userId },
    update: {},
  });
}
