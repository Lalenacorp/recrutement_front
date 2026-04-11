import { useNavigate } from 'react-router-dom';
import { Search, Users, Briefcase, TrendingUp, Award, ArrowRight, Sparkles, Star, CheckCircle, Shield, Zap, Target, FileCheck, Building2, GraduationCap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

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
              <span>Plateforme #1 de recrutement</span>
            </div>
            
            <h1 className="hero-title">
              Trouvez votre
              <span className="gradient-text"> prochain emploi</span>
              <br />de rêve
            </h1>
            
            <p className="hero-description">
              Connectez-vous avec les meilleures opportunités et donnez un nouvel élan à votre carrière. Plus de 10,000 offres vous attendent.
            </p>
            
            <div className="search-bar">
              <div className="search-input">
                <Search size={20} />
                <input type="text" placeholder="Titre du poste, mots-clés..." />
              </div>
              <div className="search-input">
                <Briefcase size={20} />
                <input type="text" placeholder="Ville, région..." />
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
                Rechercher
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="hero-stats">
              <div className="stat-badge">
                <Star size={14} fill="currentColor" />
                <span><strong>50,000+</strong> Candidats</span>
              </div>
              <div className="stat-badge">
                <Star size={14} fill="currentColor" />
                <span><strong>5,000+</strong> Entreprises</span>
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
                    <div className="card-company">Tech Corp</div>
                  </div>
                  <div className="card-badge">Nouveau</div>
                </div>
                
                <div className="floating-card card-2">
                  <div className="card-icon success">
                    <Users size={20} />
                  </div>
                  <div className="card-content">
                    <div className="card-title">+1,234</div>
                    <div className="card-company">Candidatures</div>
                  </div>
                </div>
                
                <div className="floating-card card-3">
                  <div className="card-icon warning">
                    <TrendingUp size={20} />
                  </div>
                  <div className="card-content">
                    <div className="card-title">+42%</div>
                    <div className="card-company">Cette semaine</div>
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
            <span className="section-badge">Nos Avantages</span>
            <h2>Pourquoi choisir JobConnect ?</h2>
            <p className="section-subtitle">La plateforme tout-en-un pour booster votre carrière professionnelle</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-badge">Populaire</span>
              <div className="feature-icon">
                <Briefcase size={32} />
              </div>
              <h3>Des milliers d'offres</h3>
              <p>Accédez à un large éventail d'opportunités dans tous les secteurs</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Plus de 10,000 postes actifs</li>
                <li><CheckCircle size={16} /> Mises à jour quotidiennes</li>
                <li><CheckCircle size={16} /> Tous les niveaux d'expérience</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <span className="feature-badge success">Vérifié</span>
              <div className="feature-icon">
                <Shield size={32} />
              </div>
              <h3>Entreprises vérifiées</h3>
              <p>Toutes nos entreprises partenaires sont vérifiées et de confiance</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Processus de vérification rigoureux</li>
                <li><CheckCircle size={16} /> Avis authentiques des employés</li>
                <li><CheckCircle size={16} /> Transparence garantie</li>
              </ul>
            </div>
            
            <div className="feature-card">
              <span className="feature-badge accent">Tendance</span>
              <div className="feature-icon">
                <Award size={32} />
              </div>
              <h3>Concours et défis</h3>
              <p>Participez à des concours et montrez vos compétences</p>
              <ul className="feature-list">
                <li><CheckCircle size={16} /> Défis techniques mensuels</li>
                <li><CheckCircle size={16} /> Récompenses attractives</li>
                <li><CheckCircle size={16} /> Visibilité auprès des recruteurs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Simple & Efficace</span>
            <h2>Comment ça marche ?</h2>
            <p className="section-subtitle">Trouvez votre emploi de rêve en 4 étapes simples</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Users size={28} />
              </div>
              <h3>Créez votre profil</h3>
              <p>Inscrivez-vous gratuitement et complétez votre profil professionnel en quelques minutes</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Target size={28} />
              </div>
              <h3>Trouvez des offres</h3>
              <p>Explorez des milliers d'opportunités correspondant à vos compétences et aspirations</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <FileCheck size={28} />
              </div>
              <h3>Postulez facilement</h3>
              <p>Candidatez en un clic avec votre profil et suivez l'évolution de vos candidatures</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <Zap size={28} />
              </div>
              <h3>Décrochez votre job</h3>
              <p>Préparez vos entretiens avec nos conseils et rejoignez l'entreprise de vos rêves</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Témoignages</span>
            <h2>Ce que disent nos utilisateurs</h2>
            <p className="section-subtitle">Des milliers de professionnels nous font confiance</p>
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
                "Grâce à JobConnect, j'ai trouvé mon poste de développeur Full Stack en moins de 2 semaines. La plateforme est intuitive et les offres sont de qualité."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">MN</div>
                <div className="author-info">
                  <div className="author-name">Maguette Ndiaye</div>
                  <div className="author-job">Développeuse Full Stack</div>
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
                "Une plateforme exceptionnelle ! Les fonctionnalités de matching sont précises et j'ai reçu plusieurs propositions correspondant parfaitement à mon profil."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">MS</div>
                <div className="author-info">
                  <div className="author-name">Mamadou Sadio</div>
                  <div className="author-job">Chef de Projet IT</div>
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
                "Les formations et ateliers proposés m'ont permis de développer de nouvelles compétences. J'ai été embauché 3 mois après mon inscription!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">SN</div>
                <div className="author-info">
                  <div className="author-name">Sambacor Niang</div>
                  <div className="author-job">Designer UX/UI</div>
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
            <span className="section-badge">Nos Partenaires</span>
            <h2>Ils recrutent avec nous</h2>
            <p className="section-subtitle">Plus de 5000 entreprises font confiance à JobConnect</p>
          </div>
          <div className="companies-logos">
            <div className="company-badge">
              <Building2 size={28} />
              <span>Tech Corp</span>
            </div>
            <div className="company-badge">
              <Building2 size={28} />
              <span>Innovation Labs</span>
            </div>
            <div className="company-badge">
              <Building2 size={28} />
              <span>Digital Solutions</span>
            </div>
            <div className="company-badge">
              <Building2 size={28} />
              <span>Creative Agency</span>
            </div>
            <div className="company-badge">
              <Building2 size={28} />
              <span>StartUp Hub</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <div className="cta-badge">
                <Building2 size={18} />
                <span>Espace Recruteurs</span>
              </div>
              <h2>Vous êtes une entreprise ?</h2>
              <p>Publiez vos offres d'emploi et trouvez les meilleurs talents en quelques clics</p>
              <ul className="cta-benefits">
                <li><CheckCircle size={18} /> Accès à plus de 50,000 candidats qualifiés</li>
                <li><CheckCircle size={18} /> Gestion simplifiée des candidatures</li>
                <li><CheckCircle size={18} /> Outils de matching intelligents</li>
              </ul>
            </div>
            <button className="btn btn-light" onClick={() => navigate('/employer/register')}>
              <span>Commencer maintenant</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="study-canada-highlight">
        <div className="container">
          <div className="study-canada-highlight-content">
            <div>
              <div className="section-badge">Nouveau service</div>
              <h2>Études au Canada — pré-inscription</h2>
              <p>
                Dossier pédagogique, frais, pièces à fournir et fiche de renseignement pour votre
                projet d&apos;études.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/etudes-canada')}>
              <GraduationCap size={18} />
              Commencer ma demande
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
              <p>Offres d'emploi actives</p>
            </div>
            <div className="stat-item">
              <h3>5,000+</h3>
              <div className="stat-icon">
                <Building2 size={32} />
              </div>
              <p>Entreprises partenaires</p>
            </div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <p>Candidats actifs</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
