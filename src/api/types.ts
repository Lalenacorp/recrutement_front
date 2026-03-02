// DTOs pour l'API Backend
export interface EmployeeSignupRequest {
  email: string;
  password: string;
  civility: 'MR' | 'MS' | 'MX';
  firstName: string;
  lastName: string;
  phone: string;
}

export interface EmployeeResponse {
  id: number;
  email: string;
  civility: string;
  firstName: string;
  lastName: string;
  phone: string;
  emailVerified: boolean;
  createdAt: string;
}

export type CompanySector = 
  | 'TECHNOLOGY'
  | 'FINANCE'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'RETAIL'
  | 'MANUFACTURING'
  | 'CONSTRUCTION'
  | 'TRANSPORTATION'
  | 'HOSPITALITY'
  | 'OTHER';

export type CompanySize = 
  | 'SIZE_1_10'           // 1-10 employés
  | 'SIZE_11_50'          // 11-50 employés
  | 'SIZE_51_200'         // 51-200 employés
  | 'SIZE_201_1000'       // 201-1000 employés
  | 'SIZE_1000_PLUS';     // 1000+ employés

export interface EmployerSignupRequest {
  // Entreprise
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode?: string;
  companyCountryCode: string;
  companySectors: CompanySector[];
  companyDescription: string;
  companySize: CompanySize;
  companyWebsite?: string;
  
  // Informations personnelles
  civility: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  linkedinUrl?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  
  // Identifiants
  email: string;
  confirmEmail: string;
  password: string;
}

export interface EmployerResponse {
  employerId: number;
  companyId: number;
  email: string;
  emailVerified: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

