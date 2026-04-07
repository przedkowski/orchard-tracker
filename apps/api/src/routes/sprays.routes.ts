import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  listSprays,
  getSpray,
  createSpray,
  deleteSpray,
} from "../services/sprays.service.js";
import { NotFoundError } from "../services/sections.service.js";

const createBody = z.object({
  sectionId: z.string().min(1),
  productName: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  doseLPerHa: z.number().positive(),
  sprayedAt: z.coerce.date(),
  weatherNote: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

const listQuery = z.object({
  sectionId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const idParam = z.object({ id: z.string().min(1) });

export async function spraysRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/sprays", async (request, reply) => {
    const parsed = listQuery.safeParse(request.query);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid query", details: parsed.error.flatten() });
    }
    return listSprays(request.userId, parsed.data);
  });

  app.get("/sprays/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    try {
      return await getSpray(request.userId, id);
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });

  app.post("/sprays", async (request, reply) => {
    const parsed = createBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }
    try {
      const spray = await createSpray(request.userId, parsed.data);
      return reply.code(201).send(spray);
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });

  app.delete("/sprays/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    try {
      await deleteSpray(request.userId, id);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });
}
