/**
 * fetch pour les appels authentifiés : ajoute le Bearer, et sur 401 déclenche
 * une déconnexion globale (session / jeton expiré ou refusé par le serveur).
 */

export const SESSION_EXPIRED_EVENT = 'jobconnect:session-expired';

export type AuthFetchOptions = {
  /**
   * Si false, un 401 ne vide pas la session (ex. POST logout avec jeton déjà expiré).
   * Par défaut : true.
   */
  endSessionOn401?: boolean;
};

export function clearAuthStorage(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

/** Date d'expiration du JWT (ms depuis epoch), ou null si non décodable. */
export function getJwtExpiresAtMs(token: string): number | null {
  const expSec = getJwtExpSeconds(token);
  if (expSec == null) return null;
  return expSec * 1000;
}

function getJwtExpSeconds(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (b64.length % 4)) % 4;
    const padded = b64 + '='.repeat(pad);
    const json = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof json.exp === 'number' ? json.exp : null;
  } catch {
    return null;
  }
}

/** true si le JWT est expiré (marge par défaut 30 s pour le décalage d'horloge). */
export function isAccessTokenExpired(token: string | null, skewSeconds = 30): boolean {
  if (!token) return true;
  const exp = getJwtExpSeconds(token);
  if (exp == null) return false;
  return Date.now() / 1000 >= exp - skewSeconds;
}

/**
 * Supprime le stockage local et notifie l'app (AuthProvider redirige vers /login).
 */
export function endSessionDueToExpiredToken(): void {
  if (!localStorage.getItem('token')) return;
  clearAuthStorage();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  opts: AuthFetchOptions = {}
): Promise<Response> {
  const endOn401 = opts.endSessionOn401 !== false;
  const token = localStorage.getItem('token');
  const headers = new Headers(init.headers ?? undefined);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const sentAuth = headers.has('Authorization');
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 && sentAuth && endOn401) {
    endSessionDueToExpiredToken();
  }
  return response;
}
