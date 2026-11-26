import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string): string | null {
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  let updated = req.clone({ withCredentials: true });

  if (MUTATING_METHODS.has(req.method.toUpperCase())) {
    const csrfToken = getCookie('whm_csrf');
    if (csrfToken) {
      updated = updated.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken
        }
      });
    }
  }

  return next(updated);
};
