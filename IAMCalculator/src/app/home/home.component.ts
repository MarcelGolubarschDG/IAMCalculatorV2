import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
  items: any[] = [];
  newItemName: string = '';

  constructor(private authService: AuthService) {}

  isAuthenticated$ = this.authService.isAuthenticated$;
  user$ = this.authService.getUserInfo();

  ngOnInit(): void {
    
  }


  
  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

}
