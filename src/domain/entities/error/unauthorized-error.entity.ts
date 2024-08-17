import { BaseError } from './base-error.entity';

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}
