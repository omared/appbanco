import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { MockBackendService } from '../mock-api/mock-backend.service';
import { CLIENTES_FIXTURES } from '../mock-api/clientes.fixtures';
import { SOLICITUDES_CLIENTE } from '../mock-api/solicitudes.fixtures';
import { CATALOGO_PRODUCTOS } from '../mock-api/productos.fixtures';
import { DatosPersonales, SolicitudInput, SolicitudResumen } from '../../shared/models/solicitud.model';

export interface EnvioResult {
  ok: boolean;
  radicado?: string;
  error?: 'error_comunicacion';
}

let radicadoSecuencia = 2;

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly backend = inject(MockBackendService);

  getDatosPrecargados(clienteId: string): Observable<DatosPersonales> {
    const fixture = CLIENTES_FIXTURES.find((f) => f.cliente.id === clienteId);
    if (!fixture) {
      return throwError(() => new Error('cliente_no_encontrado'));
    }
    const { nombre, documento, celular, correo } = fixture.cliente;
    return this.backend.respond({ nombre, documento, celular, correo });
  }

  enviarSolicitud(solicitud: SolicitudInput, options?: { fail?: boolean }): Observable<EnvioResult> {
    return this.backend.respond(solicitud, options).pipe(
      map((): EnvioResult => {
        const radicado = `RAD-2026-${String(radicadoSecuencia++).padStart(4, '0')}`;
        const producto = CATALOGO_PRODUCTOS.find((p) => p.id === solicitud.productoId);
        const resumen: SolicitudResumen = {
          radicado,
          productoNombre: producto?.nombre ?? solicitud.productoId,
          estado: 'en_estudio',
          fechaEnvio: new Date().toISOString(),
        };
        const existentes = SOLICITUDES_CLIENTE[solicitud.clienteId] ?? [];
        SOLICITUDES_CLIENTE[solicitud.clienteId] = [...existentes, resumen];
        return { ok: true, radicado };
      }),
      catchError(() => of<EnvioResult>({ ok: false, error: 'error_comunicacion' })),
    );
  }

  getMisSolicitudes(clienteId: string): Observable<SolicitudResumen[]> {
    return this.backend.respond(SOLICITUDES_CLIENTE[clienteId] ?? []);
  }
}
