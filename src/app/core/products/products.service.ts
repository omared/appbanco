import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MockBackendService } from '../mock-api/mock-backend.service';
import { PRODUCTOS_CLIENTE, CATALOGO_PRODUCTOS } from '../mock-api/productos.fixtures';
import { ProductoCatalogo, ProductoCliente } from '../../shared/models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly backend = inject(MockBackendService);

  getProductosDelCliente(clienteId: string, options?: { fail?: boolean }): Observable<ProductoCliente[]> {
    return this.backend.respond(PRODUCTOS_CLIENTE[clienteId] ?? [], options);
  }

  getCatalogo(clienteId: string, options?: { fail?: boolean }): Observable<ProductoCatalogo[]> {
    return this.backend.respond(CATALOGO_PRODUCTOS, options);
  }
}
