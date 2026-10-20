import { HttpErrorResponse } from '@angular/common/http';

/** https://wa.me/<solo dígitos>?text=... — null si no hay número. */
export function whatsappUrl(number: string | null | undefined, text?: string): string | null {
  const digits = (number ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Si el dueño pega el <iframe> completo de Google Maps, extrae solo la URL del src. */
export function extractMapSrc(input: string | null | undefined): string {
  const value = (input ?? '').trim();
  const match = value.match(/src\s*=\s*["']([^"']+)["']/i);
  return (match ? match[1] : value).trim();
}

/** Solo se incrustan mapas de Google (evita iframes a sitios arbitrarios). */
export function isAllowedMapUrl(url: string | null | undefined): boolean {
  return !!url && /^https:\/\/((www\.)?google\.com\/maps\/embed|maps\.google\.com\/maps\?)/i.test(url);
}

/** 'YYYY-MM-DD' (o ISO) -> Date local sin desfase de zona horaria. */
function parseDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' }).format(parseDate(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parseDate(value));
}

export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Mensaje legible a partir de un error HTTP del backend. */
export function errorMessage(error: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    const message = (error.error as { message?: string } | null)?.message;
    if (message) return message;
  }
  return fallback;
}

// ---------- Diálogos: bloqueo de scroll y foco ----------
let scrollLocks = 0;
export function lockScroll(): () => void {
  if (scrollLocks++ === 0) document.body.style.overflow = 'hidden';
  return () => { if (--scrollLocks === 0) document.body.style.overflow = ''; };
}

export function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  if (event.key !== 'Tab') return;
  const focusable = Array.from(container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

export const MAX_IMAGE_DIMENSION = 4000; // 4000x4000 px

/** Valida las dimensiones de una imagen antes de subirla. */
export function validateHeroImage(file: File): Promise<{ isValid: boolean; message?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      if (img.width > 4000 || img.height > 4000) {
        resolve({ isValid: false, message: 'La imagen supera los 4000x4000 píxeles.' });
      } else if (img.height > img.width) {
        resolve({ isValid: false, message: 'La foto de portada debe ser horizontal (más ancha que alta). La tuya es vertical.' });
      } else {
        resolve({ isValid: true });
      }
    };
    img.onerror = () => resolve({ isValid: false, message: 'Error al leer la imagen.' });
    img.src = URL.createObjectURL(file);
  });
}
