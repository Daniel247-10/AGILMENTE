import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  constructor(private readonly router: Router) {}

  continuarComoInvitado(): void {
    localStorage.setItem('agilmente_guest', 'true');
    this.router.navigateByUrl('/inicio', { replaceUrl: true });
  }
}
