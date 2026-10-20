import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { API_URL, DEMO_MODE } from './config';
import { GalleryImage, Promotion, Service, SiteSettings, Testimonial } from './models';

/**
 * API simulada para ver el diseño sin backend. Solo actúa si DEMO_MODE = true (ver config.ts).
 * Las imágenes son ilustraciones de relleno; con tu backend real se verán tus fotos.
 */

// ---------- Utilidades ----------
let counter = 100;
const uid = () => `demo-${++counter}`;
const now = () => new Date().toISOString();
const addDays = (days: number) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const PALETTES = [['#e8b4c4', '#7d4a5e'], ['#d9a98a', '#5b3345'], ['#c9a0b4', '#3a2631'], ['#f0cdb5', '#8a5a4a'], ['#bfa3c9', '#4a3a5e'], ['#e6bfa0', '#6d3f52']];
function art(i: number, w = 800, h = 1000): string {
  const [a, b] = PALETTES[i % PALETTES.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/>` +
    `<circle cx='${w * 0.5}' cy='${h * 0.36}' r='${w * 0.15}' fill='rgba(255,255,255,.2)'/>` +
    `<path d='M${w * 0.18} ${h} Q${w * 0.5} ${h * 0.5} ${w * 0.82} ${h} Z' fill='rgba(255,255,255,.16)'/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ---------- Datos de ejemplo (en memoria) ----------
// src/app/core/demo.interceptor.ts

// ... (código anterior)

let settings: SiteSettings = {
  id: 'demo-settings',
  business_name: '[Nombre del Negocio]',
  whatsapp_number: '+593 99 123 4567',
  facebook_url: 'https://facebook.com/',
  instagram_url: 'https://instagram.com/',
  tiktok_url: 'https://tiktok.com/',
  address_text: 'Av. 10 de Agosto N36-123 y Naciones Unidas, [Ciudad]',
  map_embed_url: 'https://maps.google.com/maps?q=Quito%20Ecuador&z=13&output=embed',
  show_testimonials: true,
  city: '[Ciudad]',
  opening_hours: 'Lunes a Sábado 09:00 - 19:00',
  google_maps_url: 'https://maps.google.com/?q=Quito%20Ecuador',
  google_rating: 4.8,
  google_reviews_count: 124,
  hero_eyebrow: 'Tu estilo, nuestra pasión',
  hero_title: 'Realza tu belleza, confía en expertos',
  hero_subtitle: 'Cuidamos de tu cabello con técnicas modernas, productos de alta calidad y un trato personalizado.',
  hero_image_url: art(1, 1200, 800),
  hero_image_position: 'center', // 👈 AGREGA ESTA LÍNEA
  updated_at: now()
};

// ... (resto del código)

const mkService = (name: string, short: string, detail: string, benefits: string[], seed: number, active = true): Service => ({
  id: uid(), name, short_description: short, detailed_description: detail, benefits, is_active: active,
  images: [0, 1, 2, 3].map((n) => ({ id: uid(), image_url: art(seed + n) })),
  cover_image_url: null, created_at: now(), updated_at: now()
});

let services: Service[] = [
  mkService('Cambio de Look', 'Un nuevo estilo, una nueva tú.', 'Transformamos tu imagen con un corte y color pensados para ti, cuidando la salud de tu cabello.', ['Asesoría de imagen', 'Productos profesionales', 'Resultado personalizado'], 0),
  mkService('Expertos en Color', 'Color que realza tu esencia.', 'Tonos que realzan tu esencia. Trabajamos con las mejores técnicas de coloración para lograr un resultado natural, duradero y lleno de vida.', ['Color de larga duración', 'Cabello más brillante y saludable', 'Asesoría personalizada', 'Productos profesionales'], 1),
  mkService('Corte', 'Estilo y precisión.', 'Cortes modernos y clásicos adaptados a la forma de tu rostro y a tu estilo de vida.', ['Corte a medida', 'Lavado y secado incluidos'], 2),
  mkService('Tratamientos Capilares', 'Cabello sano y fuerte.', 'Hidratación, reparación y nutrición profunda para devolver vida a tu cabello.', ['Diagnóstico capilar', 'Reparación profunda', 'Brillo y suavidad'], 3),
  mkService('Peinados', 'Para tus ocasiones especiales.', 'Peinados para eventos, bodas y celebraciones.', ['Prueba previa', 'Fijación duradera'], 4, false)
];

let gallery: GalleryImage[] = Array.from({ length: 12 }, (_, i) => ({
  id: uid(), image_url: art(i + 2), alt_text: 'Trabajo del salón', created_at: now()
}));

let promotions: Promotion[] = [
  {
    id: uid(), title: 'Promoción Especial', subtitle: 'Color + Corte', description: 'Luce increíble por tiempo limitado.', image_url: art(1, 900, 500),
    start_date: addDays(-2), end_date: addDays(30), is_active: true, created_at: now()
  },
  {
    id: uid(), title: 'Día de la Madre', subtitle: 'Tratamiento + Peinado', description: 'Regala un día de belleza.', image_url: art(4, 900, 500),
    start_date: null, end_date: addDays(-20), is_active: false, created_at: now()
  }
];

let testimonials: Testimonial[] = [
  { id: uid(), client_name: 'María Fernanda', review_text: 'Excelente servicio, el personal es muy profesional y el resultado superó mis expectativas.', rating: 5, is_active: true, created_at: now() },
  { id: uid(), client_name: 'Daniela López', review_text: 'Me encantó el cambio de look, quedé exactamente como quería. Sin duda volveré.', rating: 5, is_active: true, created_at: now() },
  { id: uid(), client_name: 'Carla Ruiz', review_text: 'Siempre salgo feliz de aquí, son los mejores en la ciudad.', rating: 5, is_active: true, created_at: now() },
  { id: uid(), client_name: 'Ana Torres', review_text: 'Muy buena atención y precios justos.', rating: 4, is_active: false, created_at: now() }
];

const withCover = (s: Service): Service => ({ ...s, cover_image_url: s.images[0]?.image_url ?? null });

// ---------- Respuestas ----------
const ok = <T>(body: T, status = 200): Observable<HttpResponse<T>> =>
  of(new HttpResponse<T>({ status, body })).pipe(delay(220));
const fail = (status: number, message: string): Observable<never> =>
  timer(220).pipe(mergeMap(() => throwError(() => new HttpErrorResponse({ status, error: { message } }))));

const formText = (body: unknown, key: string): string | undefined => {
  if (body instanceof FormData) { const v = body.get(key); return typeof v === 'string' ? v : undefined; }
  const v = (body as Record<string, unknown> | null)?.[key];
  return v === undefined || v === null ? undefined : String(v);
};
const formFiles = (body: unknown, key: string): File[] =>
  body instanceof FormData ? (body.getAll(key).filter((f): f is File => f instanceof File)) : [];
const asBool = (v: unknown): boolean => v === true || v === 'true';
const blobImage = (file: File) => URL.createObjectURL(file);

function fakeJwt(): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  return `${b64({ alg: 'none' })}.${b64({ id: 'demo', username: 'admin', exp: Math.floor(Date.now() / 1000) + 8 * 3600 })}.demo`;
}

function route(req: HttpRequest<unknown>): Observable<HttpResponse<unknown>> {
  const path = req.url.slice(API_URL.length).split('?')[0];
  const method = req.method;
  const body = req.body;
  let m: RegExpMatchArray | null;

  // --- Auth ---
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = (body ?? {}) as { email?: string; password?: string };
    if (email === 'admin@demo.com' && password === 'demo1234') {
      return ok({ message: 'Login exitoso', token: fakeJwt(), admin: { id: 'demo', username: 'admin', email } });
    }
    return fail(401, 'Credenciales inválidas');
  }

  // --- Configuración ---
  if (method === 'GET' && path === '/settings') return ok(settings);
  if (method === 'PUT' && /^\/settings\/[^/]+$/.test(path)) {
    const patch = { ...(body as object) } as Partial<SiteSettings>;
    settings = { ...settings, ...patch, updated_at: now() };
    return ok({ message: 'Configuración actualizada', settings });
  }
  if (method === 'POST' && path === '/settings/hero-image') {
    const file = formFiles(body, 'image')[0];
    if (!file) return fail(400, 'No se subió ninguna imagen');
    settings = { ...settings, hero_image_url: blobImage(file), updated_at: now() };
    return ok({ message: 'Imagen de portada actualizada', settings });
  }

  // --- Estadísticas ---
  if (method === 'GET' && path === '/stats') {
    return ok({
      services_active: services.filter((s) => s.is_active).length,
      services_inactive: services.filter((s) => !s.is_active).length,
      gallery_total: gallery.length,
      promotions_active: promotions.filter((p) => p.is_active).length,
      promotions_inactive: promotions.filter((p) => !p.is_active).length,
      testimonials_active: testimonials.filter((t) => t.is_active).length,
      testimonials_section_on: settings.show_testimonials
    });
  }

  // --- Servicios ---
  if (method === 'GET' && path === '/services/public') return ok(services.filter((s) => s.is_active).map(withCover));
  if (method === 'GET' && path === '/services/admin') return ok(services.map(withCover));
  if (method === 'POST' && path === '/services') {
    const b = (body ?? {}) as Partial<Service>;
    if (!b.name?.trim()) return fail(400, 'El nombre del servicio es obligatorio');
    const created: Service = {
      id: uid(), name: b.name.trim(), short_description: b.short_description ?? null, detailed_description: b.detailed_description ?? null,
      benefits: b.benefits ?? [], is_active: b.is_active ?? true, images: [], cover_image_url: null, created_at: now(), updated_at: now()
    };
    services = [created, ...services];
    return ok(withCover(created), 201);
  }
  if (method === 'DELETE' && (m = path.match(/^\/services\/images\/([^/]+)$/))) {
    const service = services.find((s) => s.images.some((i) => i.id === m![1]));
    if (!service) return fail(404, 'Imagen no encontrada');
    service.images = service.images.filter((i) => i.id !== m![1]);
    return ok(withCover(service));
  }
  if (method === 'POST' && (m = path.match(/^\/services\/([^/]+)\/images$/))) {
    const service = services.find((s) => s.id === m![1]);
    if (!service) return fail(404, 'Servicio no encontrado');
    service.images = [...service.images, ...formFiles(body, 'images').map((f) => ({ id: uid(), image_url: blobImage(f) }))];
    return ok(withCover(service), 201);
  }
  if (method === 'PUT' && (m = path.match(/^\/services\/([^/]+)$/))) {
    const service = services.find((s) => s.id === m![1]);
    if (!service) return fail(404, 'Servicio no encontrado');
    Object.assign(service, body as object, { updated_at: now() });
    return ok(withCover(service));
  }
  if (method === 'DELETE' && (m = path.match(/^\/services\/([^/]+)$/))) {
    services = services.filter((s) => s.id !== m![1]);
    return ok({ message: 'Servicio eliminado' });
  }

  // --- Galería ---
  if (method === 'GET' && path === '/gallery') return ok(gallery);
  if (method === 'POST' && path === '/gallery') {
    const created = formFiles(body, 'images').map((f): GalleryImage => ({ id: uid(), image_url: blobImage(f), alt_text: 'Galería', created_at: now() }));
    if (!created.length) return fail(400, 'No se subió ninguna imagen');
    gallery = [...created.slice().reverse(), ...gallery];
    return ok(created, 201);
  }
  if (method === 'DELETE' && (m = path.match(/^\/gallery\/([^/]+)$/))) {
    gallery = gallery.filter((g) => g.id !== m![1]);
    return ok({ message: 'Imagen eliminada' });
  }

  // --- Promociones ---
  if (method === 'GET' && path === '/promotions/public') return ok(promotions.filter((p) => p.is_active));
  if (method === 'GET' && path === '/promotions/admin') return ok(promotions);
  if (method === 'POST' && path === '/promotions') {
    const title = formText(body, 'title')?.trim();
    if (!title) return fail(400, 'El título de la promoción es obligatorio');
    const file = formFiles(body, 'image')[0];
    const created: Promotion = {
      id: uid(), title, subtitle: formText(body, 'subtitle') || null, description: formText(body, 'description') || null,
      image_url: file ? blobImage(file) : null, start_date: formText(body, 'start_date') || null, end_date: formText(body, 'end_date') || null,
      is_active: formText(body, 'is_active') === undefined ? true : asBool(formText(body, 'is_active')), created_at: now()
    };
    promotions = [created, ...promotions];
    return ok(created, 201);
  }
  if (method === 'PUT' && (m = path.match(/^\/promotions\/([^/]+)$/))) {
    const promo = promotions.find((p) => p.id === m![1]);
    if (!promo) return fail(404, 'Promoción no encontrada');
    for (const key of ['title', 'subtitle', 'description', 'start_date', 'end_date'] as const) {
      const v = formText(body, key);
      if (v !== undefined) (promo as unknown as Record<string, unknown>)[key] = v.trim() === '' ? null : v.trim();
    }
    const active = formText(body, 'is_active');
    if (active !== undefined) promo.is_active = asBool(active);
    const file = formFiles(body, 'image')[0];
    if (file) promo.image_url = blobImage(file);
    return ok(promo);
  }
  if (method === 'DELETE' && (m = path.match(/^\/promotions\/([^/]+)$/))) {
    promotions = promotions.filter((p) => p.id !== m![1]);
    return ok({ message: 'Promoción eliminada' });
  }

  // --- Testimonios ---
  if (method === 'GET' && path === '/testimonials/public') return ok(testimonials.filter((t) => t.is_active));
  if (method === 'GET' && path === '/testimonials/admin') return ok(testimonials);
  if (method === 'POST' && path === '/testimonials') {
    const b = (body ?? {}) as Partial<Testimonial>;
    const created: Testimonial = { id: uid(), client_name: b.client_name ?? '', review_text: b.review_text ?? '', rating: b.rating ?? 5, is_active: true, created_at: now() };
    testimonials = [created, ...testimonials];
    return ok(created, 201);
  }
  if (method === 'PUT' && (m = path.match(/^\/testimonials\/([^/]+)\/toggle$/))) {
    const item = testimonials.find((t) => t.id === m![1]);
    if (!item) return fail(404, 'Testimonio no encontrado');
    item.is_active = asBool((body as { is_active?: unknown })?.is_active);
    return ok(item);
  }
  if (method === 'DELETE' && (m = path.match(/^\/testimonials\/([^/]+)$/))) {
    testimonials = testimonials.filter((t) => t.id !== m![1]);
    return ok({ message: 'Testimonio eliminado' });
  }

  return fail(404, `Ruta de demo no implementada: ${method} ${path}`);
}

export const demoInterceptor: HttpInterceptorFn = (req, next) =>
  DEMO_MODE && req.url.startsWith(API_URL) ? route(req) : next(req);
