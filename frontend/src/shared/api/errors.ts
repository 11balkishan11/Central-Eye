export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};
