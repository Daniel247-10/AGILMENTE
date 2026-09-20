import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, colecciones } from '../../../firebase';

type TipoUsuario = 'estudiante' | 'docente';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  readonly form;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly modoRegistro = signal(false);
  readonly tipoUsuario = signal<TipoUsuario>('estudiante');

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.nonNullable.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipoUsuario: ['estudiante', Validators.required]
    });

    this.modoRegistro.set(this.route.snapshot.data['modo'] === 'registro');
    this.actualizarCampoNombre();
  }

  toggleModo(): void {
    this.modoRegistro.update((value) => !value);
    this.errorMessage.set('');
    this.form.get('tipoUsuario')?.setValue(this.tipoUsuario());
    this.actualizarCampoNombre();
  }

  seleccionarTipo(tipo: TipoUsuario): void {
    this.tipoUsuario.set(tipo);
    this.form.get('tipoUsuario')?.setValue(tipo);
    this.errorMessage.set('');
  }

  async iniciarSesion(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Ingresa un correo y una contraseña válidos.');
      return;
    }

    const { email, password } = this.form.getRawValue();
    const tipoSeleccionado: TipoUsuario = this.obtenerTipoUsuario(this.form.get('tipoUsuario')?.value ?? 'estudiante');

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      this.guardarTipoUsuario(tipoSeleccionado);
      this.router.navigateByUrl('/inicio');
    } catch (error: unknown) {
      this.errorMessage.set(this.obtenerMensajeError(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async registrarUsuario(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa tu nombre completo, correo, contraseña y tipo de usuario.');
      return;
    }

    const { nombreCompleto, email, password } = this.form.getRawValue();
    const tipoSeleccionado: TipoUsuario = this.obtenerTipoUsuario(this.form.get('tipoUsuario')?.value ?? 'estudiante');

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const usuario = {
        email: credential.user.email ?? email,
        nombreCompleto: nombreCompleto.trim(),
        rol: tipoSeleccionado
      };

      await setDoc(doc(colecciones.usuarios, credential.user.uid), usuario);

      const nombreFormateado = this.formatearNombre(usuario.nombreCompleto);
      localStorage.setItem('agilmente_user_name', nombreFormateado);
      this.guardarTipoUsuario(tipoSeleccionado);
      this.router.navigateByUrl('/inicio');
    } catch (error: unknown) {
      this.errorMessage.set(this.obtenerMensajeErrorRegistro(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async iniciarConGoogle(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const uid = credential.user.uid;
      const tipoSeleccionado: TipoUsuario = this.obtenerTipoUsuario(this.form.get('tipoUsuario')?.value ?? 'estudiante');

      const userDoc = await getDoc(doc(colecciones.usuarios, uid));
      const data = {
        email: credential.user.email ?? '',
        nombreCompleto: credential.user.displayName ?? 'Usuario de Google',
        rol: tipoSeleccionado
      };

      if (!userDoc.exists()) {
        await setDoc(doc(colecciones.usuarios, uid), data);
      } else {
        await setDoc(doc(colecciones.usuarios, uid), {
          ...userDoc.data(),
          email: credential.user.email ?? userDoc.data()['email'],
          nombreCompleto: credential.user.displayName ?? userDoc.data()['nombreCompleto'],
          rol: userDoc.data()['rol'] ?? tipoSeleccionado
        }, { merge: true });
      }

      const nombreFormateado = this.formatearNombre(data.nombreCompleto);
      localStorage.setItem('agilmente_user_name', nombreFormateado);
      this.guardarTipoUsuario(tipoSeleccionado);
      this.router.navigateByUrl('/inicio');
    } catch (error: unknown) {
      this.errorMessage.set(this.obtenerMensajeErrorGoogle(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Activa el campo nombre solo en registro; un campo desactivado no cuenta para form.invalid
  private actualizarCampoNombre(): void {
    const nombre = this.form.controls.nombreCompleto;

    if (this.modoRegistro()) {
      nombre.enable();
    } else {
      nombre.disable();
    }
  }

  private formatearNombre(nombre: string): string {
    return nombre
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(' ');
  }

  private obtenerTipoUsuario(valor: string): TipoUsuario {
    return valor === 'docente' ? 'docente' : 'estudiante';
  }

  private guardarTipoUsuario(tipo: TipoUsuario): void {
    localStorage.setItem('agilmente_user_role', tipo);
  }

  private obtenerMensajeError(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error ?? '');

    if (message.includes('auth/invalid-credential') || message.includes('auth/user-not-found') || message.includes('auth/wrong-password')) {
      return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    }

    if (message.includes('auth/too-many-requests')) {
      return 'Demasiados intentos. Intenta nuevamente en unos minutos.';
    }

    if (message.includes('auth/network-request-failed')) {
      return 'No se pudo conectar a Firebase. Revisa tu conexión.';
    }

    return 'No se pudo iniciar sesión. Intenta nuevamente.';
  }

  private obtenerMensajeErrorRegistro(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error ?? '');

    if (message.includes('auth/email-already-in-use')) {
      return 'Este correo ya está registrado. Intenta iniciar sesión o usa otro correo.';
    }

    if (message.includes('auth/weak-password')) {
      return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
    }

    if (message.includes('auth/invalid-email')) {
      return 'El correo ingresado no es válido.';
    }

    return 'No se pudo completar el registro. Intenta nuevamente.';
  }

  private obtenerMensajeErrorGoogle(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error ?? '');

    if (message.includes('auth/popup-closed-by-user')) {
      return 'Se cerró la ventana de Google antes de completar la autenticación.';
    }

    if (message.includes('auth/cancelled-popup-request')) {
      return 'La autenticación con Google fue cancelada.';
    }

    if (message.includes('auth/popup-blocked')) {
      return 'El navegador bloqueó la ventana emergente. Permite pop-ups e inténtalo de nuevo.';
    }

    return 'No se pudo iniciar sesión con Google. Intenta nuevamente.';
  }
}
