export type NivelDificultad = 'facil' | 'medio' | 'dificil';

export interface ActividadResumen {
  id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  colorTema: 'purple' | 'green' | 'amber' | 'blue' | 'pink' | 'orange';
  ruta: string;
}

export interface Comunicado {
  id: number;
  titulo: string;
  fecha: string;
  colorDot: 'red' | 'blue' | 'green';
}

export interface FotoGaleria {
  id: number;
  url: string;
  alt: string;
}

export interface UsuarioResumen {
  nombre: string;
  rol: 'administrador' | 'docente' | 'estudiante';
  puntos: number;
  nivel: number;
  tituloNivel: string;
  avatarUrl?: string;
}
