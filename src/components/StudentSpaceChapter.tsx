import type { ReactNode } from 'react';

type StudentSpaceChapterProps = {
  id: string;
  step: number;
  title: string;
  subtitle: string;
  variant?: 'default' | 'muted' | 'accent';
  children: ReactNode;
};

const StudentSpaceChapter = ({
  id,
  step,
  title,
  subtitle,
  variant = 'default',
  children,
}: StudentSpaceChapterProps) => (
  <section
    id={id}
    className={`student-space-chapter student-space-chapter--${variant}`}
    aria-labelledby={`${id}-heading`}
  >
    <div className="container student-space-chapter-intro">
      <span className="student-space-chapter-step">
        {String(step).padStart(2, '0')}
      </span>
      <div className="student-space-chapter-headings">
        <h2 id={`${id}-heading`} className="student-space-chapter-title">
          {title}
        </h2>
        <p className="student-space-chapter-subtitle">{subtitle}</p>
      </div>
    </div>
    <div className="student-space-chapter-body">{children}</div>
  </section>
);

export default StudentSpaceChapter;
