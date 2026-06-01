import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { computeSchoolCompatibility, type SchoolMatchItem } from '../api/compatibilityApi';
import {
  COMPATIBILITY_PROFILE_STORAGE_KEY,
  computeCompatibilityScores,
  isProfileComplete,
  type CompatibilityBreakdown,
  type CompatibilityProfile,
} from '../utils/compatibilityScore';

const EMPTY_PROFILE: CompatibilityProfile = {
  educationLevel: '',
  desiredDomain: '',
  preferredRegion: '',
  annualBudgetFcfa: 0,
  careerPriority: '',
};

type StoredState = {
  profile: CompatibilityProfile;
  breakdown: CompatibilityBreakdown;
  schoolMatches: SchoolMatchItem[];
};

type CompatibilityProfileContextValue = {
  profile: CompatibilityProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompatibilityProfile>>;
  breakdown: CompatibilityBreakdown | null;
  schoolMatches: SchoolMatchItem[];
  matchBySchoolId: Map<string, SchoolMatchItem>;
  hasCalculated: boolean;
  loading: boolean;
  error: string | null;
  calculate: (profile: CompatibilityProfile) => Promise<void>;
  clearError: () => void;
};

const CompatibilityProfileContext = createContext<CompatibilityProfileContextValue | null>(null);

export function CompatibilityProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CompatibilityProfile>(EMPTY_PROFILE);
  const [breakdown, setBreakdown] = useState<CompatibilityBreakdown | null>(null);
  const [schoolMatches, setSchoolMatches] = useState<SchoolMatchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((state: StoredState) => {
    try {
      sessionStorage.setItem(COMPATIBILITY_PROFILE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COMPATIBILITY_PROFILE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.profile && parsed.breakdown) {
        setProfile(parsed.profile);
        setBreakdown(parsed.breakdown);
        setSchoolMatches(parsed.schoolMatches ?? []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const matchBySchoolId = useMemo(() => {
    const map = new Map<string, SchoolMatchItem>();
    for (const match of schoolMatches) {
      map.set(String(match.schoolId), match);
    }
    return map;
  }, [schoolMatches]);

  const calculate = useCallback(
    async (nextProfile: CompatibilityProfile) => {
      if (!isProfileComplete(nextProfile)) return;

      setLoading(true);
      setError(null);
      setProfile(nextProfile);

      try {
        const result = await computeSchoolCompatibility(nextProfile);
        const nextBreakdown: CompatibilityBreakdown = {
          overall: result.overall,
          academic: result.academic,
          budget: result.budget,
          location: result.location,
          career: result.career,
        };
        setBreakdown(nextBreakdown);
        setSchoolMatches(result.schoolMatches);
        persist({
          profile: nextProfile,
          breakdown: nextBreakdown,
          schoolMatches: result.schoolMatches,
        });
      } catch {
        const fallback = computeCompatibilityScores(nextProfile);
        setBreakdown(fallback);
        setSchoolMatches([]);
        persist({ profile: nextProfile, breakdown: fallback, schoolMatches: [] });
        setError('offline');
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const value = useMemo(
    (): CompatibilityProfileContextValue => ({
      profile,
      setProfile,
      breakdown,
      schoolMatches,
      matchBySchoolId,
      hasCalculated: breakdown !== null,
      loading,
      error,
      calculate,
      clearError: () => setError(null),
    }),
    [profile, breakdown, schoolMatches, matchBySchoolId, loading, error, calculate]
  );

  return (
    <CompatibilityProfileContext.Provider value={value}>
      {children}
    </CompatibilityProfileContext.Provider>
  );
}

export function useCompatibilityProfile(): CompatibilityProfileContextValue {
  const ctx = useContext(CompatibilityProfileContext);
  if (!ctx) {
    throw new Error('useCompatibilityProfile must be used within CompatibilityProfileProvider');
  }
  return ctx;
}
