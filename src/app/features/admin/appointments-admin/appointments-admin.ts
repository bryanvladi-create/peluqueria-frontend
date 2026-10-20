import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/api.service';
import { Appointment } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { errorMessage, formatShortDate } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';

@Component({
    selector: 'app-appointments-admin',
    standalone: true,
    imports: [CommonModule, IconComponent],
    templateUrl: './appointments-admin.html',
    styleUrl: './appointments-admin.scss'
})
export class AppointmentsAdmin implements OnInit {
    private api = inject(ApiService);
    private toast = inject(ToastService);

    appointments = signal<Appointment[]>([]);
    loading = signal(true);
    busyId = signal<string | null>(null);

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

    updateStatus(appointment: Appointment, newStatus: Appointment['status']): void {
        this.busyId.set(appointment.id);
        this.api.updateAppointmentStatus(appointment.id, newStatus).subscribe({
            next: (res) => {
                this.appointments.update((list) => list.map((a) => a.id === appointment.id ? { ...a, status: res.appointment.status } : a));
                this.busyId.set(null);
                this.toast.success('Estado actualizado.');
            },
            error: (err) => { this.busyId.set(null); this.toast.error(errorMessage(err)); }
        });
    }

    remove(appointment: Appointment): void {
        if (!confirm(`¿Eliminar la cita de ${appointment.client_name}?`)) return;
        this.api.deleteAppointment(appointment.id).subscribe({
            next: () => {
                this.appointments.update((list) => list.filter((a) => a.id !== appointment.id));
                this.toast.success('Cita eliminada.');
            },
            error: (err) => this.toast.error(errorMessage(err))
        });
    }
}