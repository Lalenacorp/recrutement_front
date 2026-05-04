export type PartnerCompany = {
  id: string;
  name: string;
  sector: string;
  location: string;
  size: string;
  description: string;
  website?: string;
};

export const PARTNER_COMPANIES: PartnerCompany[] = [
  {
    id: 'helixsen',
    name: 'Helixsen',
    sector: 'Technologies & services numériques',
    location: 'Paris, France',
    size: '200 à 500 employés',
    description:
      'Helixsen accompagne les entreprises dans leur transformation digitale avec des solutions sur mesure, du conseil à la mise en œuvre.',
  },
  {
    id: 'lalenacorp',
    name: 'LalenaCorp',
    sector: 'Commerce & distribution',
    location: 'Lyon, France',
    size: '500 à 1000 employés',
    description:
      'LalenaCorp est un acteur majeur de la distribution moderne, avec un réseau national et une forte présence en ligne.',
  },
  {
    id: 'wellcomptax',
    name: 'WellCompTax',
    sector: 'Conseil fiscal & social',
    location: 'Bruxelles, Belgique',
    size: '50 à 200 employés',
    description:
      'Cabinet spécialisé en fiscalité et rémunération, WellCompTax aide les entreprises à optimiser leur conformité et leur attractivité employeur.',
  },
  {
    id: 'jayco',
    name: 'Jayco',
    sector: 'Marketplace & petites annonces',
    location: 'Sénégal',
    size: 'Plateforme e-commerce',
    description:
      "Jayco est une plateforme qui vous permet d'acheter et de vendre des articles neufs ou d'occasion en toute sécurité. Vous pouvez y trouver des vêtements, meubles, bazins, bijoux, gadgets électroniques et bien plus encore !",
    website: 'https://www.jayco.sn/',
  },
  {
    id: 'fba-consulting',
    name: 'FBA Consulting',
    sector: 'Conseil en management',
    location: 'Genève, Suisse',
    size: '100 à 200 employés',
    description:
      'FBA Consulting aide les directions générales et les équipes RH à structurer la croissance, les fusions et les projets de transformation.',
  },
];
