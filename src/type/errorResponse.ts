export class ErrorResponse {
  code: string;
  message: string;
  details: unknown;

  constructor(code: string, message: string, details?: unknown) {
    (this.code = code), (this.message = message), (this.details = details);
  }
}

export const NoResponse: ErrorResponse = new ErrorResponse("SDK_ERR_001", "No response");
export const UnexpectedError: ErrorResponse = new ErrorResponse("SDK_ERR_002", "Something went wrong");
