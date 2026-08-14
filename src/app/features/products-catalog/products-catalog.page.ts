import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductsService } from '../../core/products/products.service';
import { SessionService } from '../../core/session/session.service';
import { ProductoCatalogo } from '../../shared/models/producto.model';
import { RetryBanner } from '../../shared/components/retry-banner/retry-banner';

type EstadoCarga = 'cargando' | 'lista' | 'error';

@Component({
  selector: 'app-products-catalog-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RetryBanner],
  templateUrl: './products-catalog.page.html',
  styleUrl: './products-catalog.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsCatalogPage {
  private readonly productsService = inject(ProductsService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly estado = signal<EstadoCarga>('cargando');
  readonly catalogo = signal<ProductoCatalogo[]>([]);

  constructor() {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    const clienteId = this.session.session().clienteId;
    if (!clienteId) {
      return;
    }
    this.estado.set('cargando');
    this.productsService.getCatalogo(clienteId).subscribe({
      next: (catalogo) => {
        this.catalogo.set(catalogo);
        this.estado.set('lista');
      },
      error: () => this.estado.set('error'),
    });
  }

  seleccionar(producto: ProductoCatalogo): void {
    if (producto.estadoParaCliente !== 'disponible') {
      return;
    }
    this.router.navigate(['/productos', producto.id, 'solicitud']);
  }

  etiquetaEstado(producto: ProductoCatalogo): string | null {
    if (producto.estadoParaCliente === 'ya_lo_tienes') {
      return 'Ya lo tienes';
    }
    if (producto.estadoParaCliente === 'en_tramite') {
      return 'Solicitud en trámite';
    }
    return null;
  }
}
