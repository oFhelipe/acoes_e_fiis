import { BaseError } from './base-error.entity';

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404);
  }
}
