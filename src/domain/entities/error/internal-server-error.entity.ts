import { BaseError } from './base-error.entity';

export class InternalServerError extends BaseError {
  constructor(message: string) {
    super(message, 500);
  }
}
