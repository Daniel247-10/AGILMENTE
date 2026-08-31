import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { signOut } from 'firebase/auth';

import { auth } from '../../../../firebase';

interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  readonly menu: ItemMenu[] = [
    { etiqueta: 'Inicio', icono: 'bi-house-door', ruta: '/inicio' },
    { etiqueta: 'Biblioteca Digital', icono: 'bi-book', ruta: '/biblioteca' },
    { etiqueta: 'Mi Progreso', icono: 'bi-bar-chart', ruta: '/progreso' },
    { etiqueta: 'Avisos y Comunicados', icono: 'bi-bell', ruta: '/avisos' },
    { etiqueta: 'Recursos Educativos', icono: 'bi-folder2-open', ruta: '/recursos' },
    { etiqueta: 'Unidad Educativa', icono: 'bi-building', ruta: '/unidad-educativa' },
    { etiqueta: 'Perfil', icono: 'bi-person-circle', ruta: '/perfil' }
  ];

  constructor(private readonly router: Router) {}

  navegar(ruta: string): void {
    this.router.navigateByUrl(ruta);
  }

  async cerrarSesion(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem('agilmente_user_role');
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
