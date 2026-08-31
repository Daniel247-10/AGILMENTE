import { Component, Input } from '@angular/core';

export interface UsuarioResumen {
  nombre: string;
  avatarUrl?: string;
  puntos: number;
  nivel: number;
  tituloNivel: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  @Input({ required: true }) usuario!: UsuarioResumen;
}
