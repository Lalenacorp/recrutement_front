import type { User } from '../types';
import type { EmployerSignupRequest, EmployerResponse } from './types';
import { authFetch } from './authFetch';

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

/** Extrait un message lisible depuis la réponse JSON Spring (ProblemDetail, validation, etc.). */
export function errorMessageFromApiBody(data: Record<string, unknown>, fallback: string): string {
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim();
  if (typeof data.error === 'string' && data.error.trim() && data.error !== 'Bad Request') {
    return data.error.trim();
  }
  const errors = data.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0] as Record<string, unknown>;
    if (typeof first?.defaultMessage === 'string') return first.defaultMessage;
  }
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const rec = errors as Record<string, string[]>;
    for (const key of Object.keys(rec)) {
      const arr = rec[key];
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0];
    }
  }
  return fallback;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  civility: 'MR' | 'MS' | 'MX';
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  confirmEmail: string;
  password: string;
}

interface RegisterResponse {
  employeeId: number;
  email: string;
  emailVerified: boolean;
}

interface AuthResponse {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  token?: string;
  emailVerified?: boolean;
  employeeId?: number;
}

export const authApi = {
  /**
   * Modifie le mot de passe d'un utilisateur (employé ou employeur)
   * L'email est récupéré depuis le token d'authentification
   * @param currentPassword Ancien mot de passe
   * @param newPassword Nouveau mot de passe
   * @param confirmNewPassword Confirmation du nouveau mot de passe
   * @returns Promise<void>
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<void> {
    // Validations côté client
    if (newPassword !== confirmNewPassword) {
      throw new ApiError('Le nouveau mot de passe et sa confirmation ne correspondent pas.', 400);
    }
    if (newPassword === currentPassword) {
      throw new ApiError('Le nouveau mot de passe doit être différent de l\'actuel.', 400);
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors du changement de mot de passe',
          response.status,
          errorData.errors
        );
      }
      // Succès, rien à retourner
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          password: request.password,
        }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData: Record<string, unknown> = {};
        try {
          errorData = errorText ? (JSON.parse(errorText) as Record<string, unknown>) : {};
        } catch {
          errorData = {};
        }
        console.log('Login error data:', errorData || errorText);
        const fallbackMessage = response.status === 401
          ? 'Email ou mot de passe incorrect'
          : 'Erreur lors de la connexion';
        const messageFromBody = errorMessageFromApiBody(errorData, fallbackMessage);
        const finalMessage =
          messageFromBody !== fallbackMessage
            ? messageFromBody
            : (errorText && errorText.trim().length > 0 ? errorText : fallbackMessage);
        
        // Gestion spécifique pour 401
        if (response.status === 401) {
          throw new ApiError(
            finalMessage,
            response.status,
            errorData.errors as Record<string, string[]> | undefined
          );
        }
        
        throw new ApiError(
          finalMessage,
          response.status,
          errorData.errors as Record<string, string[]> | undefined
        );
      }

      const data = await response.json();
      console.log('Login success data:', data);
      
      // Mapper le rôle du backend vers le frontend
      let role: User['role'];
      switch (data.role) {
        case 'EMPLOYEE':
          role = 'candidate';
          break;
        case 'EMPLOYER':
          role = 'employer';
          break;
        case 'ADMIN':
          role = 'admin';
          break;
        default:
          role = 'candidate';
      }
      
      // Construire le nom complet si nécessaire
      const name = data.name || (data.firstName && data.lastName 
        ? `${data.firstName} ${data.lastName}` 
        : data.email);

      return {
        id: data.userId?.toString() || data.id,
        email: data.email,
        name: name,
        role: role,
        token: data.token,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/employees/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Employee signup response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Employee signup error (raw text):', errorText);

        let errorData: any = {};
        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          // si ce n'est pas du JSON, on utilisera directement le texte
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

  async registerEmployer(request: EmployerSignupRequest, logoFile?: File): Promise<EmployerResponse> {
    try {
      // Nettoyer les champs optionnels vides
      const cleanedRequest: any = { ...request };
      
      // Supprimer les champs optionnels avec des valeurs vides
      if (!cleanedRequest.companyPostalCode || cleanedRequest.companyPostalCode === '') {
        delete cleanedRequest.companyPostalCode;
      }
      if (!cleanedRequest.companyWebsite || cleanedRequest.companyWebsite === '') {
        delete cleanedRequest.companyWebsite;
      }
      if (!cleanedRequest.jobTitle || cleanedRequest.jobTitle === '') {
        delete cleanedRequest.jobTitle;
      }
      if (!cleanedRequest.linkedinUrl || cleanedRequest.linkedinUrl === '') {
        delete cleanedRequest.linkedinUrl;
      }
      if (!cleanedRequest.phonePrimary || cleanedRequest.phonePrimary === '') {
        delete cleanedRequest.phonePrimary;
      }
      if (!cleanedRequest.phoneSecondary || cleanedRequest.phoneSecondary === '') {
        delete cleanedRequest.phoneSecondary;
      }
      
      console.log('Employer signup request (original):', JSON.stringify(request, null, 2));
      console.log('Employer signup request (cleaned):', JSON.stringify(cleanedRequest, null, 2));
      console.log('Endpoint:', `${API_BASE_URL}/api/auth/employers/signup`);

      let response: Response;

      if (logoFile) {
        // Envoi en multipart/form-data avec payload JSON + fichier logo
        const formData = new FormData();
        const payloadBlob = new Blob([JSON.stringify(cleanedRequest)], {
          type: 'application/json',
        });
        formData.append('payload', payloadBlob);
        formData.append('logo', logoFile);

        response = await fetch(`${API_BASE_URL}/api/auth/employers/signup`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Envoi simple JSON (sans logo)
        response = await fetch(`${API_BASE_URL}/api/auth/employers/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedRequest),
        });
      }

      console.log('Employer signup response status:', response.status);
      console.log('Employer signup response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Employer signup error (raw text):', errorText);
        
        let errorData: any;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.log('Employer signup error (parsed):', errorData);

        let message =
          errorData.message ||
          errorData.error;

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

      const data = await response.json();
      console.log('Employer signup success:', data);
      return data;
    } catch (error) {
      console.error('Employer signup exception:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erreur de connexion au serveur', 0);
    }
  },

  /**
   * Demande de lien de réinitialisation. 404 si aucun compte pour cet e-mail.
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new ApiError(
        errorMessageFromApiBody(
          data,
          response.status === 404
            ? "Aucun compte n'est enregistré avec cette adresse e-mail."
            : "Impossible d'envoyer la demande de réinitialisation."
        ),
        response.status,
        data.errors as Record<string, string[]> | undefined
      );
    }
    return { message: (data.message as string) ?? '' };
  },

  /**
   * Définit un nouveau mot de passe à partir du jeton reçu par e-mail.
   */
  async resetPassword(token: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    if (newPassword !== confirmNewPassword) {
      throw new ApiError('Les mots de passe ne correspondent pas.', 400);
    }
    if (newPassword.length < 8) {
      throw new ApiError('Le mot de passe doit contenir au moins 8 caractères.', 400);
    }
    const response = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword, confirmNewPassword }),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    if (!response.ok) {
      throw new ApiError(
        errorMessageFromApiBody(data, 'La réinitialisation du mot de passe a échoué.'),
        response.status,
        data.errors as Record<string, string[]> | undefined
      );
    }
  },

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, skipping backend logout');
        return;
      }

      const response = await authFetch(
        `${API_BASE_URL}/api/auth/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { endSessionOn401: false }
      );

      console.log('Logout response status:', response.status);

      if (!response.ok) {
        // Log l'erreur mais ne bloque pas la déconnexion côté client
        console.warn('Logout failed on backend, but continuing client logout');
      } else {
        const data = await response.json();
        console.log('Logout success:', data.message);
      }
    } catch (error) {
      // En cas d'erreur réseau, on continue quand même la déconnexion côté client
      console.error('Logout error:', error);
    }
  },
};
