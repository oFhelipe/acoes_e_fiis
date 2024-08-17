import cors from "@fastify/cors";
import Fastify from "fastify";
import routes from "./fastify/routes";

export default async function buildApp() {
  const fastify = Fastify({ logger: false });
  await fastify.register(cors);

  fastify.get("/ping", async () => {
    return { pong: true };
  });

  await fastify.register(routes, { prefix: "/api" });

  await fastify.ready();

  return fastify;
}
