import { Injectable } from '@angular/core';
import {
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

import { auth, db } from '../../firebase';
import { DatosMaterial, MaterialBiblioteca } from './biblioteca.model';

@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private readonly coleccion = collection(db, 'biblioteca');

  // Estudiantes y docentes: solo el material publicado
  async listarPublicados(): Promise<MaterialBiblioteca[]> {
    const snap = await getDocs(query(this.coleccion, where('publicado', '==', true)));
    return this.convertir(snap.docs);
  }

  // Administrador: todo, publicado o en borrador
  async listarTodos(): Promise<MaterialBiblioteca[]> {
    const snap = await getDocs(query(this.coleccion, orderBy('creadoEn', 'desc')));
    return this.convertir(snap.docs);
  }

  async crear(datos: DatosMaterial): Promise<void> {
    await addDoc(this.coleccion, {
      ...datos,
      creadoPor: auth.currentUser?.uid ?? '',
      creadoEn: serverTimestamp()
    });
  }

  async actualizar(id: string, datos: Partial<DatosMaterial>): Promise<void> {
    await updateDoc(doc(db, 'biblioteca', id), { ...datos });
  }

  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'biblioteca', id));
  }

  // Pasa los documentos de Firestore a nuestro modelo, del más nuevo al más antiguo
  private convertir(docs: QueryDocumentSnapshot[]): MaterialBiblioteca[] {
    return docs
      .map((d): MaterialBiblioteca => {
        const data = d.data();
        const creado = data['creadoEn'];

        return {
          id: d.id,
          titulo: data['titulo'] ?? '',
          descripcion: data['descripcion'] ?? '',
          categoria: data['categoria'] ?? 'General',
          tipo: data['tipo'] ?? 'archivo',
          enlace: data['enlace'] ?? '',
          driveId: data['driveId'] ?? '',
          publicado: data['publicado'] === true,
          creadoEn: creado instanceof Timestamp ? creado.toMillis() : 0
        };
      })
      .sort((a, b) => b.creadoEn - a.creadoEn);
  }
}
