import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private oauthService: OAuthService) {
    this.configure();
  }

  private async configure() {
    this.oauthService.configure(authConfig);
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    
    // Prüfen, ob der Benutzer eingeloggt ist
    this.isAuthenticatedSubject.next(this.oauthService.hasValidAccessToken());
  }

  login() {
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  async getUserInfo(): Promise<any> {
    return await this.oauthService.loadUserProfile();
  }
}
