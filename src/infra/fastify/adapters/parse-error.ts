import { FastifyReply } from "fastify";
import { FastifyApiErrorResponseDTO } from "../dtos/fastify-api-error-response.dto";
import { BaseError } from "../../../domain/entities/error";

const parseError = (error: unknown, reply: FastifyReply) => {
  console.error(error);
  if (error instanceof BaseError) {
    const response: FastifyApiErrorResponseDTO = {
      message: error.message,
      internalCodeError: error.getInternalCodeError(),
    };
    return reply.status(error.getStatus()).send(response);
  }

  const response: FastifyApiErrorResponseDTO = {
    message: "Internal Server Error",
  };
  return reply.status(500).send(response);
};

export default parseError;
