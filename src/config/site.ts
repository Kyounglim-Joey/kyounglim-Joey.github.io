/**
 * Site-wide settings. Everything you are likely to change lives here.
 *
 * Nothing in this file is secret: the Umami website ID is a public identifier
 * that appears in every page's HTML by design. Never put API keys, passwords,
 * or tokens in this repository — GitHub Pages serves everything publicly.
 */

export const SITE = {
  url: 'https://kyounglim-joey.github.io',
  name: 'Kyounglim Cho',
  title: 'Kyounglim Cho — Security Engineer · AI Security',
  description:
    'Portfolio of Kyounglim Cho, an information security engineer in banking (cryptography, key management, authentication) with machine learning project experience, applying to graduate programs in security and AI security for Fall 2027.',
  role: 'Information Security Engineer',
  tagline: 'Cryptography · Authentication · Secure Infrastructure · Machine Learning',
  location: 'Seoul, South Korea',
  locale: 'en_US',
};

/**
 * Left sidebar profile card (shown on every page on desktop, on the home page on mobile).
 * Photo: put a square-ish JPG at public/images/profile.jpg (e.g. 600×600). If the file
 * does not exist, a "KC" monogram is shown instead.
 */
export const PROFILE = {
  nativeName: '조경림',
  photo: '/images/profile.jpg',
  photoAlt: 'Portrait of Kyounglim Cho',
  positions: ['Information Security Engineer', 'Hana Bank · Seoul, South Korea'],
  tagline: 'Security engineering → AI security',
};

export const LINKS = {
  github: 'https://github.com/Kyounglim-Joey',
  // TODO(Zoey): paste your LinkedIn profile URL. Leave empty to hide every LinkedIn link.
  linkedin: 'https://www.linkedin.com/in/kyounglim-cho',
  email: 'philosophic.code@gmail.com',
  cv: '/cv/Kyounglim_Cho_CV.pdf',
};

/**
 * Analytics (Umami Cloud). Values come from build-time environment variables so the
 * same code runs locally (no tracking) and in production (tracking on).
 *  - PUBLIC_UMAMI_WEBSITE_ID : set as a GitHub Actions repository *variable*.
 *  - PUBLIC_UMAMI_SCRIPT_URL : optional; defaults to Umami Cloud.
 * If the website ID is empty, no analytics script is added to any page.
 */
export const ANALYTICS = {
  websiteId: (import.meta.env.PUBLIC_UMAMI_WEBSITE_ID ?? '').trim(),
  scriptUrl: (import.meta.env.PUBLIC_UMAMI_SCRIPT_URL ?? 'https://cloud.umami.is/script.js').trim(),
  // Tracker only runs on these hostnames, so localhost/preview visits are never recorded.
  domains: (import.meta.env.PUBLIC_UMAMI_DOMAINS ?? 'kyounglim-joey.github.io').trim(),
};
