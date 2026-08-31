import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActividadResumen } from '../../dashboard.model';

@Component({
  selector: 'app-activity-card',
  imports: [],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css'
})
export class ActivityCard {
  @Input({ required: true }) actividad!: ActividadResumen;
  @Input({ required: true }) numero!: number;
  @Output() comenzar = new EventEmitter<ActividadResumen>();

  onComenzar(): void {
    this.comenzar.emit(this.actividad);
  }
}
