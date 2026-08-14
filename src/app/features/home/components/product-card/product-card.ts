import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductoCliente } from '../../../../shared/models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly producto = input.required<ProductoCliente>();

  protected readonly saldoVisible = signal(true);

  readonly saldoMostrado = computed(() =>
    this.saldoVisible()
      ? this.producto().saldoOCupoDisponible.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        })
      : '***',
  );

  toggleSaldoVisible(): void {
    this.saldoVisible.update((visible) => !visible);
  }
}
