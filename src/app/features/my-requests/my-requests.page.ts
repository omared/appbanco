import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { RequestsService } from '../../core/requests/requests.service';
import { SessionService } from '../../core/session/session.service';
import { SolicitudResumen } from '../../shared/models/solicitud.model';

const ETIQUETAS_ESTADO: Record<SolicitudResumen['estado'], string> = {
  en_estudio: 'En estudio',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

@Component({
  selector: 'app-my-requests-page',
  standalone: true,
  imports: [MatListModule, MatChipsModule],
  templateUrl: './my-requests.page.html',
  styleUrl: './my-requests.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRequestsPage {
  private readonly requestsService = inject(RequestsService);
  private readonly session = inject(SessionService);

  readonly solicitudes = signal<SolicitudResumen[]>([]);

  constructor() {
    const clienteId = this.session.session().clienteId;
    if (clienteId) {
      this.requestsService.getMisSolicitudes(clienteId).subscribe((solicitudes) => {
        this.solicitudes.set(solicitudes);
      });
    }
  }

  etiquetaEstado(estado: SolicitudResumen['estado']): string {
    return ETIQUETAS_ESTADO[estado];
  }
}
