import type { User } from '../types';
import type { EmployerSignupRequest, EmployerResponse } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/password/change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
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
        const errorData = await response.json().catch(() => ({}));
        console.log('Login error data:', errorData);
        
        // Gestion spécifique pour 401
        if (response.status === 401) {
          const errorMessage = errorData.message || errorData.error || 'Email ou mot de passe incorrect';
          throw new ApiError(
            errorMessage,
            response.status,
            errorData.errors
          );
        }
        
        throw new ApiError(
          errorData.message || errorData.error || 'Erreur lors de la connexion',
          response.status,
          errorData.errors
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

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found, skipping backend logout');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

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
