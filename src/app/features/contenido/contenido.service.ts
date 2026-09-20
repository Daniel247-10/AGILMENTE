import { Injectable } from '@angular/core';
import {
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { auth, colecciones } from '../../firebase';
import { ComunicadoContenido, DatosComunicado, DatosFoto, FotoContenido } from './contenido.model';

@Injectable({ providedIn: 'root' })
export class ContenidoService {
  private readonly comunicados = colecciones.comunicados;
  private readonly galeria = colecciones.fotosGaleria;

  async listarComunicadosPublicados(): Promise<ComunicadoContenido[]> {
    const resultados = await Promise.allSettled([
      getDocs(query(this.comunicados, where('publicado', '==', true))),
      getDocs(query(this.comunicados, where('destacado', '==', true)))
    ]);

    const documentos = new Map(
      resultados
        .filter((resultado): resultado is PromiseFulfilledResult<Awaited<ReturnType<typeof getDocs>>> => resultado.status === 'fulfilled')
        .flatMap((resultado) => resultado.value.docs)
        .map((documento) => [documento.id, documento])
    );

    return this.convertirComunicados([...documentos.values()]);
  }

  async listarFotosPublicadas(): Promise<FotoContenido[]> {
    const snap = await getDocs(query(this.galeria, where('publicado', '==', true)));
    return this.convertirFotos(snap.docs);
  }

  async listarComunicados(): Promise<ComunicadoContenido[]> {
    const snap = await getDocs(this.comunicados);
    return this.convertirComunicados(snap.docs);
  }

  async listarFotos(): Promise<FotoContenido[]> {
    const snap = await getDocs(this.galeria);
    return this.convertirFotos(snap.docs);
  }

  async crearComunicado(datos: DatosComunicado): Promise<void> {
    await addDoc(this.comunicados, { ...datos, creadoPor: auth.currentUser?.uid ?? '', creadoEn: serverTimestamp() });
  }

  async actualizarComunicado(id: string, datos: Partial<DatosComunicado>): Promise<void> {
    await updateDoc(doc(this.comunicados, id), datos);
  }

  async eliminarComunicado(id: string): Promise<void> {
    await deleteDoc(doc(this.comunicados, id));
  }

  async crearFoto(datos: DatosFoto): Promise<void> {
    await addDoc(this.galeria, { ...datos, creadoPor: auth.currentUser?.uid ?? '', creadoEn: serverTimestamp() });
  }

  async actualizarFoto(id: string, datos: Partial<DatosFoto>): Promise<void> {
    await updateDoc(doc(this.galeria, id), datos);
  }

  async eliminarFoto(id: string): Promise<void> {
    await deleteDoc(doc(this.galeria, id));
  }

  private convertirComunicados(docs: QueryDocumentSnapshot[]): ComunicadoContenido[] {
    return docs.map((documento) => {
      const data = documento.data();
      return {
        id: documento.id,
        titulo: data['titulo'] ?? '',
        fecha: this.textoFecha(data['fecha'] ?? data['fechaPublicacion']),
        colorDot: data['colorDot'] ?? 'blue',
        publicado: data['publicado'] === true || data['destacado'] === true,
        creadoEn: this.milisegundos(data['creadoEn'] ?? data['fechaPublicacion'])
      };
    }).sort((a, b) => b.creadoEn - a.creadoEn);
  }

  private convertirFotos(docs: QueryDocumentSnapshot[]): FotoContenido[] {
    return docs.map((documento) => {
      const data = documento.data();
      return {
        id: documento.id,
        url: data['url'] ?? '',
        alt: data['alt'] ?? '',
        publicado: data['publicado'] === true,
        creadoEn: this.milisegundos(data['creadoEn'])
      };
    }).sort((a, b) => b.creadoEn - a.creadoEn);
  }

  private milisegundos(valor: unknown): number {
    return valor instanceof Timestamp ? valor.toMillis() : valor instanceof Date ? valor.getTime() : 0;
  }

  private textoFecha(valor: unknown): string {
    if (valor instanceof Timestamp) {
      return valor.toDate().toLocaleDateString('es-BO');
    }

    return String(valor ?? '');
  }
}
