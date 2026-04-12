import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { env } from "./env.js";
import authPlugin from "./plugins/auth.js";
import { authRoutes } from "./routes/auth.routes.js";
import { sectionsRoutes } from "./routes/sections.routes.js";
import { spraysRoutes } from "./routes/sprays.routes.js";
import { suggestionsRoutes } from "./routes/suggestions.routes.js";

function buildLoggerConfig() {
  if (env.NODE_ENV === "test") return { level: "silent" as const };

  if (env.LOKI_URL && env.LOKI_USER && env.LOKI_PASSWORD) {
    return {
      level: "info" as const,
      transport: {
        targets: [
          { target: "pino/file", level: "info", options: { destination: 1 } },
          {
            target: "pino-loki",
            level: "info",
            options: {
              host: env.LOKI_URL,
              basicAuth: { username: env.LOKI_USER, password: env.LOKI_PASSWORD },
              labels: { app: "orchard-tracker", env: env.NODE_ENV },
              silenceErrors: false,
            },
          },
        ],
      },
    };
  }

  return { level: "info" as const };
}

export async function buildApp() {
  const app = Fastify({ logger: buildLoggerConfig() });

  await app.register(sensible);
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });
  await app.register(authPlugin);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  await app.register(authRoutes, { prefix: "/api" });
  await app.register(sectionsRoutes, { prefix: "/api" });
  await app.register(spraysRoutes, { prefix: "/api" });
  await app.register(suggestionsRoutes, { prefix: "/api" });

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`🚀 API listening on http://localhost:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
