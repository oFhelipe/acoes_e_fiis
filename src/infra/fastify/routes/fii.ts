import { FastifyInstance } from "fastify";
import { ListFiiUsecaseImplementation } from "../../../application/usecases/list-fii.usecase";
import { ListFiiController } from "../../../presentation/controllers/fii/list-fii.controller";
import fastifyBaseControllerAdapter from "../adapters/fastify-base-controller.adapter";

export default async function fiiRoutes(fastify: FastifyInstance) {
  const listFiiUsecaseImplementation = new ListFiiUsecaseImplementation();
  const listFiiController = new ListFiiController(listFiiUsecaseImplementation);

  fastify.get("/v1/fii", fastifyBaseControllerAdapter(listFiiController));
}
