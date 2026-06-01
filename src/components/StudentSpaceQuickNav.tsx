import { useEffect, useState } from 'react';
import {
  Bookmark,
  Bot,
  Calculator,
  FileText,
  GraduationCap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type NavItem = {
  id: string;
  icon: typeof Target;
  labelFr: string;
  labelEn: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'compat-score-title', icon: Target, labelFr: 'Score', labelEn: 'Score' },
  { id: 'school-finder-title', icon: GraduationCap, labelFr: 'Écoles', labelEn: 'Schools' },
  { id: 'trainings-section-title', icon: Bookmark, labelFr: 'Formations', labelEn: 'Training' },
  { id: 'orientation-advisor-title', icon: Bot, labelFr: 'Conseiller IA', labelEn: 'AI advisor' },
  { id: 'tuition-compare-title', icon: TrendingUp, labelFr: 'Frais', labelEn: 'Tuition' },
  { id: 'budget-calc-title', icon: Calculator, labelFr: 'Budget', labelEn: 'Budget' },
  { id: 'study-procedures-title', icon: FileText, labelFr: 'Inscription', labelEn: 'Apply' },
];

const StudentSpaceQuickNav = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] }
    );

    for (const el of elements) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <nav className="student-space-quick-nav" aria-label={isEn ? 'Student space sections' : 'Sections de l\'espace étudiant'}>
      <div className="container student-space-quick-nav-inner">
        {NAV_ITEMS.map(({ id, icon: Icon, labelFr, labelEn }) => (
          <button
            key={id}
            type="button"
            className={`student-space-quick-nav-item ${activeId === id ? 'is-active' : ''}`}
            onClick={() => scrollTo(id)}
            aria-current={activeId === id ? 'true' : undefined}
          >
            <Icon size={16} aria-hidden />
            <span>{isEn ? labelEn : labelFr}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default StudentSpaceQuickNav;
