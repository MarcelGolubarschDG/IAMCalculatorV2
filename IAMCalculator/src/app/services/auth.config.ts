import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://iamcalculator-cneyjv.us1.zitadel.cloud/', // Zitadel-URL
  clientId: '314086246408337631', // Zitadel Client-ID
  redirectUri: window.location.origin, // Callback-URL
  responseType: 'code',
  scope: 'openid profile email offline_access',
  strictDiscoveryDocumentValidation: false,
  showDebugInformation: true,
  useSilentRefresh: true,
  sessionChecksEnabled: true,
  requireHttps: true,
};
