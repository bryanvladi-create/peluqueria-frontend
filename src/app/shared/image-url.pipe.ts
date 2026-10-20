import { Pipe, PipeTransform } from '@angular/core';
import { API_URL } from '../core/config';

// http://localhost:4000/api  ->  http://localhost:4000
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

@Pipe({ name: 'imageUrl', standalone: true })
export class ImageUrlPipe implements PipeTransform {
  transform(url: string | null | undefined): string {
    if (!url) return '';
    if (/^(https?:|data:|blob:)/i.test(url)) return url;
    if (url.startsWith('/uploads')) return `${API_ORIGIN}${url}`;
    return url;
  }
}