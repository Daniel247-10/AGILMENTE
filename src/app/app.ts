import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './firebase';
import { Sidebar } from './features/dashboard/components/sidebar/sidebar';
import { Topbar } from './features/dashboard/components/topbar/topbar';
import { UsuarioResumen } from './features/dashboard/dashboard.model';

@Component({
  imports: [RouterOutlet, Sidebar, Topbar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('agilmente');
  protected readonly isAuthenticated = signal(localStorage.getItem('agilmente_guest') === 'true');

  usuario: UsuarioResumen = {
    nombre: 'Usuario',
    rol: 'estudiante',
    puntos: 1280,
    nivel: 5,
    tituloNivel: 'Exploradora',
    avatarUrl: ''
  };

  constructor() {
    onAuthStateChanged(auth, (user) => {
      const esInvitado = localStorage.getItem('agilmente_guest') === 'true';
      this.isAuthenticated.set(!!user || esInvitado);

      if (user) {
        const nombreGuardado = localStorage.getItem('agilmente_user_name') ?? user.displayName ?? 'Usuario';
        this.usuario.nombre = this.formatearNombre(nombreGuardado);
      } else if (!esInvitado) {
        this.usuario = {
          nombre: 'Usuario',
          rol: 'estudiante',
          puntos: 1280,
          nivel: 5,
          tituloNivel: 'Exploradora',
          avatarUrl: ''
        };
      }
    });
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
}
