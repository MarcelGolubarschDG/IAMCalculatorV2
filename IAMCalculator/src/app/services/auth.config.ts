import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://iamcalculator-cneyjv.us1.zitadel.cloud', // Zitadel-URL
  clientId: '314086246408337631', // Zitadel Client-ID
  redirectUri: 'http://localhost:4200/Home', // Callback-URL
  postLogoutRedirectUri: 'http://localhost:4200/Home', // Füge dies hinzu!
  responseType: 'code',
  scope: 'openid profile email offline_access',
  strictDiscoveryDocumentValidation: false,
  showDebugInformation: true,
  useSilentRefresh: true,
  sessionChecksEnabled: true,
  requireHttps: true,
};
