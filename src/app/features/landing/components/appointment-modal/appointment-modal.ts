import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Service } from '../../../../core/models';
import { ApiService } from '../../../../core/api.service';
import { ToastService } from '../../../../core/toast.service';
import { errorMessage, lockScroll, todayIso, trapTab } from '../../../../core/utils';
import { IconComponent } from '../../../../shared/icon';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './appointment-modal.html',
  styleUrl: './appointment-modal.scss'
})
export class AppointmentModal implements OnInit, OnDestroy {
  services = input.required<Service[]>();
  closed = output<void>();

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(NonNullableFormBuilder);
  
  saving = signal(false);
  success = signal(false);
  readonly today = todayIso();

  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private unlock?: () => void;
  private previousFocus: HTMLElement | null = null;

  form = this.fb.group({
    client_name: ['', [Validators.required, Validators.maxLength(120)]],
    client_phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,20}$/)]],
    client_email: ['', [Validators.email]],
    service_id: [''],
    appointment_date: ['', [Validators.required]],
    appointment_time: ['', [Validators.required]],
    notes: ['']
  });

  ngOnInit(): void {
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.unlock = lockScroll();
    setTimeout(() => this.host.querySelector<HTMLElement>('input')?.focus());
  }

  ngOnDestroy(): void {
    this.unlock?.();
    this.previousFocus?.focus?.();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closed.emit();
    else trapTab(event, this.host);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    this.api.createAppointment({
      ...value,
      service_id: value.service_id || undefined,
      client_email: value.client_email || undefined,
      notes: value.notes || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.success.set(true);
        setTimeout(() => this.closed.emit(), 3000); // Cierra automáticamente tras 3 seg
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(errorMessage(err, 'No se pudo agendar la cita.'));
      }
    });
  }
}