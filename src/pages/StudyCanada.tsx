import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  CheckCircle,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Globe,
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

const FRAIS_CCA = [
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

const StudyCanada = () => {
  const [ficheSent, setFicheSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFicheSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setFicheSent(false);
    const form = event.currentTarget;
    const fd = new FormData(form);
    const payload: Record<string, string> = {};
    fd.forEach((value, key) => {
      payload[key] = String(value);
    });
    setSubmitting(true);
    try {
      await submitPreInscription(payload);
      setFicheSent(true);
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
          <span className="section-badge">CCA — Dakar</span>
          <h1>Inscription et procédures — études au Canada</h1>
          <p>
            Contenu conforme à la fiche CCA (Dakar) : ouverture de dossier pédagogique, pièces à
            fournir, frais et formulaire de renseignements.
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
              <h3 className="study-subheading">Frais CCA</h3>
              <table className="study-fees-table">
                <tbody>
                  {FRAIS_CCA.map((row) => (
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
              <h3 className="study-subheading">CCA — Contact (Dakar)</h3>
              <ul className="study-contact-list">
                <li>
                  <Mail size={18} aria-hidden />
                  <a href="mailto:info@cca-groupe.com">info@cca-groupe.com</a>
                </li>
                <li>
                  <Globe size={18} aria-hidden />
                  <a href="https://www.cca-groupe.com" target="_blank" rel="noopener noreferrer">
                    www.cca-groupe.com
                  </a>
                </li>
                <li>
                  <Phone size={18} aria-hidden />
                  <span>+221 77 295 55 33</span>
                </li>
                <li>
                  <Phone size={18} aria-hidden />
                  <span>+221 33 848 94 00</span>
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
              <h2>Fiche de renseignement (en ligne)</h2>
            </div>
            <p>
              Reproduit les rubriques de la fiche papier CCA. Les pièces justificatives (copies,
              photo, etc.) sont à fournir lors de l&apos;ouverture de dossier sur place ou selon les
              consignes du centre.
            </p>
            {submitError && (
              <p className="study-form-error" role="alert">
                {submitError}
              </p>
            )}
            <form onSubmit={handleFicheSubmit} className="study-form study-fiche-form">
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
                  <span>Où avez-vous connu CCA ?</span>
                  <input type="text" name="connuCCA" required />
                </label>
                <label className="study-field">
                  <span>Formation souhaitée</span>
                  <textarea name="formationSouhaitee" rows={2} required />
                </label>
              </fieldset>

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

              <button type="submit" className="btn btn-primary study-submit-btn" disabled={submitting}>
                <FileText size={18} />
                {submitting ? 'Envoi en cours…' : 'Envoyer ma fiche de renseignement'}
              </button>
            </form>
            {ficheSent && (
              <p className="study-success-message">
                <CheckCircle size={18} />
                Votre fiche a bien été enregistrée. Pensez à déposer les pièces du dossier auprès de
                CCA selon leurs consignes.
              </p>
            )}
          </article>
        </div>
      </section>
    </div>
  );
};

export default StudyCanada;
