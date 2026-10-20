import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/**
 * Aparición suave al entrar en pantalla (fade + slide-up de ~400 ms, ver .reveal en styles.scss).
 * Uso: <div [appReveal]="i">  — el índice solo escalona hasta 90 ms para que nada tarde más de ~500 ms.
 */
@Directive({ selector: '[appReveal]', standalone: true, host: { class: 'reveal' } })
export class RevealDirective implements OnInit, OnDestroy {
  index = input(0, { alias: 'appReveal' });
  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    this.el.style.setProperty('--reveal-delay', `${(this.index() % 4) * 30}ms`);
    if (typeof IntersectionObserver === 'undefined') {
      this.el.classList.add('is-visible');
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.el.classList.add('is-visible');
        this.observer?.disconnect();
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
