import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { ProductRequestConfirmationPage } from './product-request-confirmation.page';

describe('HU-03c · ProductRequestConfirmationPage', () => {
  it('escenario 1: muestra el radicado recibido por query param', () => {
    TestBed.configureTestingModule({
      imports: [ProductRequestConfirmationPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ radicado: 'RAD-2026-0002' }),
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(ProductRequestConfirmationPage);
    fixture.detectChanges();

    expect(fixture.componentInstance.radicado).toBe('RAD-2026-0002');
  });
});
