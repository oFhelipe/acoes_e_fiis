/* eslint-disable @typescript-eslint/no-explicit-any */
export const resolveZodValidationError = (error: any) => {
  if (error && error.issues) {
    if (Array.isArray(error.issues) && error.issues[0] && error.issues[0].message) {
      return error.issues[0].message;
    } else if (error.issues.message) {
      return error.issues.message;
    }
  }

  return 'Validation Error';
};
