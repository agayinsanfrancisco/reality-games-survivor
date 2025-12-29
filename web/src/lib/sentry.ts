/**
 * Sentry Configuration
 *
 * Error tracking and performance monitoring for the frontend.
 */

import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn =
    import.meta.env.VITE_SENTRY_DSN ||
    'https://60ede8b927dfe100fbda00b199b28307@o4510618335903744.ingest.us.sentry.io/4510618379091968';

  Sentry.init({
    dsn,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}

// Export Sentry for use in components
export { Sentry };
