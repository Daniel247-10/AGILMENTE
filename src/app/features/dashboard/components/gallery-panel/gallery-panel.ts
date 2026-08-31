import { Component, Input } from '@angular/core';
import { FotoGaleria } from '../../dashboard.model';

@Component({
  selector: 'app-gallery-panel',
  imports: [],
  templateUrl: './gallery-panel.html',
  styleUrl: './gallery-panel.css'
})
export class GalleryPanel {
  @Input({ required: true }) fotos: FotoGaleria[] = [];
}
