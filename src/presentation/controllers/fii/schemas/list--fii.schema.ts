import zod from "zod";

export function generateListFiiQuerySchema() {
  const zodSchema = {
    dividendYieldMin: zod.coerce.number({
      required_error: '"dividendYieldMin" é obrigatório no "body"',
      invalid_type_error: '"dividendYieldMin" deve ser to tipo "number"',
    }),
    pVPMin: zod.coerce.number({
      required_error: '"pVPMin" é obrigatório no "body"',
      invalid_type_error: '"pVPMin" deve ser to tipo "number"',
    }),
    pVPMax: zod.coerce.number({
      required_error: '"pVPMax" é obrigatório no "body"',
      invalid_type_error: '"pVPMax" deve ser to tipo "number"',
    }),
    liquidezMin: zod.coerce.number({
      required_error: '"liquidezMin" é obrigatório no "body"',
      invalid_type_error: '"liquidezMin" deve ser to tipo "number"',
    }),
    vacanciaMax: zod.coerce.number({
      required_error: '"vacanciaMax" é obrigatório no "body"',
      invalid_type_error: '"vacanciaMax" deve ser to tipo "number"',
    }),
  };

  return zodSchema;
}
