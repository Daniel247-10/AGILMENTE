import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UnidadEducativaService } from '../../unidad-educativa/unidad-educativa.service';

interface SectionItem {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-section-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './section-page.html',
  styleUrl: './section-page.css'
})
export class SectionPage implements OnInit {
  private readonly unidadServicio = inject(UnidadEducativaService);
  private readonly esUnidadEducativa: boolean;
  title = 'Sección';
  description = 'Contenido de la sección.';
  badge = 'Explora';
  items: SectionItem[] = [];

  constructor(private readonly route: ActivatedRoute) {
    const data = this.route.snapshot.data;
    this.title = data['title'] ?? this.title;
    this.description = data['description'] ?? this.description;
    this.badge = data['badge'] ?? this.badge;
    this.items = data['items'] ?? this.items;
    this.esUnidadEducativa = data['unidadEducativa'] === true;
  }

  async ngOnInit(): Promise<void> {
    if (!this.esUnidadEducativa) return;

    try {
      const datos = await this.unidadServicio.obtener();
      if (datos) {
        this.title = datos.titulo;
        this.description = datos.descripcion;
        this.badge = datos.badge;
      }
    } catch {
      // Conserva el contenido predeterminado si Firestore no está disponible.
    }
  }
}
