import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './firebase';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { SectionPage } from './features/shared/section-page/section-page';

const menuItems = {
  genericas: [
    { title: 'Biblioteca Digital', description: 'Recursos, guías y material de apoyo.', icon: 'bi-book', route: '/biblioteca' },
    { title: 'Mi Progreso', description: 'Seguimiento de logros y avances.', icon: 'bi-bar-chart', route: '/progreso' },
    { title: 'Avisos y Comunicados', description: 'Novedades y recordatorios de la comunidad.', icon: 'bi-bell', route: '/avisos' },
    { title: 'Recursos Educativos', description: 'Material visual y didáctico.', icon: 'bi-folder2-open', route: '/recursos' },
    { title: 'Unidad Educativa', description: 'Información institucional y contacto.', icon: 'bi-building', route: '/unidad-educativa' },
    { title: 'Perfil', description: 'Configuración y datos del estudiante.', icon: 'bi-person-circle', route: '/perfil' }
  ]
};

const requireAuth: CanActivateFn = async () => {
  const router = inject(Router);

  return new Promise<boolean | any>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? true : router.createUrlTree(['/login']));
    });
  });
};

const redirectIfAuthenticated: CanActivateFn = async () => {
  const router = inject(Router);

  return new Promise<boolean | any>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? router.createUrlTree(['/inicio']) : true);
    });
  });
};

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [redirectIfAuthenticated] },
  { path: 'inicio', component: Dashboard, canActivate: [requireAuth] },
  { path: 'biblioteca', component: SectionPage, canActivate: [requireAuth], data: { title: 'Biblioteca Digital', description: 'Material, guías y recursos para estudiar con más profundidad.', badge: 'Recursos', items: menuItems.genericas.filter(item => item.route !== '/biblioteca') } },
  { path: 'progreso', component: SectionPage, canActivate: [requireAuth], data: { title: 'Mi Progreso', description: 'Visualiza tus logros, metas y evolución en cada reto.', badge: 'Estadísticas', items: menuItems.genericas.filter(item => item.route !== '/progreso') } },
  { path: 'avisos', component: SectionPage, canActivate: [requireAuth], data: { title: 'Avisos y Comunicados', description: 'Mantente informado sobre noticias, eventos y fechas importantes.', badge: 'Novedades', items: menuItems.genericas.filter(item => item.route !== '/avisos') } },
  { path: 'recursos', component: SectionPage, canActivate: [requireAuth], data: { title: 'Recursos Educativos', description: 'Accede a materiales de apoyo para explorar más contenidos.', badge: 'Material', items: menuItems.genericas.filter(item => item.route !== '/recursos') } },
  { path: 'unidad-educativa', component: SectionPage, canActivate: [requireAuth], data: { title: 'Unidad Educativa', description: 'Conoce la comunidad, valores y espacios de aprendizaje.', badge: 'Institución', items: menuItems.genericas.filter(item => item.route !== '/unidad-educativa') } },
  { path: 'perfil', component: SectionPage, canActivate: [requireAuth], data: { title: 'Perfil', description: 'Consulta tus datos personales y ajustes de cuenta.', badge: 'Cuenta', items: menuItems.genericas.filter(item => item.route !== '/perfil') } },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
