import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 👈 Para el textarea
import { ApiService } from '../../../core/api.service';
import { Appointment } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { errorMessage, formatShortDate } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';

@Component({
  selector: 'app-appointments-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './appointments-admin.html',
  styleUrl: './appointments-admin.scss'
})
export class AppointmentsAdmin implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  busyId = signal<string | null>(null);

  // Variables para el Modal
  modalOpen = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  newStatus = signal<'confirmed' | 'cancelled'>('confirmed');
  reason = signal('');
  saving = signal(false);

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.api.getAdminAppointments().subscribe({
      next: (list) => { this.appointments.set(list); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudieron cargar las citas.')); }
    });
  }

  formatDate(date: string): string { return formatShortDate(date); }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmada', cancelled: 'Cancelada', completed: 'Completada' };
    return labels[status] || status;
  }

  // Abrir el modal
  openModal(appointment: Appointment, status: 'confirmed' | 'cancelled'): void {
    this.selectedAppointment.set(appointment);
    this.newStatus.set(status);
    this.reason.set('');
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.selectedAppointment.set(null);
  }

  // Guardar el nuevo estado con motivo
  confirmAction(): void {
    const appt = this.selectedAppointment();
    if (!appt || this.saving()) return;

    this.saving.set(true);
    this.api.updateAppointmentStatus(appt.id, this.newStatus(), this.reason()).subscribe({
      next: (res) => {
        this.appointments.update((list) => list.map((a) => a.id === appt.id ? { ...a, status: res.appointment.status } : a));
        this.saving.set(false);
        this.closeModal();
        this.toast.success(`Cita ${this.newStatus() === 'confirmed' ? 'confirmada' : 'cancelada'}. Correo enviado al cliente.`);
      },
      error: (err) => { this.saving.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  remove(appointment: Appointment): void {
    if (!confirm(`¿Eliminar la cita de ${appointment.client_name}? (No se enviará correo al cliente)`)) return;
    this.api.deleteAppointment(appointment.id).subscribe({
      next: () => {
        this.appointments.update((list) => list.filter((a) => a.id !== appointment.id));
        this.toast.success('Cita eliminada.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }
}