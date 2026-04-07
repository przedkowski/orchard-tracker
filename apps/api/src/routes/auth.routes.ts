import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { signUp, signIn, AuthError } from "../services/auth.service.js";

const signUpBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const signInBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", async (request, reply) => {
    const parsed = signUpBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }

    try {
      const user = await signUp(parsed.data);
      const token = app.jwt.sign({ sub: user.id });
      return reply.code(201).send({ user, token });
    } catch (err) {
      if (err instanceof AuthError && err.code === "EMAIL_TAKEN") {
        return reply.code(409).send({ error: err.message });
      }
      throw err;
    }
  });

  app.post("/auth/signin", async (request, reply) => {
    const parsed = signInBody.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ error: "Invalid input", details: parsed.error.flatten() });
    }

    try {
      const user = await signIn(parsed.data);
      const token = app.jwt.sign({ sub: user.id });
      return reply.send({ user, token });
    } catch (err) {
      if (err instanceof AuthError && err.code === "INVALID_CREDENTIALS") {
        return reply.code(401).send({ error: err.message });
      }
      throw err;
    }
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (request) => {
    return { userId: request.userId };
  });
}
