import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { env } from "../env.js";

// Fire-and-forget request log shipper to Grafana Loki.
// Only activates when LOKI_URL + LOKI_USER + LOKI_PASSWORD are all set.
const lokiPlugin: FastifyPluginAsync = async (app) => {
  if (!env.LOKI_URL || !env.LOKI_USER || !env.LOKI_PASSWORD) {
    app.log.warn("Loki plugin: missing credentials, skipping");
    return;
  }

  const auth = Buffer.from(`${env.LOKI_USER}:${env.LOKI_PASSWORD}`).toString(
    "base64",
  );
  const pushUrl = `${env.LOKI_URL}/loki/api/v1/push`;

  app.addHook("onResponse", async (request, reply) => {
    const entry = {
      streams: [
        {
          stream: {
            app: "orchard-tracker",
            env: env.NODE_ENV,
            method: request.method,
            status: String(reply.statusCode),
          },
          values: [
            [
              String(Date.now() * 1_000_000),
              JSON.stringify({
                method: request.method,
                url: request.url,
                status: reply.statusCode,
                responseTime: Math.round(reply.elapsedTime),
              }),
            ],
          ],
        },
      ],
    };

    try {
      const res = await fetch(pushUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        app.log.warn({ status: res.status }, "Loki push failed");
      }
    } catch (err) {
      app.log.warn({ err }, "Loki fetch error");
    }
  });
};

export default fp(lokiPlugin);
