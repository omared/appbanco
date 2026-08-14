import { Injectable, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { SessionSnapshot } from '../../shared/models/session.model';

const SESSION_CERRADA: SessionSnapshot = { token: null, clienteId: null, estado: 'cerrada' };
const INACTIVIDAD_TIMEOUT_MS = 5 * 60 * 1000;
const EVENTOS_ACTIVIDAD = ['click', 'keydown', 'touchstart'] as const;

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sessionState = signal<SessionSnapshot>(SESSION_CERRADA);
  private readonly expiracionSubject = new Subject<void>();
  private inactividadTimer: ReturnType<typeof setTimeout> | undefined;

  readonly session: Signal<SessionSnapshot> = this.sessionState.asReadonly();
  readonly onExpiracionPorInactividad = this.expiracionSubject.asObservable();

  constructor() {
    if (this.isBrowser) {
      for (const evento of EVENTOS_ACTIVIDAD) {
        document.addEventListener(evento, () => this.registrarActividad(), { passive: true });
      }
    }
  }

  iniciar(clienteId: string, token: string): void {
    this.sessionState.set({ token, clienteId, estado: 'activa' });
    this.registrarActividad();
  }

  clear(motivo: 'manual' | 'inactividad' = 'manual'): void {
    this.detenerTemporizador();
    this.sessionState.set({
      token: null,
      clienteId: null,
      estado: motivo === 'inactividad' ? 'expirada' : 'cerrada',
    });
  }

  registrarActividad(): void {
    if (!this.isBrowser || this.sessionState().estado !== 'activa') {
      return;
    }
    this.detenerTemporizador();
    this.inactividadTimer = setTimeout(() => this.expirarPorInactividad(), INACTIVIDAD_TIMEOUT_MS);
  }

  private expirarPorInactividad(): void {
    this.clear('inactividad');
    this.expiracionSubject.next();
  }

  private detenerTemporizador(): void {
    if (this.inactividadTimer !== undefined) {
      clearTimeout(this.inactividadTimer);
      this.inactividadTimer = undefined;
    }
  }
}
