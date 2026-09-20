import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { signOut } from 'firebase/auth';

import { auth } from '../../../../firebase';
import { obtenerRolActual } from '../../../../core/rol';

interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
  rutaAdmin?: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  readonly esAdmin = signal(false);
  readonly modoUsuario = signal(false);
  readonly esInvitado = signal(false);
  readonly menu: ItemMenu[] = [
    { etiqueta: 'Inicio', icono: 'bi-house-door', ruta: '/inicio', rutaAdmin: '/contenido/administrar' },
    { etiqueta: 'Biblioteca Digital', icono: 'bi-book', ruta: '/biblioteca', rutaAdmin: '/biblioteca/administrar' },
    { etiqueta: 'Mi Progreso', icono: 'bi-bar-chart', ruta: '/progreso' },
    { etiqueta: 'Avisos y Comunicados', icono: 'bi-bell', ruta: '/avisos', rutaAdmin: '/contenido/administrar/avisos' },
    { etiqueta: 'Unidad Educativa', icono: 'bi-building', ruta: '/unidad-educativa', rutaAdmin: '/unidad-educativa/administrar' },
    { etiqueta: 'Perfil', icono: 'bi-person-circle', ruta: '/perfil' }
  ];

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.esInvitado.set(localStorage.getItem('agilmente_guest') === 'true');
    obtenerRolActual().then((rol) => {
      const esAdministrador = rol === 'administrador';
      this.esAdmin.set(esAdministrador);
      this.modoUsuario.set(esAdministrador && localStorage.getItem('agilmente_modo_usuario') === 'true');
    });
  }

  cambiarModo(): void {
    const activarModoUsuario = !this.modoUsuario();
    this.modoUsuario.set(activarModoUsuario);
    localStorage.setItem('agilmente_modo_usuario', String(activarModoUsuario));
    this.router.navigateByUrl(activarModoUsuario ? '/inicio' : '/contenido/administrar');
  }

  destino(item: ItemMenu): string {
    return this.esAdmin() && !this.modoUsuario() && item.rutaAdmin ? item.rutaAdmin : item.ruta;
  }

  async cerrarSesion(): Promise<void> {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem('agilmente_user_role');
      localStorage.removeItem('agilmente_modo_usuario');
      localStorage.removeItem('agilmente_guest');
      this.router.navigateByUrl('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
