export interface DnaErrorResponse {
  code: number;
  message: string;
  errors: {
    errorMessage: string;
    objectName: string;
    field: string;
    headerName: string;
    rejectedValue: unknown;
  };
}
