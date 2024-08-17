import zod from "zod";
import { BaseController, BaseControllerRequestDTO } from "../../dtos";
import { BadRequestError } from "../../../domain/entities/error";
import { ListFiiUsecase } from "../../../application/usecases/list-fii.usecase";
import { resolveZodValidationError } from "../../utils/resolve-zod-validation-error";
import { generateListFiiQuerySchema } from "./schemas/list--fii.schema";

export class ListFiiController implements BaseController {
  constructor(private readonly usecase: ListFiiUsecase) {}
  handle = async (req: BaseControllerRequestDTO) => {
    console.log(req.query);
    const query = await this.validateQuery(req.query);
    const data = await this.usecase.list(query);

    return {
      status: 200,
      data,
    };
  };

  private validateQuery = async (body: unknown) => {
    return zod
      .object(generateListFiiQuerySchema())
      .parseAsync(body)
      .catch((error) => {
        const message = resolveZodValidationError(error);
        throw new BadRequestError(message);
      });
  };
}
