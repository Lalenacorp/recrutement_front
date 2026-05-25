import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  MapPin,
  Phone,
} from 'lucide-react';
import { submitPreInscription } from '../api/preInscriptionApi';
import { ApiError } from '../api/authApi';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';
import OrientationAdvisorChat from '../components/OrientationAdvisorChat';
import SchoolFinderSection from '../components/SchoolFinderSection';
import TuitionComparisonSection from '../components/TuitionComparisonSection';
import BudgetCalculatorSection from '../components/BudgetCalculatorSection';

const DOSSIER_PIECES_FR = [
  'Une fiche de renseignement à remplir',
  'Copie du passeport',
  "Copie de l'extrait de naissance",
  'Copies diplômes et relevés de notes (Lycée)',
  'Copies diplômes et relevés de notes Licence le cas échéant',
  'CV et lettre de motivation',
  'Petite photo',
] as const;

const DOSSIER_PIECES_EN = [
  'Completed information form',
  'Passport copy',
  'Birth certificate copy',
  'Copies of diplomas and transcripts (High school)',
  "Copies of bachelor's diplomas and transcripts (if applicable)",
  'CV and cover letter',
  'Passport photo',
] as const;

const FRAIS_ACCOMPAGNEMENT_FR = [
  { label: "Frais d'ouverture de dossier", amount: '75.000 F CFA' },
  { label: 'Frais de procédure et de suivi', amount: '350.000 F CFA' },
  {
    label: "Frais d'honoraires (payables après l'obtention du visa)",
    amount: '400.000 F CFA',
  },
] as const;

const FRAIS_ACCOMPAGNEMENT_EN = [
  { label: 'File opening fee', amount: '750000 CFA' },
  { label: 'Procedure and follow-up fee', amount: '350,000 CFA' },
  {
    label: 'Professional fee (payable after visa approval)',
    amount: '400,000 CFA',
  },
] as const;

const FRAIS_GOUV_FR = [
  { label: 'Frais test Bright', amount: '56.200 F CFA' },
  { label: 'Frais de CAQ', amount: '80.000 F CFA' },
  { label: "Frais de visa à l'ambassade", amount: '122.000 F CFA' },
] as const;

const FRAIS_GOUV_EN = [
  { label: 'Bright test fee', amount: '56,200 CFA' },
  { label: 'CAQ fee', amount: '80,000 CFA' },
  { label: 'Embassy visa fee', amount: '122,000 CFA' },
] as const;

const FORM_STEP_LABELS_FR = [
  'Identité',
  'Coordonnées',
  'Famille & formation',
  'Parcours scolaire',
  'Antécédents Canada',
] as const;

const FORM_STEP_LABELS_EN = [
  'Identity',
  'Contact details',
  'Family & education',
  'Education history',
  'Canada history',
] as const;

const TOTAL_STEPS = FORM_STEP_LABELS_FR.length;

const DRAFT_KEY = 'studyCanadaPreInscriptionDraft';

type DraftPayload = { step: number; data: Record<string, string> };

function applyDraftValueToNamedControl(
  el: Element | RadioNodeList | null,
  value: string
): void {
  if (!el) return;
  if (el instanceof RadioNodeList) {
    for (let i = 0; i < el.length; i++) {
      const node = el.item(i);
      if (node instanceof HTMLInputElement && node.type === 'radio' && node.value === value) {
        node.checked = true;
      }
    }
    return;
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    el.value = value;
  }
}

const StudyCanada = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  useSEO({
    title: isEn ? 'Student Space — SNJobConnect' : 'Espace Étudiant — SNJobConnect',
    description: isEn
      ? 'Complete program to study in Canada from Senegal: admissions, visa, accommodation and support. Apply with SNJobConnect today.'
      : "Programme complet pour étudier au Canada depuis le Sénégal : admissions, visa, logement et accompagnement. Lancez votre pré-inscription sur SNJobConnect.",
    path: '/espace-etudiant',
    keywords:
      "études Canada, étudier au Canada, visa étudiant Canada, université Canada Sénégal, pré-inscription, accompagnement étudiant",
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: isEn ? 'Study in Canada — Senegal program' : 'Études au Canada — Programme Sénégal',
      provider: {
        '@type': 'Organization',
        name: 'SNJobConnect',
        url: 'https://snjobconnect.com/',
      },
      areaServed: { '@type': 'Country', name: 'Senegal' },
      serviceType: 'Education abroad consulting',
      url: 'https://snjobconnect.com/espace-etudiant',
    },
  });

  const dossierPieces = isEn ? DOSSIER_PIECES_EN : DOSSIER_PIECES_FR;
  const fraisAccompagnement = isEn ? FRAIS_ACCOMPAGNEMENT_EN : FRAIS_ACCOMPAGNEMENT_FR;
  const fraisGouv = isEn ? FRAIS_GOUV_EN : FRAIS_GOUV_FR;
  const stepLabels = isEn ? FORM_STEP_LABELS_EN : FORM_STEP_LABELS_FR;
  const formRef = useRef<HTMLFormElement>(null);
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [step, setStep] = useState(0);
  const [ficheSent, setFicheSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const snapshotDraft = useCallback((nextStep: number) => {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    fd.forEach((value, key) => {
      data[key] = String(value);
    });
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ step: nextStep, data } satisfies DraftPayload));
    } catch {
      /* quota / private mode */
    }
  }, []);

  const scheduleDraftSave = useCallback(() => {
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => {
      draftSaveTimer.current = null;
      snapshotDraft(step);
    }, 400);
  }, [snapshotDraft, step]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DraftPayload;
      if (
        typeof parsed.step !== 'number' ||
        parsed.step < 0 ||
        parsed.step >= TOTAL_STEPS ||
        !parsed.data ||
        typeof parsed.data !== 'object'
      ) {
        return;
      }
      setStep(parsed.step);
      queueMicrotask(() => {
        const form = formRef.current;
        if (!form) return;
        for (const [name, value] of Object.entries(parsed.data)) {
          applyDraftValueToNamedControl(form.elements.namedItem(name), value);
        }
      });
    } catch {
      /* ignore invalid draft */
    }
  }, []);

  useEffect(() => () => {
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
  }, []);

  const validateCurrentStep = (): boolean => {
    const form = formRef.current;
    if (!form) return false;
    const panel = form.querySelector(`[data-step-panel="${step}"]`);
    if (!panel) return false;
    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input, select, textarea'
    );
    for (const field of fields) {
      if (!field.checkValidity()) {
        field.focus();
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setStep((s) => {
      const next = Math.min(s + 1, TOTAL_STEPS - 1);
      queueMicrotask(() => snapshotDraft(next));
      return next;
    });
  };

  const goPrev = () => {
    setStep((s) => {
      const next = Math.max(s - 1, 0);
      queueMicrotask(() => snapshotDraft(next));
      return next;
    });
  };

  const validateEntireForm = (form: HTMLFormElement): boolean => {
    const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input[required], select[required], textarea[required]'
    );
    for (const field of requiredFields) {
      if (!field.checkValidity()) {
        const panel = field.closest('[data-step-panel]');
        const idx = panel?.getAttribute('data-step-panel');
        if (idx !== null && idx !== undefined) setStep(parseInt(idx, 10));
        field.focus();
        field.reportValidity();
        return false;
      }
    }
    return true;
  };

  const handleFicheSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!validateEntireForm(form)) return;

    setSubmitError(null);
    setFicheSent(false);
    const fd = new FormData(form);
    const payload: Record<string, string> = {};
    fd.forEach((value, key) => {
      payload[key] = String(value);
    });
    setSubmitting(true);
    try {
      await submitPreInscription(payload);
      setFicheSent(true);
      setStep(0);
      form.reset();
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : (isEn ? 'Unable to reach server.' : 'Impossible de contacter le serveur.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="study-canada-page">
      <section className="study-canada-hero">
        <div className="container">
          <span className="section-badge">{isEn ? 'Student Space' : 'Espace Étudiant'}</span>
          <h1>{isEn ? 'Student Space' : 'Espace Étudiant'}</h1>
          <p>
            {isEn
              ? 'Find a school in Senegal, get guidance from our AI advisor, and complete your study abroad file (Canada) with SNJobConnect.'
              : "Trouvez une école au Sénégal, bénéficiez du conseiller IA d'orientation et préparez votre dossier d'études à l'étranger (Canada) avec SNJobConnect."}
          </p>
        </div>
      </section>

      <SchoolFinderSection />

      <TuitionComparisonSection />

      <BudgetCalculatorSection />

      <section className="study-canada-procedures-header" aria-labelledby="study-procedures-title">
        <div className="container">
          <span className="section-badge">
            <FileText size={14} aria-hidden />
            {isEn ? 'Registration' : 'Inscription'}
          </span>
          <h2 id="study-procedures-title">
            {isEn ? 'Registration and procedures' : 'Inscription et procédures'}
          </h2>
          <p>
            {isEn
              ? 'File opening, required documents, fees and information form for your study project.'
              : "Ouverture de dossier pédagogique, pièces à fournir, frais et formulaire de renseignements pour votre projet d'études."}
          </p>
        </div>
      </section>

      <section className="study-canada-body">
        <div className="container study-canada-main-layout">
          <div className="study-procedure-column">
            <article className="study-card study-procedure-card">
              <div className="study-card-header">
                <GraduationCap size={24} />
                <h2>{isEn ? 'Our mission' : 'Notre mission'}</h2>
              </div>
              <p>
                {isEn
                  ? 'Our mission is to help you find an institution, support your study plan and prepare you for the embassy/consulate interview.'
                  : 'Notre mission consiste à vous trouver un établissement, à vous assister dans l&apos;élaboration de votre projet d&apos;étude et à vous préparer à l&apos;entretien que vous effectuerez à l&apos;ambassade ou au consulat.'}
              </p>
              <p className="study-procedure-lead">
                {isEn
                  ? 'Access to our services requires opening a study file with the following documents:'
                  : 'L&apos;accès à vos services nécessite l&apos;ouverture de dossier pédagogique qui sera constitué des pièces suivantes :'}
              </p>
              <ul className="study-doc-list">
                {dossierPieces.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="study-nb">
                <strong>NB :</strong> {isEn
                  ? 'student files are handled with great care; procedures (letters, fax, international transfers, etc.) require processing fees.'
                  : 'les dossiers des étudiants sont traités avec la plus grande diligence ; les démarches (courriers, fax, mandats internationaux, etc.) nous obligent à exiger des frais liés au traitement des dossiers.'}
              </p>
            </article>

            <article className="study-card">
              <h3 className="study-subheading">{isEn ? 'Support fees' : "Frais d'accompagnement"}</h3>
              <table className="study-fees-table">
                <tbody>
                  {fraisAccompagnement.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="study-subheading study-subheading-spaced">
                {isEn ? 'Government fees and language test' : 'Frais gouvernementaux et test de langues'}
              </h3>
              <table className="study-fees-table">
                <tbody>
                  {fraisGouv.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <aside className="study-contact-card">
              <h3 className="study-subheading">{isEn ? 'Contact — Dakar' : 'Contact — Dakar'}</h3>
              <ul className="study-contact-list">
                <li>
                  <Phone size={18} aria-hidden />
                  <span>+221 77 641 78 41</span>
                </li>
                <li>
                  <Phone size={18} aria-hidden />
                  <span>+1 (315) 222-8387</span>
                </li>
                <li>
                  <Phone size={18} aria-hidden />
                  <span>+221 77 295 55 33</span>
                </li>
                <li>
                  <MapPin size={18} aria-hidden />
                  <span>
                    2 voies liberté 6 en face camp pénal, lot 3 D3
                  </span>
                </li>
              </ul>
              <p className="study-contact-tagline">{isEn ? 'Your success matters to us' : 'Nous avons votre succès à cœur'}</p>
            </aside>
          </div>

          <article className="study-card study-fiche-card">
            <div className="study-card-header">
              <FileText size={24} />
              <h2>{isEn ? 'Information form' : 'Fiche de renseignement'}</h2>
            </div>
            <p>
              {isEn
                ? 'This form follows the official paper version sections. Supporting documents (copies, photo, etc.) must be provided when opening your file on site or as instructed by the center.'
                : 'Reprend les rubriques de la fiche papier officielle. Les pièces justificatives (copies, photo, etc.) sont à fournir lors de l&apos;ouverture de dossier sur place ou selon les consignes du centre.'}
            </p>
            {submitError && (
              <p className="study-form-error" role="alert">
                {submitError}
              </p>
            )}
            <form
              ref={formRef}
              onSubmit={handleFicheSubmit}
              onInput={scheduleDraftSave}
              className="study-form study-fiche-form study-multistep-form"
              noValidate
            >
              <div className="study-step-panel" data-step-panel="0" hidden={step !== 0}>
              <label className="study-field">
                <span>{isEn ? 'Registration date' : "Date d'inscription"}</span>
                <input type="date" name="dateInscription" required />
              </label>

              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Identity' : 'Identité'}</legend>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? 'Last name' : 'Nom'}</span>
                    <input type="text" name="nom" required />
                  </label>
                  <label className="study-field">
                    <span>{isEn ? 'First name' : 'Prénom'}</span>
                    <input type="text" name="prenom" required />
                  </label>
                </div>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? 'Date of birth' : 'Date de naissance'}</span>
                    <input type="date" name="dateNaissance" required />
                  </label>
                  <label className="study-field">
                    <span>{isEn ? 'Gender' : 'Sexe'}</span>
                    <select name="sexe" required defaultValue="">
                      <option value="" disabled>
                        {isEn ? 'Choose' : 'Choisir'}
                      </option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </label>
                </div>
                <label className="study-field">
                  <span>{isEn ? 'Place of birth (city and country)' : 'Lieu de naissance (ville et pays)'}</span>
                  <input type="text" name="lieuNaissance" required />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Address' : 'Adresse'}</span>
                  <textarea name="adresse" rows={2} required />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Passport number' : 'N° passeport'}</span>
                  <input type="text" name="numeroPasseport" required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="1" hidden={step !== 1}>
              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Contact details' : 'Coordonnées'}</legend>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? 'Phone' : 'Téléphone'}</span>
                    <input type="tel" name="telephone" required />
                  </label>
                  <label className="study-field">
                    <span>Email</span>
                    <input type="email" name="email" required />
                  </label>
                </div>
                <label className="study-field">
                    <span>{isEn ? 'Emergency contact phone' : "Tél. personne à contacter en cas d'urgence"}</span>
                  <input type="tel" name="telephoneUrgence" required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="2" hidden={step !== 2}>
              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Family & path' : 'Famille & parcours'}</legend>
                <label className="study-field">
                  <span>{isEn ? 'Marital status' : 'Situation matrimoniale'}</span>
                  <input type="text" name="situationMatrimoniale" required />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Latest diploma obtained' : 'Dernier diplôme obtenu'}</span>
                  <input type="text" name="dernierDiplome" required />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? "Father's full name" : 'Nom et prénom du père'}</span>
                    <input type="text" name="nomPere" required />
                  </label>
                  <label className="study-field">
                    <span>{isEn ? "Mother's full name" : 'Nom et prénom de la mère'}</span>
                    <input type="text" name="nomMere" required />
                  </label>
                </div>
                <label className="study-field">
                  <span>{isEn ? 'How did you hear about us?' : 'Comment nous avez-vous connus ?'}</span>
                  <input type="text" name="commentConnu" required />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Desired program' : 'Formation souhaitée'}</span>
                  <textarea name="formationSouhaitee" rows={2} required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="3" hidden={step !== 3}>
              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Schools attended — High school' : 'Établissements fréquentés — Lycée'}</legend>
                <label className="study-field">
                  <span>{isEn ? 'High school name' : 'Nom du lycée'}</span>
                  <input type="text" name="lyceeNom" />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? 'Diploma obtained' : 'Diplôme obtenu'}</span>
                    <input type="text" name="lyceeDiplome" />
                  </label>
                  <label className="study-field">
                    <span>{isEn ? 'Track' : 'Série'}</span>
                    <input type="text" name="lyceeSerie" />
                  </label>
                </div>
                <label className="study-field">
                  <span>{isEn ? 'From which year to which year?' : 'De quelle année à quelle année ?'}</span>
                  <input type="text" name="lyceePeriode" placeholder={isEn ? 'e.g. 2018 – 2021' : 'ex. 2018 – 2021'} />
                </label>
              </fieldset>

              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Schools attended — University (if applicable)' : 'Établissements fréquentés — Université (si applicable)'}</legend>
                <label className="study-field">
                  <span>{isEn ? 'University name' : "Nom de l'université"}</span>
                  <input type="text" name="universiteNom" />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>{isEn ? 'Diploma obtained' : 'Diplôme obtenu'}</span>
                    <input type="text" name="universiteDiplome" />
                  </label>
                  <label className="study-field">
                    <span>{isEn ? 'Major' : 'Filière'}</span>
                    <input type="text" name="universiteFiliere" />
                  </label>
                </div>
                <label className="study-field">
                  <span>{isEn ? 'From which year to which year?' : 'De quelle année à quelle année ?'}</span>
                  <input type="text" name="universitePeriode" />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="4" hidden={step !== 4}>
              <fieldset className="study-fieldset">
                <legend>{isEn ? 'Canada history' : 'Antécédents Canada'}</legend>
                <label className="study-field">
                  <span>{isEn ? 'Have you already received an admission in Canada?' : 'Avez-vous déjà eu une admission au Canada ?'}</span>
                  <select name="admissionCanada" defaultValue="">
                    <option value="">—</option>
                    <option value="non">{isEn ? 'No' : 'Non'}</option>
                    <option value="oui">{isEn ? 'Yes' : 'Oui'}</option>
                  </select>
                </label>
                <label className="study-field">
                  <span>{isEn ? 'If yes: college or university' : 'Si oui : collège ou université'}</span>
                  <input type="text" name="admissionCanadaEtablissement" />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'If yes: which year?' : 'Si oui : quelle année ?'}</span>
                  <input type="text" name="admissionCanadaAnnee" />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Chosen program (details)' : 'Formation choisie (précision)'}</span>
                  <input type="text" name="formationChoisie" />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Did someone help you with admission?' : "Quelqu'un vous a aidé à faire l'admission ?"}</span>
                  <input type="text" name="aideAdmission" />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'Have you already applied for a Canada visa?' : 'Avez-vous déjà déposé un visa pour le Canada ?'}</span>
                  <select name="dejaVisaCanada" defaultValue="">
                    <option value="">—</option>
                    <option value="non">{isEn ? 'No' : 'Non'}</option>
                    <option value="oui">{isEn ? 'Yes' : 'Oui'}</option>
                  </select>
                </label>
                <label className="study-field">
                  <span>{isEn ? 'If yes: which year?' : 'Si oui : quelle année ?'}</span>
                  <input type="text" name="visaCanadaAnnee" />
                </label>
                <label className="study-field">
                  <span>{isEn ? 'If refused: reason for refusal' : 'Si refus : raison du refus'}</span>
                  <textarea name="visaRefusRaison" rows={2} />
                </label>
              </fieldset>
              </div>

              <div className="study-steps-footer">
                <p className="study-steps-counter">
                  {isEn ? `Step ${step + 1} of ${TOTAL_STEPS}` : `Étape ${step + 1} sur ${TOTAL_STEPS}`} — {stepLabels[step]}
                </p>
                <div className="study-steps-progress" role="list" aria-label={isEn ? 'Form progress' : 'Progression du formulaire'}>
                  {stepLabels.map((label, i) => (
                    <span
                      key={label}
                      role="listitem"
                      className={`study-step-dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''} ${i > step ? 'future' : ''}`}
                      aria-label={isEn ? `Step ${i + 1}: ${label}` : `Étape ${i + 1} : ${label}`}
                      aria-current={i === step ? 'step' : undefined}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>

              <div className="study-steps-actions">
                <button
                  type="button"
                  className="btn btn-outline study-step-btn-prev"
                  onClick={goPrev}
                  disabled={step === 0 || submitting}
                >
                  <ChevronLeft size={18} />
                  {isEn ? 'Previous' : 'Précédent'}
                </button>
                {step < TOTAL_STEPS - 1 ? (
                  <button type="button" className="btn btn-primary study-step-btn-next" onClick={goNext}>
                    {isEn ? 'Next' : 'Suivant'}
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary study-submit-btn" disabled={submitting}>
                    <FileText size={18} />
                    {submitting ? (isEn ? 'Sending...' : 'Envoi en cours…') : (isEn ? 'Submit my information form' : 'Envoyer ma fiche de renseignement')}
                  </button>
                )}
              </div>
            </form>
            {ficheSent && (
              <p className="study-success-message">
                <CheckCircle size={18} />
                {isEn
                  ? 'Your form has been saved. Please submit your supporting documents on site as instructed.'
                  : 'Votre fiche a bien été enregistrée. Pensez à déposer les pièces du dossier sur place selon les consignes qui vous seront communiquées.'}
              </p>
            )}
          </article>
        </div>
      </section>

      <OrientationAdvisorChat />
    </div>
  );
};

export default StudyCanada;
