import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
export class SectionPage {
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
  }
}
