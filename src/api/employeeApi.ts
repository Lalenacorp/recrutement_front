import type { EmployeeSignupRequest, EmployeeResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const employeeApi = {
  async signup(request: EmployeeSignupRequest): Promise<EmployeeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorData: any = {};
        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          // pas du JSON, on utilisera directement le texte
        }

        let message =
          errorData.message ||
          errorData.error ||
          (errorText && errorText.trim().length > 0 ? errorText : undefined);

        if (!message && errorData.errors && typeof errorData.errors === 'object') {
          const firstField = Object.keys(errorData.errors)[0];
          const fieldMessages = firstField ? errorData.errors[firstField] : null;
          if (Array.isArray(fieldMessages) && fieldMessages.length > 0) {
            message = fieldMessages[0];
          }
        }

        if (!message) {
          message = 'Erreur lors de l\'inscription';
        }

        throw new ApiError(
          message,
          response.status,
          errorData.errors
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },
};
