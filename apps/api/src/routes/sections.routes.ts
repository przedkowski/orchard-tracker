import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  NotFoundError,
} from "../services/sections.service.js";

const createBody = z.object({
  name: z.string().min(1).max(100),
  cropType: z.string().min(1).max(50),
  areaHa: z.number().positive(),
  notes: z.string().max(1000).optional(),
});

const updateBody = createBody.partial();

const idParam = z.object({ id: z.string().min(1) });

export async function sectionsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/sections", async (request) => {
    return listSections(request.userId);
  });

  app.get("/sections/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    try {
      return await getSection(request.userId, id);
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });

  app.post("/sections", async (request, reply) => {
    const parsed = createBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const section = await createSection(request.userId, parsed.data);
    return reply.code(201).send(section);
  });

  app.patch("/sections/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    const parsed = updateBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }
    try {
      return await updateSection(request.userId, id, parsed.data);
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });

  app.delete("/sections/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    try {
      await deleteSection(request.userId, id);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof NotFoundError)
        return reply.code(404).send({ error: err.message });
      throw err;
    }
  });
}
