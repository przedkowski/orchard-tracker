import { prisma } from "../db.js";

export interface Suggestion {
  title: string;
  reason: string;
  suggestedWindow: string;
  priority: "low" | "medium" | "high";
}

export async function getSuggestions(userId: string): Promise<Suggestion[]> {
  const sections = await prisma.orchardSection.findMany({
    where: { userId },
    include: {
      sprays: {
        orderBy: { sprayedAt: "desc" },
        take: 5,
      },
    },
  });

  if (sections.length === 0) {
    return [
      {
        title: "Add your first orchard section",
        reason:
          "No sections found. Start by defining the parts of your orchard.",
        suggestedWindow: "Now",
        priority: "high",
      },
    ];
  }

  return ruleBasedSuggestions(sections);
}

function ruleBasedSuggestions(
  sections: Array<{
    id: string;
    name: string;
    cropType: string;
    sprays: Array<{ category: string; sprayedAt: Date; productName: string }>;
  }>,
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = new Date();
  const twoWeeksMs = 14 * 24 * 60 * 60 * 1000;

  for (const section of sections) {
    const lastFungicide = section.sprays.find(
      (s) => s.category.toLowerCase() === "fungicide",
    );
    const lastInsecticide = section.sprays.find(
      (s) => s.category.toLowerCase() === "insecticide",
    );

    if (
      !lastFungicide ||
      now.getTime() - lastFungicide.sprayedAt.getTime() > twoWeeksMs
    ) {
      suggestions.push({
        title: `Fungicide treatment for ${section.name}`,
        reason: lastFungicide
          ? `Last fungicide (${lastFungicide.productName}) was over 2 weeks ago.`
          : `No fungicide recorded for ${section.cropType} in this section yet.`,
        suggestedWindow: "Within the next 3-5 days",
        priority: "medium",
      });
    }

    if (
      !lastInsecticide ||
      now.getTime() - lastInsecticide.sprayedAt.getTime() > twoWeeksMs
    ) {
      suggestions.push({
        title: `Insecticide check for ${section.name}`,
        reason: lastInsecticide
          ? `Last insecticide (${lastInsecticide.productName}) was over 2 weeks ago. Scout for pests.`
          : `No insecticide recorded yet. Monitor pest pressure.`,
        suggestedWindow: "Within the next week",
        priority: "low",
      });
    }
  }

  return suggestions.slice(0, 8);
}
