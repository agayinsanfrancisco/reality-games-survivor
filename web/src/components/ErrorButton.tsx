import * as Sentry from '@sentry/react';

// Add this button component to your app to test Sentry's error tracking
export function ErrorButton() {
  return (
    <button
      onClick={() => {
        const error = new Error('This is your first error!');
        Sentry.captureException(error);
        throw error;
      }}
    >
      Break the world
    </button>
  );
}
