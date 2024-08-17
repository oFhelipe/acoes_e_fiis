import { BaseError } from './base-error.entity';

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}
