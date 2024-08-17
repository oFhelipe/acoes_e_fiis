import { FastifyInstance } from "fastify";
import fiiRoutes from "./fii";

export default async function routes(fastify: FastifyInstance) {
  await fastify.register(fiiRoutes);
}
