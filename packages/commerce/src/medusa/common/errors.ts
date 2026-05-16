export class CommerceNotImplementedError extends Error {}

export class CommerceRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}
