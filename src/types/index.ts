export interface User {
  id: string;
  email: string;
  name: string;
  role: 'candidate' | 'employer' | 'admin';
  avatar?: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: string;
  description: string;
  requirements: string[];
  employerId: string;
  createdAt: Date;
  logo?: string;
}

export interface Application {
  id: string;
  jobOfferId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  resume: string;
  coverLetter: string;
  createdAt: Date;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  prize?: string;
  image?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'training' | 'workshop' | 'mentorship';
  description: string;
  date?: Date;
  image?: string;
}

// Enums pour les offres d'emploi
export type EducationLevel = 
  | 'NONE'          // Pas de diplôme requis
  | 'HIGH_SCHOOL'   // Bac
  | 'BACHELOR'      // Licence
  | 'MASTER'        // Master
  | 'DOCTORATE'     // Doctorat
  | 'OTHER';

export type ExperienceLevel = 
  | 'ENTRY'   // Débutant / 0-2 ans
  | 'MID'     // 2-5 ans
  | 'SENIOR'  // 5-10 ans
  | 'LEAD';   // 10+ ans / lead

export type JobContractType = 
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'TEMPORARY';

export type JobStatus = 
  | 'DRAFT'      // brouillon (non visible publiquement)
  | 'PUBLISHED'  // publié (visible publiquement)
  | 'ARCHIVED';  // archivé (non listé pour les candidats)

// Interface pour créer une offre d'emploi
export interface JobCreateRequest {
  title: string;
  positionsCount: number;
  jobDescription: string;
  profileDescription: string;
  experienceLevel: ExperienceLevel;
  requiredLanguages: string[]; // codes ISO ex: "fr", "en"
  educationLevel: EducationLevel;
  contractType: JobContractType;
  salaryAmount: number;
  salaryCurrency: string; // ex: "XOF", "EUR", "USD"
}

// Interface pour la réponse d'une offre d'emploi
export interface JobResponse {
  id: number;
  title: string;
  status: JobStatus;
  publishedAt?: string;
  companyName: string;
}

// Interface pour les détails complets d'une offre d'emploi
export interface JobDetails {
  id: number;
  title: string;
  positionsCount: number;
  jobDescription: string;
  profileDescription: string;
  experienceLevel: ExperienceLevel;
  requiredLanguages: string[];
  educationLevel: EducationLevel;
  contractType: JobContractType;
  salaryAmount: number;
  salaryCurrency: string;
  status: JobStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  companyName: string;
  companyId: number;
}

// Interface pour une offre publique (liste)
export interface PublicJobOffer {
  id: number;
  title: string;
  companyName: string;
  contractType: JobContractType;
  salaryAmount: number;
  salaryCurrency: string;
  experienceLevel: ExperienceLevel;
  educationLevel: EducationLevel;
  publishedAt: string;
  positionsCount: number;
}

// Enums et types pour les candidatures
export type ApplicationStatus = 
  | 'SUBMITTED'   // Soumise
  | 'REVIEWED'    // Examinée
  | 'ACCEPTED'    // Acceptée
  | 'REJECTED'    // Rejetée
  | 'WITHDRAWN';  // Retirée

export type Civility = 'MR' | 'MS';

// Interface pour soumettre une candidature
export interface ApplicationRequest {
  jobId: number;
  civility: Civility;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Format E.164 (ex: +221701234567)
  /** Lettre de motivation (optionnelle, max. 8000 caractères côté serveur) */
  coverLetter?: string;
}

// Interface pour la réponse après soumission
export interface ApplicationResponse {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  createdAt: string;
  cvUrl?: string;
  coverLetter?: string;
}

// Types et interfaces pour les concours
export type ContestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ContestCreateRequest {
  title: string;
  description: string;
  registrationUrl?: string;
  coverImageUrl?: string;
}

export interface ContestResponse {
  id: number;
  title: string;
  description: string;
  registrationUrl?: string;
  coverImageUrl?: string;
  status: ContestStatus;
  createdAt: string;
}

// Types et interfaces pour les événements
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface EventCreateRequest {
  title: string;
  description: string;
  startAt: string; // ISO 8601
  endAt?: string; // ISO 8601
  locationName?: string;
  city?: string;
  countryCode?: string;
  online: boolean;
  onlineUrl?: string;
  capacity?: number;
  registrationRequired: boolean;
  coverImageUrl?: string;
}

export interface EventResponse {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  locationName?: string;
  city?: string;
  countryCode?: string;
  online: boolean;
  onlineUrl?: string;
  capacity?: number;
  registrationRequired: boolean;
  coverImageUrl?: string;
  status: EventStatus;
  publishedAt?: string;
}
