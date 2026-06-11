import { Component } from '@angular/core';
import { GroupsPageComponent } from './components/groups-page/groups-page.component';

@Component({
  selector: 'app-root',
  imports: [GroupsPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {}
