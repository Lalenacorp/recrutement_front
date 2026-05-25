/** 14 régions administratives du Sénégal */
export const SENEGAL_REGIONS = [
  'Dakar',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kaolack',
  'Kédougou',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Thiès',
  'Ziguinchor',
] as const;

export type SenegalRegion = (typeof SENEGAL_REGIONS)[number];

import type { SchoolResponse } from '../api/schoolApi';

export type SenegalSchool = {
  id: string;
  name: string;
  typeFr: string;
  typeEn: string;
  city: string;
  region: SenegalRegion;
  domains: string[];
  /** Vide ou absent = affichage sans photo (initiales + icône) */
  imageUrl?: string;
  website?: string;
  descriptionFr: string;
  descriptionEn: string;
};

export function mapSchoolResponseToSenegalSchool(school: SchoolResponse): SenegalSchool {
  return {
    id: String(school.id),
    name: school.name,
    typeFr: school.typeFr,
    typeEn: school.typeEn,
    city: school.city,
    region: school.region as SenegalRegion,
    domains: school.domains ?? [],
    imageUrl: school.imageUrl ?? undefined,
    website: school.website ?? undefined,
    descriptionFr: school.descriptionFr,
    descriptionEn: school.descriptionEn,
  };
}

export const SENEGAL_SCHOOLS: SenegalSchool[] = [
  {
    id: 'ism-dakar',
    name: 'ISM Dakar',
    typeFr: 'École de commerce',
    typeEn: 'Business school',
    city: 'Dakar',
    region: 'Dakar',
    domains: ['commerce', 'marketing', 'management', 'finance', 'digital'],
    website: 'https://www.ism.edu.sn/',
    descriptionFr:
      'Institut supérieur de management proposant licences et masters en gestion, marketing et entrepreneuriat.',
    descriptionEn:
      'Leading management institute offering bachelor and master programs in management, marketing and entrepreneurship.',
  },
  {
    id: 'esp-thies',
    name: 'ESP Thiès',
    typeFr: 'École polytechnique',
    typeEn: 'Polytechnic school',
    city: 'Thiès',
    region: 'Thiès',
    domains: ['ingénierie', 'informatique', 'génie civil', 'énergie', 'polytechnique'],
    website: 'https://www.esp.sn/',
    descriptionFr:
      'École supérieure polytechnique formant des ingénieurs et techniciens supérieurs dans les filières scientifiques.',
    descriptionEn:
      'Polytechnic school training engineers and senior technicians in scientific and technical fields.',
  },
  {
    id: 'ucad',
    name: 'UCAD',
    typeFr: 'Université publique',
    typeEn: 'Public university',
    city: 'Dakar',
    region: 'Dakar',
    domains: ['université', 'sciences', 'droit', 'médecine', 'économie', 'lettres'],
    website: 'https://www.ucad.sn/',
    descriptionFr:
      'Université Cheikh Anta Diop, principale université publique du Sénégal avec de nombreuses facultés à Dakar.',
    descriptionEn:
      'Cheikh Anta Diop University, Senegal’s main public university with many faculties in Dakar.',
  },
  {
    id: 'cesag',
    name: 'CESAG',
    typeFr: 'École de management',
    typeEn: 'Management school',
    city: 'Dakar',
    region: 'Dakar',
    domains: ['audit', 'finance', 'management', 'comptabilité'],
    website: 'https://www.cesag.sn/',
    descriptionFr: 'Centre d’études supérieures en gestion, référence en audit, finance et management en Afrique de l’Ouest.',
    descriptionEn: 'Graduate management center renowned for audit, finance and management in West Africa.',
  },
  {
    id: 'ept',
    name: 'EPT',
    typeFr: 'École d’ingénieurs',
    typeEn: 'Engineering school',
    city: 'Thiès',
    region: 'Thiès',
    domains: ['ingénierie', 'polytechnique', 'concours', 'bac s'],
    website: 'https://www.ept.sn/',
    descriptionFr: 'École polytechnique de Thiès, formation d’ingénieurs d’État par concours après classes préparatoires.',
    descriptionEn: 'Thiès Polytechnic School, training state engineers through competitive entrance exams.',
  },
  {
    id: 'iam',
    name: 'IAM',
    typeFr: 'Institut de management',
    typeEn: 'Management institute',
    city: 'Dakar',
    region: 'Dakar',
    domains: ['management', 'marketing', 'communication', 'digital'],
    descriptionFr: 'Institut africain de management offrant des programmes professionnalisants en gestion et marketing.',
    descriptionEn: 'African management institute with professional programs in management and marketing.',
  },
];
