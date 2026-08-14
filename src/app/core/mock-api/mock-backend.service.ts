import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay as rxDelay } from 'rxjs/operators';

const SIMULATED_LATENCY_MS = 400;

@Injectable({ providedIn: 'root' })
export class MockBackendService {
  respond<T>(value: T, options?: { fail?: boolean; latencyMs?: number }): Observable<T> {
    const latency = options?.latencyMs ?? SIMULATED_LATENCY_MS;
    if (options?.fail) {
      return throwError(() => new Error('mock_backend_error')).pipe(rxDelay(latency));
    }
    return of(value).pipe(rxDelay(latency));
  }
}
