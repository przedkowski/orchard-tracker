import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
  interface FastifyRequest {
    userId: string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

export default fp(async (app) => {
  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const payload = await request.jwtVerify<{ sub: string }>();
        request.userId = payload.sub;
      } catch {
        return reply.code(401).send({ error: "Unauthorized" });
      }
    },
  );
});
