import Groq from "groq-sdk";
import { z } from "zod";
import { prisma } from "../db.js";
import { env } from "../env.js";

export interface Suggestion {
  title: string;
  reason: string;
  suggestedWindow: string;
  priority: "low" | "medium" | "high";
}

const suggestionSchema = z.object({
  title: z.string(),
  reason: z.string(),
  suggestedWindow: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

const suggestionsArraySchema = z.array(suggestionSchema).max(8);

type SectionWithSprays = {
  id: string;
  name: string;
  cropType: string;
  sprays: Array<{ category: string; sprayedAt: Date; productName: string }>;
};

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

  if (env.GROQ_API_KEY) {
    try {
      return await groqSuggestions(sections);
    } catch {
      // fall through to rule-based
    }
  }

  return ruleBasedSuggestions(sections);
}

async function groqSuggestions(
  sections: SectionWithSprays[],
): Promise<Suggestion[]> {
  const client = new Groq({ apiKey: env.GROQ_API_KEY });

  const context = sections.map((s) => ({
    name: s.name,
    cropType: s.cropType,
    recentSprays: s.sprays.map((sp) => ({
      product: sp.productName,
      category: sp.category,
      daysAgo: Math.floor(
        (Date.now() - sp.sprayedAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    })),
  }));

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content:
          "You are an expert orchard spray advisor. " +
          "Given a grower's orchard sections and their recent spray history, " +
          "return a JSON object with a single key \"suggestions\" containing an array of up to 5 actionable spray suggestions. " +
          "Each suggestion must have: " +
          "title (string), reason (string), suggestedWindow (string), priority (\"low\"|\"medium\"|\"high\"). " +
          "Base advice on typical integrated pest management (IPM) intervals. " +
          "Return ONLY the JSON object, no markdown, no explanation.",
      },
      {
        role: "user",
        content: JSON.stringify(context),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  const validated = suggestionsArraySchema.parse(
    Array.isArray(parsed) ? parsed : parsed.suggestions,
  );
  return validated;
}

function ruleBasedSuggestions(sections: SectionWithSprays[]): Suggestion[] {
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
