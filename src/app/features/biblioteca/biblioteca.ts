import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { obtenerRolActual } from '../../core/rol';
import { CATEGORIAS_MATERIAL, ETIQUETA_TIPO, ICONO_TIPO, MaterialBiblioteca } from './biblioteca.model';
import { BibliotecaService } from './biblioteca.service';

@Component({
  selector: 'app-biblioteca',
  imports: [RouterLink],
  templateUrl: './biblioteca.html'
})
export class Biblioteca implements OnInit {
  private readonly servicio = inject(BibliotecaService);

  readonly categorias = CATEGORIAS_MATERIAL;
  readonly icono = ICONO_TIPO;
  readonly etiqueta = ETIQUETA_TIPO;

  readonly materiales = signal<MaterialBiblioteca[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly esAdmin = signal(false);
  readonly busqueda = signal('');
  readonly categoria = signal('Todas');

  // Material que coincide con el texto buscado y la categoría elegida
  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const categoria = this.categoria();

    return this.materiales().filter(
      (m) =>
        (categoria === 'Todas' || m.categoria === categoria) &&
        (!texto || `${m.titulo} ${m.descripcion}`.toLowerCase().includes(texto))
    );
  });

  async ngOnInit(): Promise<void> {
    // El botón "Administrar" solo aparece si el rol guardado en Firestore es administrador
    obtenerRolActual().then((rol) => this.esAdmin.set(rol === 'administrador'));

    try {
      this.materiales.set(await this.servicio.listarPublicados());
    } catch {
      this.error.set('No se pudo cargar la biblioteca. Intenta nuevamente.');
    } finally {
      this.cargando.set(false);
    }
  }
}
