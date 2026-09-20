import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ContenidoService } from '../contenido/contenido.service';
import { UsuarioResumen, ActividadResumen, Comunicado, FotoGaleria } from './dashboard.model';
import { WelcomeBannerComponent } from './components/welcome-banner/welcome-banner';
import { ActivityCard } from './components/activity-card/activity-card';
import { AnnouncementsPanel } from './components/announcements-panel/announcements-panel';
import { GalleryPanel } from './components/gallery-panel/gallery-panel';

@Component({
  selector: 'app-dashboard',
  imports: [
    WelcomeBannerComponent,
    ActivityCard,
    AnnouncementsPanel,
    GalleryPanel
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly contenido = inject(ContenidoService);

  constructor(private readonly router: Router) {
    const nombreGuardado = localStorage.getItem('agilmente_user_name');
    if (nombreGuardado) {
      this.usuario.nombre = this.formatearNombre(nombreGuardado);
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

  usuario: UsuarioResumen = {
    nombre: 'Usuario',
    rol: 'estudiante',
    puntos: 1280,
    nivel: 5,
    tituloNivel: 'Exploradora',
    avatarUrl: ''
  };

  actividades: ActividadResumen[] = [
    {
      id: 1,
      titulo: 'Sucesiones y Patrones',
      descripcion: 'Descubre secuencias y relaciones entre imágenes y números.',
      icono: 'bi-diagram-3',
      colorTema: 'purple',
      ruta: '/razonamiento-logico/sucesiones-patrones'
    },
    {
      id: 2,
      titulo: 'Conteo de Figuras',
      descripcion: 'Cuenta figuras, segmentos, ángulos y triángulos.',
      icono: 'bi-shapes',
      colorTema: 'green',
      ruta: '/razonamiento-logico/conteo-figuras'
    },
    {
      id: 3,
      titulo: 'Relaciones y Analogías',
      descripcion: 'Encuentra la relación entre figuras y números.',
      icono: 'bi-signpost-split',
      colorTema: 'amber',
      ruta: '/razonamiento-logico/relaciones-analogias'
    },
    {
      id: 4,
      titulo: 'Operaciones con Números Naturales',
      descripcion: 'Suma, resta y multiplica resolviendo desafíos.',
      icono: 'bi-plus-slash-minus',
      colorTema: 'blue',
      ruta: '/razonamiento-logico/operaciones-numeros-naturales'
    },
    {
      id: 5,
      titulo: 'Operadores Matemáticos',
      descripcion: 'Usa operadores para resolver problemas lógicos.',
      icono: 'bi-calculator',
      colorTema: 'pink',
      ruta: '/razonamiento-logico/operadores-matematicos'
    },
    {
      id: 6,
      titulo: 'Geometría Básica',
      descripcion: 'Explora figuras, perímetros y relaciones geométricas.',
      icono: 'bi-triangle',
      colorTema: 'orange',
      ruta: '/razonamiento-logico/geometria-basica'
    },
    {
      id: 7,
      titulo: 'Conjuntos',
      descripcion: 'Aprende sobre pertenencia, unión e intersección.',
      icono: 'bi-union',
      colorTema: 'pink',
      ruta: '/razonamiento-logico/conjuntos'
    },
    {
      id: 8,
      titulo: 'Juegos Lógicos',
      descripcion: 'Resuelve sudokus y cuadrados mágicos.',
      icono: 'bi-grid-3x3',
      colorTema: 'orange',
      ruta: '/razonamiento-logico/juegos-logicos'
    },
    {
      id: 9,
      titulo: 'Razonamiento Aplicado',
      descripcion: 'Ordena información y resuelve problemas de la vida diaria.',
      icono: 'bi-lightbulb',
      colorTema: 'purple',
      ruta: '/razonamiento-logico/razonamiento-aplicado'
    }
  ];

  comunicados: Comunicado[] = [
    { id: 1, titulo: 'Prueba de lógica del viernes', fecha: 'Hoy', colorDot: 'red' },
    { id: 2, titulo: 'Nuevos recursos disponibles', fecha: 'Ayer', colorDot: 'blue' },
    { id: 3, titulo: 'Reto semanal de matemáticas', fecha: '02 ago', colorDot: 'green' }
  ];

  fotos: FotoGaleria[] = [
    { id: 1, url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80', alt: 'Estudiantes aprendiendo' },
    { id: 2, url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', alt: 'Clase de matemáticas' },
    { id: 3, url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', alt: 'Trabajo en equipo' },
    { id: 4, url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80', alt: 'Aprendizaje creativo' }
  ];

  async ngOnInit(): Promise<void> {
    const [resultadoComunicados, resultadoFotos] = await Promise.allSettled([
      this.contenido.listarComunicadosPublicados(),
      this.contenido.listarFotosPublicadas()
    ]);

    if (resultadoComunicados.status === 'fulfilled' && resultadoComunicados.value.length > 0) {
      this.comunicados = resultadoComunicados.value;
    }

    if (resultadoFotos.status === 'fulfilled' && resultadoFotos.value.length > 0) {
      this.fotos = resultadoFotos.value;
    }
  }

  irAProgreso(): void {
    this.router.navigateByUrl('/progreso');
  }

  irAActividad(actividad: ActividadResumen): void {
    this.router.navigateByUrl(actividad.ruta);
  }
}
