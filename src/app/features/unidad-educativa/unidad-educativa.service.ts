import { Injectable } from '@angular/core';
import { getDoc, setDoc } from 'firebase/firestore';

import { auth, referencias } from '../../firebase';
import { DatosUnidadEducativa } from './unidad-educativa.model';

@Injectable({ providedIn: 'root' })
export class UnidadEducativaService {
  private readonly referencia = referencias.unidadEducativaPrincipal;

  async obtener(): Promise<DatosUnidadEducativa | null> {
    const snap = await getDoc(this.referencia);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      titulo: data['titulo'] ?? '',
      descripcion: data['descripcion'] ?? '',
      badge: data['badge'] ?? 'Institución'
    };
  }

  async guardar(datos: DatosUnidadEducativa): Promise<void> {
    await setDoc(this.referencia, {
      ...datos,
      actualizadoPor: auth.currentUser?.uid ?? '',
      actualizadoEn: new Date()
    }, { merge: true });
  }
}
