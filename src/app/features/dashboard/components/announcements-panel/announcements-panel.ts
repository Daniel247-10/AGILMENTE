import { Component, Input } from '@angular/core';
import { Comunicado } from '../../dashboard.model';

@Component({
  selector: 'app-announcements-panel',
  imports: [],
  templateUrl: './announcements-panel.html',
  styleUrl: './announcements-panel.css'
})
export class AnnouncementsPanel {
  @Input({ required: true }) comunicados: Comunicado[] = [];
}
