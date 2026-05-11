const TITLE_DICTIONARY: Array<[RegExp, string]> = [
  [/\bdeveloppeur\b/gi, 'Developer'],
  [/\bdéveloppeur\b/gi, 'Developer'],
  [/\bingenieur\b/gi, 'Engineer'],
  [/\bingénieur\b/gi, 'Engineer'],
  [/\bchef de projet\b/gi, 'Project Manager'],
  [/\banalyste\b/gi, 'Analyst'],
  [/\bcomptable\b/gi, 'Accountant'],
  [/\bcommercial\b/gi, 'Sales Representative'],
  [/\bmarketing\b/gi, 'Marketing'],
  [/\bressources humaines\b/gi, 'Human Resources'],
  [/\bweb\b/gi, 'Web'],
  [/\bfull stack\b/gi, 'Full Stack'],
  [/\bfront ?end\b/gi, 'Frontend'],
  [/\bback ?end\b/gi, 'Backend'],
  [/\bstagiaire\b/gi, 'Intern'],
  [/\bsenior\b/gi, 'Senior'],
  [/\bjunior\b/gi, 'Junior'],
];

export const translateJobTitle = (title: string, language: 'fr' | 'en'): string => {
  if (language !== 'en') return title;

  let translated = title;
  for (const [pattern, replacement] of TITLE_DICTIONARY) {
    translated = translated.replace(pattern, replacement);
  }
  return translated;
};

