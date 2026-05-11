import { useEffect } from 'react';

const SITE_NAME = 'SNJobConnect';
const SITE_URL = 'https://snjobconnect.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export interface SEOOptions {
  /** Page title — will be suffixed with "| SNJobConnect" automatically */
  title: string;
  /** Page description (recommended 140–160 chars) */
  description: string;
  /** Path relative to root (e.g. "/jobs"). Leading slash optional. */
  path?: string;
  /** Absolute or relative image URL (defaults to the global Open Graph image) */
  image?: string;
  /** og:type — defaults to "website" */
  type?: 'website' | 'article' | 'profile';
  /** Optional keywords (comma-separated) */
  keywords?: string;
  /** Optional JSON-LD payload to inject as a <script type="application/ld+json"> */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Set to true to discourage indexing of this page */
  noIndex?: boolean;
}

const ensureMeta = (selector: string, create: () => HTMLElement) => {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
};

const setNameMeta = (name: string, content: string) => {
  const el = ensureMeta(`meta[name="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('name', name);
    return m;
  });
  el.setAttribute('content', content);
};

const setPropertyMeta = (property: string, content: string) => {
  const el = ensureMeta(`meta[property="${property}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute('property', property);
    return m;
  });
  el.setAttribute('content', content);
};

const setLinkRel = (rel: string, href: string) => {
  const el = ensureMeta(`link[rel="${rel}"]`, () => {
    const l = document.createElement('link');
    l.setAttribute('rel', rel);
    return l;
  });
  el.setAttribute('href', href);
};

const JSON_LD_ATTR = 'data-seo-jsonld';

const clearDynamicJsonLd = () => {
  document
    .querySelectorAll(`script[type="application/ld+json"][${JSON_LD_ATTR}="true"]`)
    .forEach((node) => node.remove());
};

const injectJsonLd = (payload: SEOOptions['jsonLd']) => {
  if (!payload) return;
  const items = Array.isArray(payload) ? payload : [payload];
  items.forEach((item) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(JSON_LD_ATTR, 'true');
    script.text = JSON.stringify(item);
    document.head.appendChild(script);
  });
};

const buildUrl = (path?: string) => {
  if (!path) return SITE_URL + '/';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
};

/**
 * Dynamically update SEO-related <head> tags for the current route.
 *
 * Usage:
 *   useSEO({
 *     title: "Offres d'emploi",
 *     description: "Découvrez toutes les offres d'emploi au Sénégal.",
 *     path: '/jobs',
 *   });
 */
export const useSEO = (options: SEOOptions) => {
  useEffect(() => {
    const {
      title,
      description,
      path,
      image = DEFAULT_OG_IMAGE,
      type = 'website',
      keywords,
      jsonLd,
      noIndex = false,
    } = options;

    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = buildUrl(path);
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

    document.title = fullTitle;

    setNameMeta('description', description);
    if (keywords) setNameMeta('keywords', keywords);
    setNameMeta(
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'
    );

    setPropertyMeta('og:title', fullTitle);
    setPropertyMeta('og:description', description);
    setPropertyMeta('og:url', url);
    setPropertyMeta('og:type', type);
    setPropertyMeta('og:image', absoluteImage);
    setPropertyMeta('og:site_name', SITE_NAME);

    setNameMeta('twitter:card', 'summary_large_image');
    setNameMeta('twitter:title', fullTitle);
    setNameMeta('twitter:description', description);
    setNameMeta('twitter:image', absoluteImage);

    setLinkRel('canonical', url);

    clearDynamicJsonLd();
    injectJsonLd(jsonLd);

    return () => {
      clearDynamicJsonLd();
    };
  }, [
    options.title,
    options.description,
    options.path,
    options.image,
    options.type,
    options.keywords,
    options.noIndex,
    JSON.stringify(options.jsonLd ?? null),
  ]);
};

export default useSEO;
