/**
 * Seed script — populates the DB with realistic orchard data for the first user found.
 * Usage: npm run db:seed -w apps/api
 *
 * Target user can be overridden: SEED_EMAIL=you@example.com npm run db:seed -w apps/api
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(8, 0, 0, 0);
  return d;
}

async function main() {
  const targetEmail = process.env.SEED_EMAIL;

  const user = targetEmail
    ? await prisma.user.findUnique({ where: { email: targetEmail } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  if (!user) {
    console.error("No user found. Sign up first, then run the seed.");
    process.exit(1);
  }

  console.log(`Seeding for user: ${user.email} (${user.id})`);

  // --- Sections ---
  const sectionDefs = [
    { name: "North Block", cropType: "Apple", areaHa: 2.4, notes: "Cox and Gala mix, planted 2018" },
    { name: "South Orchard", cropType: "Pear", areaHa: 1.8, notes: "Conference variety, prone to scab" },
    { name: "East Row", cropType: "Cherry", areaHa: 0.9, notes: "Stella cultivar, bird-net installed" },
    { name: "West Plot", cropType: "Plum", areaHa: 1.2, notes: "Victoria plums, good drainage" },
    { name: "Nursery Block", cropType: "Apple", areaHa: 0.6, notes: "Young trees, second leaf" },
  ];

  const sections = await Promise.all(
    sectionDefs.map((s) =>
      prisma.orchardSection.upsert({
        where: {
          // no unique constraint on name+userId in schema, so just create if count is 0
          id: "seed-placeholder-" + s.name.replace(/\s+/g, "-").toLowerCase(),
        },
        update: {},
        create: { ...s, userId: user.id },
      }).catch(() =>
        prisma.orchardSection.create({ data: { ...s, userId: user.id } }),
      ),
    ),
  );

  const [northBlock, southOrchard, eastRow, westPlot, nurseryBlock] = sections;

  console.log(`Created ${sections.length} sections`);

  // --- Sprays ---
  const sprayDefs = [
    // North Block - Apples: recent fungicide (active PHI), older insecticide
    {
      sectionId: northBlock.id,
      productName: "Captan 80 WG",
      category: "Fungicide",
      doseLPerHa: 1.5,
      sprayedAt: daysAgo(6),
      weatherNote: "Dry, 18°C, light breeze",
      phiDays: 14,
      notes: "Pre-bloom scab protection",
    },
    {
      sectionId: northBlock.id,
      productName: "Calypso SC 480",
      category: "Insecticide",
      doseLPerHa: 0.25,
      sprayedAt: daysAgo(20),
      weatherNote: "Overcast, 15°C",
      phiDays: 21,
      notes: "Codling moth first generation",
    },
    {
      sectionId: northBlock.id,
      productName: "Captan 80 WG",
      category: "Fungicide",
      doseLPerHa: 1.5,
      sprayedAt: daysAgo(34),
      weatherNote: "Sunny, 20°C",
      phiDays: 14,
    },

    // South Orchard - Pears: no recent spray → suggestions should fire
    {
      sectionId: southOrchard.id,
      productName: "Dithane M-45",
      category: "Fungicide",
      doseLPerHa: 2.0,
      sprayedAt: daysAgo(22),
      weatherNote: "Humid, 17°C — risk period",
      phiDays: 28,
      notes: "Scab outbreak risk after wet week",
    },
    {
      sectionId: southOrchard.id,
      productName: "Movento 150 SC",
      category: "Insecticide",
      doseLPerHa: 0.75,
      sprayedAt: daysAgo(40),
      phiDays: 14,
    },

    // East Row - Cherries: recent spray, PHI still active
    {
      sectionId: eastRow.id,
      productName: "Switch 62.5 WG",
      category: "Fungicide",
      doseLPerHa: 0.8,
      sprayedAt: daysAgo(4),
      weatherNote: "Warm and dry, ideal",
      phiDays: 7,
      notes: "Brown rot prevention pre-harvest",
    },
    {
      sectionId: eastRow.id,
      productName: "Exirel",
      category: "Insecticide",
      doseLPerHa: 0.5,
      sprayedAt: daysAgo(18),
      phiDays: 3,
      notes: "Cherry fly pressure observed",
    },

    // West Plot - Plums: only fertiliser, no fungicide → suggestion fires
    {
      sectionId: westPlot.id,
      productName: "Kristalon Green",
      category: "Fertilizer",
      doseLPerHa: 3.0,
      sprayedAt: daysAgo(10),
      weatherNote: "Calm, 19°C",
    },
    {
      sectionId: westPlot.id,
      productName: "Kristalon Green",
      category: "Fertilizer",
      doseLPerHa: 3.0,
      sprayedAt: daysAgo(30),
    },

    // Nursery Block - no sprays at all (youngest, suggestions will fire for both categories)
    {
      sectionId: nurseryBlock.id,
      productName: "Topsin M 70 WP",
      category: "Fungicide",
      doseLPerHa: 1.0,
      sprayedAt: daysAgo(60),
      phiDays: 14,
      notes: "Canker prevention on young wood",
    },
  ];

  let sprayCount = 0;
  for (const spray of sprayDefs) {
    await prisma.sprayRecord.create({ data: { ...spray, userId: user.id } });
    sprayCount++;
  }

  console.log(`Created ${sprayCount} spray records`);

  // --- Auto-populate product dictionary ---
  const products = [
    { name: "Captan 80 WG", category: "Fungicide" },
    { name: "Dithane M-45", category: "Fungicide" },
    { name: "Switch 62.5 WG", category: "Fungicide" },
    { name: "Topsin M 70 WP", category: "Fungicide" },
    { name: "Score 250 EC", category: "Fungicide" },
    { name: "Calypso SC 480", category: "Insecticide" },
    { name: "Movento 150 SC", category: "Insecticide" },
    { name: "Exirel", category: "Insecticide" },
    { name: "Decis Mega EW 50", category: "Insecticide" },
    { name: "Kristalon Green", category: "Fertilizer" },
    { name: "Kristalon Blue", category: "Fertilizer" },
    { name: "Roundup 360 SL", category: "Herbicide" },
  ];

  for (const p of products) {
    await prisma.userProduct.upsert({
      where: { userId_name: { userId: user.id, name: p.name } },
      update: {},
      create: { ...p, userId: user.id },
    });
  }

  console.log(`Seeded ${products.length} products`);
  console.log("Done ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
