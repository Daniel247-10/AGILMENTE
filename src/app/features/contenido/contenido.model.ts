export type TipoContenido = 'comunicado' | 'galeria';

export interface ComunicadoContenido {
  id: string;
  titulo: string;
  fecha: string;
  colorDot: 'red' | 'blue' | 'green';
  publicado: boolean;
  creadoEn: number;
}

export interface FotoContenido {
  id: string;
  url: string;
  alt: string;
  publicado: boolean;
  creadoEn: number;
}

export type DatosComunicado = Omit<ComunicadoContenido, 'id' | 'creadoEn'>;
export type DatosFoto = Omit<FotoContenido, 'id' | 'creadoEn'>;
