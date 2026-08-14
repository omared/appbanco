import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { MockBackendService } from '../mock-api/mock-backend.service';
import { CLIENTES_FIXTURES, ClienteFixture } from '../mock-api/clientes.fixtures';
import { Cliente } from '../../shared/models/cliente.model';
import { SessionService } from '../session/session.service';

const BLOQUEO_TRAS_INTENTOS = 3;
const BLOQUEO_DURACION_MS = 30 * 60 * 1000;

export interface LoginResult {
  ok: boolean;
  cliente?: Cliente;
  token?: string;
  error?: 'credenciales_invalidas' | 'usuario_bloqueado';
  bloqueadoHasta?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly backend = inject(MockBackendService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  private readonly fixtures: ClienteFixture[] = CLIENTES_FIXTURES;

  login(documento: string, password: string): Observable<LoginResult> {
    const fixture = this.fixtures.find((f) => f.cliente.documento === documento);

    return this.backend.respond(fixture).pipe(map((f) => this.evaluarIntento(f, password)));
  }

  private evaluarIntento(fixture: ClienteFixture | undefined, password: string): LoginResult {
    if (!fixture) {
      return { ok: false, error: 'credenciales_invalidas' };
    }

    if (fixture.bloqueadoHasta && Date.now() < Date.parse(fixture.bloqueadoHasta)) {
      return { ok: false, error: 'usuario_bloqueado', bloqueadoHasta: fixture.bloqueadoHasta };
    }

    if (fixture.password !== password) {
      fixture.intentosFallidos += 1;
      if (fixture.intentosFallidos >= BLOQUEO_TRAS_INTENTOS) {
        fixture.bloqueadoHasta = new Date(Date.now() + BLOQUEO_DURACION_MS).toISOString();
        return { ok: false, error: 'usuario_bloqueado', bloqueadoHasta: fixture.bloqueadoHasta };
      }
      return { ok: false, error: 'credenciales_invalidas' };
    }

    fixture.intentosFallidos = 0;
    fixture.bloqueadoHasta = null;
    const token = `mock-token-${fixture.cliente.id}-${Date.now()}`;
    this.session.iniciar(fixture.cliente.id, token);
    return { ok: true, cliente: fixture.cliente, token };
  }

  logout(motivo: 'manual' | 'inactividad' = 'manual'): void {
    this.session.clear(motivo);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
