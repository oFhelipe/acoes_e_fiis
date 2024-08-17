import { BaseError } from './base-error.entity';

export class ForbiddenError extends BaseError {
  constructor(message: string, internalCodeError?: number) {
    super(message, 403, internalCodeError);
  }
}
