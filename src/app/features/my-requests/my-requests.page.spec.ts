import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect } from 'vitest';
import { MyRequestsPage } from './my-requests.page';
import { RequestsService } from '../../core/requests/requests.service';
import { SessionService } from '../../core/session/session.service';
import { SolicitudResumen } from '../../shared/models/solicitud.model';

const SOLICITUDES: SolicitudResumen[] = [
  {
    radicado: 'RAD-2026-0001',
    productoNombre: 'Tarjeta de Crédito',
    estado: 'en_estudio',
    fechaEnvio: '2026-07-20T10:00:00.000Z',
  },
];

describe('HU-03c · MyRequestsPage', () => {
  it('escenario 3: lista las solicitudes con su estado por radicado', () => {
    const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
    TestBed.configureTestingModule({
      imports: [MyRequestsPage],
      providers: [
        { provide: RequestsService, useValue: { getMisSolicitudes: () => of(SOLICITUDES) } },
        { provide: SessionService, useValue: sessionStub },
      ],
    });

    const fixture = TestBed.createComponent(MyRequestsPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.solicitudes()).toEqual(SOLICITUDES);
    expect(fixture.componentInstance.etiquetaEstado('en_estudio')).toBe('En estudio');
  });
});
