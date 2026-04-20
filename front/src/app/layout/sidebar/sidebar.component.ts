import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  isCollapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  role$: Observable<string | null>;

  constructor(private auth: AuthService) {
    this.role$ = this.auth.role$;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }
}
