import { FastifyRequest } from "fastify";
import { BaseControllerRequestDTO } from "../../../../presentation/dtos";

declare module "fastify" {
  export type CustomFastifyRequest = FastifyRequest<{
    Querystring: BaseControllerRequestDTO["query"];
    Headers: BaseControllerRequestDTO["headers"];
    Params: BaseControllerRequestDTO["params"];
  }>;
}
