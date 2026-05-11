import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Briefcase, TrendingUp, Award, ArrowRight, Sparkles, Star, CheckCircle, Shield, Zap, Target, FileCheck, Building2, GraduationCap } from 'lucide-react';
import PartnerCompanyModal from '../components/PartnerCompanyModal';
import { PARTNER_COMPANIES } from '../data/partnerCompanies';
import type { PartnerCompany } from '../data/partnerCompanies';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../utils/useSEO';

const Home = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const [partnerDetail, setPartnerDetail] = useState<PartnerCompany | null>(null);

  useSEO({
    title: isEn
      ? 'Jobs, Training & Student Space in Senegal'
      : 'Emploi, Formation & Espace Étudiant au Sénégal',
    description: isEn
      ? 'SNJobConnect is the #1 platform in Senegal for jobs, contests, training and study abroad. Connect with the best opportunities today.'
      : "SNJobConnect est la plateforme #1 au Sénégal pour trouver un emploi, postuler aux concours, suivre une formation et préparer vos études à l'étranger. Rejoignez plus de 50 000 candidats.",
    path: '/',
    keywords:
      "emploi Sénégal, offres d'emploi Dakar, recrutement Sénégal, concours Sénégal, formations, études Canada, plateforme emploi, SNJobConnect",
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SNJobConnect',
      url: 'https://snjobconnect.com/',
      inLanguage: ['fr-FR', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://snjobconnect.com/jobs?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  return (
    <div className="home">
      <section className="hero">
        {/* Animated background elements */}
        <div className="hero-bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="floating-icon icon-1"><Briefcase size={24} /></div>
          <div className="floating-icon icon-2"><Users size={24} /></div>
          <div className="floating-icon icon-3"><Award size={24} /></div>
          <div className="floating-icon icon-4"><TrendingUp size={24} /></div>
        </div>

        <div className="hero-container">
          {/* Left Content */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>{isEn ? '#1 recruitment platform' : 'Plateforme #1 de recrutement'}</span>
            </div>
            
            <h1 className="hero-title">
              {isEn ? 'Find your' : 'Trouvez votre'}
              <span className="gradient-text"> {isEn ? 'next job' : 'prochain emploi'}</span>
              <br />{isEn ? 'dream' : 'de rêve'}
            </h1>
            
            <p className="hero-description">
              {isEn
                ? 'Connect with the best opportunities and boost your career. More than 10,000 offers are waiting for you.'
                : 'Connectez-vous avec les meilleures opportunités et donnez un nouvel élan à votre carrière. Plus de 10,000 offres vous attendent.'}
            </p>
            
            <div className="search-bar">
              <div className="search-input">
                <Search size={20} />
                <input type="text" placeholder={isEn ? 'Job title, keywords...' : 'Titre du poste, mots-clés...'} />
              </div>
              <div className="search-input">
                <Briefcase size={20} />
                <input type="text" placeholder={isEn ? 'City, region...' : 'Ville, région...'} />
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
                {isEn ? 'Search' : 'Rechercher'}
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="hero-stats">
              <div className="stat-badge">
                <Star size={14} fill="currentColor" />
                <span><strong>50,000+</strong> {isEn ? 'Candidates' : 'Candidats'}</span>
              </div>
              <div className="stat-badge">
                <Star size={14} fill="currentColor" />
                <span><strong>50+</strong> {isEn ? 'Companies' : 'Entreprises'}</span>
              </div>
              <div className="stat-badge">
                <Star size={14} fill="currentColor" />
                <span><strong>98%</strong> Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="hero-illustration">
            <div className="illustration-wrapper">
              {/* Main illustration container */}
              <div className="illustration-main">
                <div className="illustration-circle circle-1"></div>
                <div className="illustration-circle circle-2"></div>
                <div className="illustration-circle circle-3"></div>
                
                {/* Floating cards */}
                <div className="floating-card card-1">
                  <div className="card-icon">
                    <Briefcase size={20} />
                  </div>
                  <div className="card-content">
                    <div className="card-title">Developer</div>
                    <div className="card-company">Helixsen</div>
                  </div>
                  <div className="card-badge">{isEn ? 'New' : 'Nouveau'}</div>
                </div>
                
                <div className="floating-card card-2">
                  <div className="card-icon success">
                    <Users size={20} />
                  </div>
                  <div className="card-content">
                    <div className="card-title">+1,234</div>
                    <div className="card-company">{isEn ? 'Applications' : 'Candidatures'}</div>
                  </div>
                </div>
                
                <div className="floating-card card-3">
                  <div className="card-icon warning">
                    <TrendingUp size={20} />
                  </div>
                  <div className="card-content">
                    <div className="card-title">+42%</div>
                    <div className="card-company">{isEn ? 'This week' : 'Cette semaine'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{isEn ? 'Our benefits' : 'Nos Avantages'}</span>
            <h2>{isEn ? 'Why choose SNJobConnect?' : 'Pourquoi choisir SNJobConnect ?'}</h2>
            <p className="section-subtitle">{isEn ? 'The all-in-one platform to boost your career' : 'La plateforme tout-en-un pour booster votre carrière professionnelle'}</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-badge">{isEn ? 'Popular' : 'Populaire'}</span>
              <div className="feature-icon">
                <Briefcase size={32} />
              </div>
              <h3>{isEn ? 'Thousands of jobs' : "Des milliers d'offres"}</h3>
              <p>{isEn ? 'Access a wide range of opportunities across all sectors' : "Accédez à un large éventail d'opportunités dans tous les secteurs"}</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> {isEn ? 'More than 10,000 active jobs' : 'Plus de 10,000 postes actifs'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'Daily updates' : 'Mises à jour quotidiennes'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'All experience levels' : "Tous les niveaux d'expérience"}</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <span className="feature-badge success">{isEn ? 'Verified' : 'Vérifié'}</span>
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>{isEn ? 'Verified companies' : 'Entreprises vérifiées'}</h3>
              <p>{isEn ? 'All partner companies are verified and trustworthy' : 'Toutes nos entreprises partenaires sont vérifiées et de confiance'}</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> {isEn ? 'Strict verification process' : 'Processus de vérification rigoureux'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'Authentic employee reviews' : 'Avis authentiques des employés'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'Guaranteed transparency' : 'Transparence garantie'}</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <span className="feature-badge accent">{isEn ? 'Trending' : 'Tendance'}</span>
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3>{isEn ? 'Contests and challenges' : 'Concours et défis'}</h3>
              <p>{isEn ? 'Join contests and showcase your skills' : 'Participez à des concours et montrez vos compétences'}</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> {isEn ? 'Monthly technical challenges' : 'Défis techniques mensuels'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'Attractive rewards' : 'Récompenses attractives'}</li>
                <li><CheckCircle size={16} /> {isEn ? 'Visibility to recruiters' : 'Visibilité auprès des recruteurs'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{isEn ? 'Simple & Efficient' : 'Simple & Efficace'}</span>
            <h2>{isEn ? 'How it works?' : 'Comment ça marche ?'}</h2>
            <p className="section-subtitle">{isEn ? 'Find your dream job in 4 simple steps' : 'Trouvez votre emploi de rêve en 4 étapes simples'}</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Users size={28} />
              </div>
              <h3>{isEn ? 'Create your profile' : 'Créez votre profil'}</h3>
              <p>{isEn ? 'Sign up for free and complete your professional profile in minutes' : 'Inscrivez-vous gratuitement et complétez votre profil professionnel en quelques minutes'}</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Target size={28} />
              </div>
              <h3>{isEn ? 'Find opportunities' : 'Trouvez des offres'}</h3>
              <p>{isEn ? 'Explore thousands of opportunities matching your skills and goals' : "Explorez des milliers d'opportunités correspondant à vos compétences et aspirations"}</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FileCheck size={28} />
              </div>
              <h3>{isEn ? 'Apply easily' : 'Postulez facilement'}</h3>
              <p>{isEn ? 'Apply in one click and track your applications' : "Candidatez en un clic avec votre profil et suivez l'évolution de vos candidatures"}</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <Zap size={28} />
              </div>
              <h3>{isEn ? 'Get hired' : 'Décrochez votre job'}</h3>
              <p>{isEn ? 'Prepare for interviews with our tips and join your dream company' : "Préparez vos entretiens avec nos conseils et rejoignez l'entreprise de vos rêves"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{isEn ? 'Testimonials' : 'Témoignages'}</span>
            <h2>{isEn ? 'What our users say' : 'Ce que disent nos utilisateurs'}</h2>
            <p className="section-subtitle">{isEn ? 'Thousands of professionals trust us' : 'Des milliers de professionnels nous font confiance'}</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
              </div>
              <p className="testimonial-text">
                {isEn
                  ? '"Thanks to SNJobConnect, I found my Full Stack Developer role in less than 2 weeks. The platform is intuitive and the job offers are high quality."'
                  : "\"Grâce à SNJobConnect, j'ai trouvé mon poste de développeur Full Stack en moins de 2 semaines. La plateforme est intuitive et les offres sont de qualité.\""}
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">MN</div>
                <div className="author-info">
                  <div className="author-name">Maguette Ndiaye</div>
                  <div className="author-job">{isEn ? 'Full Stack Developer' : 'Développeuse Full Stack'}</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
              </div>
              <p className="testimonial-text">
                {isEn
                  ? '"An exceptional platform! The matching features are accurate and I received several offers that perfectly matched my profile."'
                  : "\"Une plateforme exceptionnelle ! Les fonctionnalités de matching sont précises et j'ai reçu plusieurs propositions correspondant parfaitement à mon profil.\""}
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">MS</div>
                <div className="author-info">
                  <div className="author-name">Mamadou Sadio</div>
                  <div className="author-job">{isEn ? 'IT Project Manager' : 'Chef de Projet IT'}</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
                <Star size={16} fill="#FFD700" color="#FFD700" />
              </div>
              <p className="testimonial-text">
                {isEn
                  ? '"The training and workshops helped me develop new skills. I got hired 3 months after signing up!"'
                  : "\"Les formations et ateliers proposés m'ont permis de développer de nouvelles compétences. J'ai été embauché 3 mois après mon inscription!\""}
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SN</div>
                <div className="author-info">
                  <div className="author-name">Sambacor Niang</div>
                  <div className="author-job">{isEn ? 'UX/UI Designer' : 'Designer UX/UI'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="companies">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{isEn ? 'Our partners' : 'Nos Partenaires'}</span>
            <h2>{isEn ? 'They recruit with us' : 'Ils recrutent avec nous'}</h2>
            <p className="section-subtitle">{isEn ? 'More than 50 companies trust SNJobConnect' : 'Plus de 50 entreprises font confiance à SNJobConnect'}</p>
          </div>
          <div className="companies-logos">
            {PARTNER_COMPANIES.map((company) => (
              <button
                key={company.id}
                type="button"
                className="company-badge"
                onClick={() => setPartnerDetail(company)}
              >
                <Building2 size={28} aria-hidden />
                <span>{company.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <PartnerCompanyModal company={partnerDetail} onClose={() => setPartnerDetail(null)} />

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <div className="cta-badge">
                <Building2 size={18} />
                <span>{isEn ? 'Recruiter space' : 'Espace Recruteurs'}</span>
              </div>
              <h2>{isEn ? 'Are you a company?' : 'Vous êtes une entreprise ?'}</h2>
              <p>{isEn ? 'Post your jobs and find top talent in a few clicks' : "Publiez vos offres d'emploi et trouvez les meilleurs talents en quelques clics"}</p>
              <ul className="cta-benefits">
                <li><CheckCircle size={18} /> {isEn ? 'Access to 50,000+ qualified candidates' : 'Accès à plus de 50,000 candidats qualifiés'}</li>
                <li><CheckCircle size={18} /> {isEn ? 'Simplified application management' : 'Gestion simplifiée des candidatures'}</li>
                <li><CheckCircle size={18} /> {isEn ? 'Smart matching tools' : 'Outils de matching intelligents'}</li>
              </ul>
            </div>
            <button className="btn btn-light" onClick={() => navigate('/employer/register')}>
              <span>{isEn ? 'Get started now' : 'Commencer maintenant'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="study-canada-highlight">
        <div className="container">
          <div className="study-canada-highlight-content">
            <div>
              <div className="section-badge">{isEn ? 'New service' : 'Nouveau service'}</div>
              <h2>{isEn ? 'Study in Canada — pre-registration' : 'Études au Canada — pré-inscription'}</h2>
              <p>
                {isEn
                  ? 'Program details, fees, required documents and information form for your study plan.'
                  : 'Dossier pédagogique, frais, pièces à fournir et fiche de renseignement pour votre projet d&apos;études.'}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/espace-etudiant')}>
              <GraduationCap size={18} />
              {isEn ? 'Start my application' : 'Commencer ma demande'}
            </button>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>10,000+</h3>
              <div className="stat-icon">
                <Briefcase size={32} />
              </div>
              <p>{isEn ? 'Active job offers' : "Offres d'emploi actives"}</p>
            </div>
            <div className="stat-item">
              <h3>50+</h3>
              <div className="stat-icon">
                <Building2 size={32} />
              </div>
              <p>{isEn ? 'Partner companies' : 'Entreprises partenaires'}</p>
            </div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <p>{isEn ? 'Active candidates' : 'Candidats actifs'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
