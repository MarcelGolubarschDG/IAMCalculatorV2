import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    standalone: false
})
export class NavbarComponent {
  constructor(private router: Router) {}

  goToPage(value: string) {
    this.router.navigateByUrl(value);
  }
}
