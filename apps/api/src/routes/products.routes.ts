import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  listProducts,
  createProduct,
  deleteProduct,
} from "../services/products.service.js";

const createBody = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
});

const idParam = z.object({ id: z.string().min(1) });

export async function productsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", app.authenticate);

  app.get("/products", async (request) => {
    return listProducts(request.userId);
  });

  app.post("/products", async (request, reply) => {
    const parsed = createBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }
    const product = await createProduct(request.userId, parsed.data);
    return reply.code(201).send(product);
  });

  app.delete("/products/:id", async (request, reply) => {
    const { id } = idParam.parse(request.params);
    try {
      await deleteProduct(request.userId, id);
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ error: "Product not found" });
    }
  });
}
