import type { FastifyInstance } from "fastify";
import { getSuggestions } from "../services/suggestions.service.js";

export async function suggestionsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/suggestions", async (request) => {
    const suggestions = await getSuggestions(request.userId);
    return { suggestions };
  });
}
