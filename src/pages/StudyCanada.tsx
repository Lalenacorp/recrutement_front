import { useRef, useState } from 'react';
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

const DOSSIER_PIECES = [
  'Une fiche de renseignement à remplir',
  'Copie du passeport',
  "Copie de l'extrait de naissance",
  'Copies diplômes et relevés de notes (Lycée)',
  'Copies diplômes et relevés de notes Licence le cas échéant',
  'CV et lettre de motivation',
  'Petite photo',
] as const;

const FRAIS_ACCOMPAGNEMENT = [
  { label: "Frais d'ouverture de dossier", amount: '50.000 F CFA' },
  { label: 'Frais de procédure et de suivi', amount: '350.000 F CFA' },
  {
    label: "Frais d'honoraires (payables après l'obtention du visa)",
    amount: '400.000 F CFA',
  },
] as const;

const FRAIS_GOUV = [
  { label: 'Frais test Bright', amount: '56.200 F CFA' },
  { label: 'Frais de CAQ', amount: '80.000 F CFA' },
  { label: "Frais de visa à l'ambassade", amount: '122.000 F CFA' },
] as const;

const FORM_STEP_LABELS = [
  'Identité',
  'Coordonnées',
  'Famille & formation',
  'Parcours scolaire',
  'Antécédents Canada',
] as const;

const TOTAL_STEPS = FORM_STEP_LABELS.length;

const StudyCanada = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [ficheSent, setFicheSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const goPrev = () => {
    setStep((s) => Math.max(s - 1, 0));
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
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Impossible de contacter le serveur.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="study-canada-page">
      <section className="study-canada-hero">
        <div className="container">
          <span className="section-badge">Études au Canada</span>
          <h1>Inscription et procédures — études au Canada</h1>
          <p>
            Ouverture de dossier pédagogique, pièces à fournir, frais et formulaire de
            renseignements pour votre projet d&apos;études.
          </p>
        </div>
      </section>

      <section className="study-canada-body">
        <div className="container study-canada-main-layout">
          <div className="study-procedure-column">
            <article className="study-card study-procedure-card">
              <div className="study-card-header">
                <GraduationCap size={24} />
                <h2>Notre mission</h2>
              </div>
              <p>
                Notre mission consiste à vous trouver un établissement, à vous assister dans
                l&apos;élaboration de votre projet d&apos;étude et à vous préparer à l&apos;entretien
                que vous effectuerez à l&apos;ambassade ou au consulat.
              </p>
              <p className="study-procedure-lead">
                L&apos;accès à vos services nécessite l&apos;ouverture de dossier pédagogique qui sera
                constitué des pièces suivantes :
              </p>
              <ul className="study-doc-list">
                {DOSSIER_PIECES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="study-nb">
                <strong>NB :</strong> les dossiers des étudiants sont traités avec la plus grande
                diligence ; les démarches (courriers, fax, mandats internationaux, etc.) nous
                obligent à exiger des frais liés au traitement des dossiers.
              </p>
            </article>

            <article className="study-card">
              <h3 className="study-subheading">Frais d&apos;accompagnement</h3>
              <table className="study-fees-table">
                <tbody>
                  {FRAIS_ACCOMPAGNEMENT.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="study-subheading study-subheading-spaced">
                Frais gouvernementaux et test de langues
              </h3>
              <table className="study-fees-table">
                <tbody>
                  {FRAIS_GOUV.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <aside className="study-contact-card">
              <h3 className="study-subheading">Contact — Dakar</h3>
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
              <p className="study-contact-tagline">Nous avons votre succès à cœur</p>
            </aside>
          </div>

          <article className="study-card study-fiche-card">
            <div className="study-card-header">
              <FileText size={24} />
              <h2>Fiche de renseignement</h2>
            </div>
            <p>
              Reprend les rubriques de la fiche papier officielle. Les pièces justificatives (copies,
              photo, etc.) sont à fournir lors de l&apos;ouverture de dossier sur place ou selon les
              consignes du centre.
            </p>
            {submitError && (
              <p className="study-form-error" role="alert">
                {submitError}
              </p>
            )}
            <form
              ref={formRef}
              onSubmit={handleFicheSubmit}
              className="study-form study-fiche-form study-multistep-form"
              noValidate
            >
              <div className="study-step-panel" data-step-panel="0" hidden={step !== 0}>
              <label className="study-field">
                <span>Date d&apos;inscription</span>
                <input type="date" name="dateInscription" required />
              </label>

              <fieldset className="study-fieldset">
                <legend>Identité</legend>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Nom</span>
                    <input type="text" name="nom" required />
                  </label>
                  <label className="study-field">
                    <span>Prénom</span>
                    <input type="text" name="prenom" required />
                  </label>
                </div>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Date de naissance</span>
                    <input type="date" name="dateNaissance" required />
                  </label>
                  <label className="study-field">
                    <span>Sexe</span>
                    <select name="sexe" required defaultValue="">
                      <option value="" disabled>
                        Choisir
                      </option>
                      <option value="F">F</option>
                      <option value="M">M</option>
                    </select>
                  </label>
                </div>
                <label className="study-field">
                  <span>Lieu de naissance (ville et pays)</span>
                  <input type="text" name="lieuNaissance" required />
                </label>
                <label className="study-field">
                  <span>Adresse</span>
                  <textarea name="adresse" rows={2} required />
                </label>
                <label className="study-field">
                  <span>N° passeport</span>
                  <input type="text" name="numeroPasseport" required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="1" hidden={step !== 1}>
              <fieldset className="study-fieldset">
                <legend>Coordonnées</legend>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Téléphone</span>
                    <input type="tel" name="telephone" required />
                  </label>
                  <label className="study-field">
                    <span>Email</span>
                    <input type="email" name="email" required />
                  </label>
                </div>
                <label className="study-field">
                  <span>Tél. personne à contacter en cas d&apos;urgence</span>
                  <input type="tel" name="telephoneUrgence" required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="2" hidden={step !== 2}>
              <fieldset className="study-fieldset">
                <legend>Famille &amp; parcours</legend>
                <label className="study-field">
                  <span>Situation matrimoniale</span>
                  <input type="text" name="situationMatrimoniale" required />
                </label>
                <label className="study-field">
                  <span>Dernier diplôme obtenu</span>
                  <input type="text" name="dernierDiplome" required />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Nom et prénom du père</span>
                    <input type="text" name="nomPere" required />
                  </label>
                  <label className="study-field">
                    <span>Nom et prénom de la mère</span>
                    <input type="text" name="nomMere" required />
                  </label>
                </div>
                <label className="study-field">
                  <span>Comment nous avez-vous connus ?</span>
                  <input type="text" name="commentConnu" required />
                </label>
                <label className="study-field">
                  <span>Formation souhaitée</span>
                  <textarea name="formationSouhaitee" rows={2} required />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="3" hidden={step !== 3}>
              <fieldset className="study-fieldset">
                <legend>Établissements fréquentés — Lycée</legend>
                <label className="study-field">
                  <span>Nom du lycée</span>
                  <input type="text" name="lyceeNom" />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Diplôme obtenu</span>
                    <input type="text" name="lyceeDiplome" />
                  </label>
                  <label className="study-field">
                    <span>Série</span>
                    <input type="text" name="lyceeSerie" />
                  </label>
                </div>
                <label className="study-field">
                  <span>De quelle année à quelle année ?</span>
                  <input type="text" name="lyceePeriode" placeholder="ex. 2018 – 2021" />
                </label>
              </fieldset>

              <fieldset className="study-fieldset">
                <legend>Établissements fréquentés — Université (si applicable)</legend>
                <label className="study-field">
                  <span>Nom de l&apos;université</span>
                  <input type="text" name="universiteNom" />
                </label>
                <div className="study-form-row">
                  <label className="study-field">
                    <span>Diplôme obtenu</span>
                    <input type="text" name="universiteDiplome" />
                  </label>
                  <label className="study-field">
                    <span>Filière</span>
                    <input type="text" name="universiteFiliere" />
                  </label>
                </div>
                <label className="study-field">
                  <span>De quelle année à quelle année ?</span>
                  <input type="text" name="universitePeriode" />
                </label>
              </fieldset>
              </div>

              <div className="study-step-panel" data-step-panel="4" hidden={step !== 4}>
              <fieldset className="study-fieldset">
                <legend>Antécédents Canada</legend>
                <label className="study-field">
                  <span>Avez-vous déjà eu une admission au Canada ?</span>
                  <select name="admissionCanada" defaultValue="">
                    <option value="">—</option>
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </label>
                <label className="study-field">
                  <span>Si oui : collège ou université</span>
                  <input type="text" name="admissionCanadaEtablissement" />
                </label>
                <label className="study-field">
                  <span>Si oui : quelle année ?</span>
                  <input type="text" name="admissionCanadaAnnee" />
                </label>
                <label className="study-field">
                  <span>Formation choisie (précision)</span>
                  <input type="text" name="formationChoisie" />
                </label>
                <label className="study-field">
                  <span>Quelqu&apos;un vous a aidé à faire l&apos;admission ?</span>
                  <input type="text" name="aideAdmission" />
                </label>
                <label className="study-field">
                  <span>Avez-vous déjà déposé un visa pour le Canada ?</span>
                  <select name="dejaVisaCanada" defaultValue="">
                    <option value="">—</option>
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                  </select>
                </label>
                <label className="study-field">
                  <span>Si oui : quelle année ?</span>
                  <input type="text" name="visaCanadaAnnee" />
                </label>
                <label className="study-field">
                  <span>Si refus : raison du refus</span>
                  <textarea name="visaRefusRaison" rows={2} />
                </label>
              </fieldset>
              </div>

              <div className="study-steps-footer">
                <p className="study-steps-counter">
                  Étape {step + 1} sur {TOTAL_STEPS} — {FORM_STEP_LABELS[step]}
                </p>
                <div className="study-steps-progress" role="list" aria-label="Progression du formulaire">
                  {FORM_STEP_LABELS.map((label, i) =>
                    i < step ? (
                      <button
                        key={label}
                        type="button"
                        role="listitem"
                        className="study-step-dot done"
                        onClick={() => setStep(i)}
                        title={`Revenir à : ${label}`}
                        aria-label={`Revenir à l'étape ${i + 1} : ${label}`}
                      >
                        {i + 1}
                      </button>
                    ) : (
                      <span
                        key={label}
                        role="listitem"
                        className={`study-step-dot ${i === step ? 'active' : ''} ${i > step ? 'future' : ''}`}
                        aria-label={`Étape ${i + 1} : ${label}`}
                        aria-current={i === step ? 'step' : undefined}
                      >
                        {i + 1}
                      </span>
                    )
                  )}
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
                  Précédent
                </button>
                {step < TOTAL_STEPS - 1 ? (
                  <button type="button" className="btn btn-primary study-step-btn-next" onClick={goNext}>
                    Suivant
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary study-submit-btn" disabled={submitting}>
                    <FileText size={18} />
                    {submitting ? 'Envoi en cours…' : 'Envoyer ma fiche de renseignement'}
                  </button>
                )}
              </div>
            </form>
            {ficheSent && (
              <p className="study-success-message">
                <CheckCircle size={18} />
                Votre fiche a bien été enregistrée. Pensez à déposer les pièces du dossier sur place
                selon les consignes qui vous seront communiquées.
              </p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
};

export default StudyCanada;
