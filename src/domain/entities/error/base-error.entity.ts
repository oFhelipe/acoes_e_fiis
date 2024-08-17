export class BaseError extends Error {
  private status: number;
  private internalCodeError?: number;

  constructor(message: string, status: number, internalCodeError?: number) {
    super(message);

    this.status = status;
    this.internalCodeError = internalCodeError;
  }

  public getStatus = () => {
    return this.status;
  };

  public getInternalCodeError = () => {
    return this.internalCodeError;
  };
}
