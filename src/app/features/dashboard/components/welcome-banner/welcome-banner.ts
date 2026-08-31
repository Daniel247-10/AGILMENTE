import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-banner.html',
  styleUrl: './welcome-banner.css'
})
export class WelcomeBannerComponent {
  @Output() comenzar = new EventEmitter<void>();

  onComenzar(): void {
    this.comenzar.emit();
  }
}
