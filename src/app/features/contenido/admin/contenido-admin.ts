import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';

import { ComunicadoContenido, FotoContenido } from '../contenido.model';
import { ContenidoService } from '../contenido.service';
import { auth } from '../../../firebase';

@Component({
  selector: 'app-contenido-admin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contenido-admin.html'
})
export class ContenidoAdmin implements OnInit {
  private readonly servicio = inject(ContenidoService);
  private readonly fb = inject(FormBuilder);

  readonly comunicados = signal<ComunicadoContenido[]>([]);
  readonly fotos = signal<FotoContenido[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly editandoComunicado = signal<string | null>(null);
  readonly editandoFoto = signal<string | null>(null);

  readonly comunicadoForm = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    fecha: ['', [Validators.required, Validators.maxLength(40)]],
    colorDot: this.fb.nonNullable.control<'red' | 'blue' | 'green'>('blue'),
    publicado: [true]
  });

  readonly fotoForm = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    alt: ['', [Validators.required, Validators.maxLength(120)]],
    publicado: [true]
  });

  ngOnInit(): void {
    this.cargar();
  }

  async guardarComunicado(): Promise<void> {
    if (this.comunicadoForm.invalid) {
      this.comunicadoForm.markAllAsTouched();
      return;
    }

    const datos = this.comunicadoForm.getRawValue();
    await this.ejecutarGuardado(async () => {
      const id = this.editandoComunicado();
      if (id) {
        await this.servicio.actualizarComunicado(id, datos);
        this.mensaje.set('Comunicado actualizado.');
      } else {
        await this.servicio.crearComunicado(datos);
        this.mensaje.set(datos.publicado ? 'Comunicado publicado.' : 'Comunicado guardado como borrador.');
      }
      this.cancelarComunicado();
    });
  }

  async guardarFoto(): Promise<void> {
    if (this.fotoForm.invalid) {
      this.fotoForm.markAllAsTouched();
      return;
    }

    const datos = this.fotoForm.getRawValue();
    await this.ejecutarGuardado(async () => {
      const id = this.editandoFoto();
      if (id) {
        await this.servicio.actualizarFoto(id, datos);
        this.mensaje.set('Foto actualizada.');
      } else {
        await this.servicio.crearFoto(datos);
        this.mensaje.set(datos.publicado ? 'Foto publicada.' : 'Foto guardada como borrador.');
      }
      this.cancelarFoto();
    });
  }

  editarComunicado(comunicado: ComunicadoContenido): void {
    this.editandoComunicado.set(comunicado.id);
    this.comunicadoForm.setValue({
      titulo: comunicado.titulo,
      fecha: comunicado.fecha,
      colorDot: comunicado.colorDot,
      publicado: comunicado.publicado
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editarFoto(foto: FotoContenido): void {
    this.editandoFoto.set(foto.id);
    this.fotoForm.setValue({ url: foto.url, alt: foto.alt, publicado: foto.publicado });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async cambiarPublicacionComunicado(comunicado: ComunicadoContenido): Promise<void> {
    await this.ejecutarGuardado(async () => {
      await this.servicio.actualizarComunicado(comunicado.id, { publicado: !comunicado.publicado });
    });
  }

  async cambiarPublicacionFoto(foto: FotoContenido): Promise<void> {
    await this.ejecutarGuardado(async () => {
      await this.servicio.actualizarFoto(foto.id, { publicado: !foto.publicado });
    });
  }

  async eliminarComunicado(comunicado: ComunicadoContenido): Promise<void> {
    if (!confirm(`¿Eliminar el comunicado «${comunicado.titulo}»?`)) return;
    await this.ejecutarGuardado(async () => {
      await this.servicio.eliminarComunicado(comunicado.id);
      if (this.editandoComunicado() === comunicado.id) this.cancelarComunicado();
    });
  }

  async eliminarFoto(foto: FotoContenido): Promise<void> {
    if (!confirm('¿Eliminar esta foto de la galería?')) return;
    await this.ejecutarGuardado(async () => {
      await this.servicio.eliminarFoto(foto.id);
      if (this.editandoFoto() === foto.id) this.cancelarFoto();
    });
  }

  cancelarComunicado(): void {
    this.editandoComunicado.set(null);
    this.comunicadoForm.reset();
  }

  cancelarFoto(): void {
    this.editandoFoto.set(null);
    this.fotoForm.reset();
  }

  private async cargar(): Promise<void> {
    try {
      const [comunicados, fotos] = await Promise.all([
        this.servicio.listarComunicados(),
        this.servicio.listarFotos()
      ]);
      this.comunicados.set(comunicados);
      this.fotos.set(fotos);
    } catch {
      this.error.set('No se pudo cargar el contenido administrable.');
    } finally {
      this.cargando.set(false);
    }
  }

  private async ejecutarGuardado(accion: () => Promise<void>): Promise<void> {
    this.mensaje.set('');
    this.error.set('');
    this.guardando.set(true);
    try {
      await auth.authStateReady();
      if (!auth.currentUser) {
        throw new Error('UNAUTHENTICATED');
      }
      await accion();
      await this.cargar();
    } catch (error: unknown) {
      this.error.set(this.mensajeDeError(error));
    } finally {
      this.guardando.set(false);
    }
  }

  private mensajeDeError(error: unknown): string {
    const codigo = error instanceof FirebaseError ? error.code : error instanceof Error ? error.message : '';

    if (codigo.includes('permission-denied')) {
      return 'Firebase rechazó la operación: tu cuenta no tiene permisos de administrador.';
    }

    if (codigo.includes('unauthenticated') || codigo.includes('UNAUTHENTICATED')) {
      return 'La sesión no está disponible. Inicia sesión nuevamente como administrador.';
    }

    if (codigo.includes('failed-precondition')) {
      return 'Firebase necesita una configuración adicional para completar esta operación.';
    }

    if (codigo.includes('network')) {
      return 'No se pudo conectar con Firebase. Revisa tu conexión a internet.';
    }

    return 'No se pudo completar la operación. Verifica tu conexión y que tu cuenta sea administradora.';
  }
}
