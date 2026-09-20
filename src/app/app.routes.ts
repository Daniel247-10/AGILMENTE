import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './firebase';
import { Login } from './features/auth/login/login';
import { Home } from './features/home/home';
import { Dashboard } from './features/dashboard/dashboard';
import { SectionPage } from './features/shared/section-page/section-page';
import { Biblioteca } from './features/biblioteca/biblioteca';
import { BibliotecaAdmin } from './features/biblioteca/admin/biblioteca-admin';
import { ContenidoAdmin } from './features/contenido/admin/contenido-admin';
import { UnidadEducativaAdmin } from './features/unidad-educativa/admin/unidad-educativa-admin';
import { obtenerRolActual } from './core/rol';

const menuItems = {
  genericas: [
    { title: 'Biblioteca Digital', description: 'Recursos, guías y material de apoyo.', icon: 'bi-book', route: '/biblioteca' },
    { title: 'Mi Progreso', description: 'Seguimiento de logros y avances.', icon: 'bi-bar-chart', route: '/progreso' },
    { title: 'Avisos y Comunicados', description: 'Novedades y recordatorios de la comunidad.', icon: 'bi-bell', route: '/avisos' },
    { title: 'Unidad Educativa', description: 'Información institucional y contacto.', icon: 'bi-building', route: '/unidad-educativa' },
    { title: 'Perfil', description: 'Configuración y datos del estudiante.', icon: 'bi-person-circle', route: '/perfil' }
  ]
};

const requireAccess: CanActivateFn = async () => {
  const router = inject(Router);

  return new Promise<boolean | any>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      const esInvitado = localStorage.getItem('agilmente_guest') === 'true';
      resolve(user || esInvitado ? true : router.createUrlTree(['/login']));
    });
  });
};

const redirectIfAuthenticated: CanActivateFn = async () => {
  const router = inject(Router);

  return new Promise<boolean | any>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      const esInvitado = localStorage.getItem('agilmente_guest') === 'true';
      resolve(user || esInvitado ? router.createUrlTree(['/inicio']) : true);
    });
  });
};

// Solo entra quien tiene rol administrador en Firestore; los demás vuelven a la biblioteca
const requireAdmin: CanActivateFn = async () => {
  const router = inject(Router);
  const rol = await obtenerRolActual();

  return rol === 'administrador' ? true : router.createUrlTree(['/biblioteca']);
};

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [redirectIfAuthenticated], data: { modo: 'login' } },
  { path: 'registrarse', component: Login, canActivate: [redirectIfAuthenticated], data: { modo: 'registro' } },
  { path: 'inicio', component: Dashboard, canActivate: [requireAccess] },
  { path: 'biblioteca', component: Biblioteca, canActivate: [requireAccess] },
  { path: 'biblioteca/administrar', component: BibliotecaAdmin, canActivate: [requireAdmin] },
  { path: 'contenido/administrar', component: ContenidoAdmin, canActivate: [requireAdmin] },
  { path: 'contenido/administrar/avisos', component: ContenidoAdmin, canActivate: [requireAdmin] },
  { path: 'unidad-educativa/administrar', component: UnidadEducativaAdmin, canActivate: [requireAdmin] },
  { path: 'progreso', component: SectionPage, canActivate: [requireAccess], data: { title: 'Mi Progreso', description: 'Visualiza tus logros, metas y evolución en cada reto.', badge: 'Estadísticas', items: menuItems.genericas.filter(item => item.route !== '/progreso') } },
  { path: 'avisos', component: SectionPage, canActivate: [requireAccess], data: { title: 'Avisos y Comunicados', description: 'Mantente informado sobre noticias, eventos y fechas importantes.', badge: 'Novedades', items: menuItems.genericas.filter(item => item.route !== '/avisos') } },
  { path: 'unidad-educativa', component: SectionPage, canActivate: [requireAccess], data: { title: 'Unidad Educativa', description: 'Conoce la comunidad, valores y espacios de aprendizaje.', badge: 'Institución', unidadEducativa: true, items: menuItems.genericas.filter(item => item.route !== '/unidad-educativa') } },
  { path: 'perfil', component: SectionPage, canActivate: [requireAccess], data: { title: 'Perfil', description: 'Consulta tus datos personales y ajustes de cuenta.', badge: 'Cuenta', items: menuItems.genericas.filter(item => item.route !== '/perfil') } },
  { path: '', component: Home, canActivate: [redirectIfAuthenticated] },
  { path: '**', redirectTo: '' }
];
