import { CustomFastifyRequest, FastifyReply } from "fastify";

import parseError from "./parse-error";
import {
  BaseController,
  BaseControllerRequestDTO,
} from "../../../presentation/dtos";

export const fastifyBaseControllerAdapter = (
  baseController: BaseController
) => {
  return async (req: CustomFastifyRequest, reply: FastifyReply) => {
    const httpRequest: BaseControllerRequestDTO = {
      body: req.body,
      headers: req.headers,
      query: req.query,
      params: req.params,
    };

    try {
      const response = await baseController.handle(httpRequest);

      reply.status(response.status);
      if (response.headers) {
        reply.headers(response.headers);
      }

      await reply.send(response.data);
    } catch (error) {
      return parseError(error, reply);
    }
  };
};

export default fastifyBaseControllerAdapter;
