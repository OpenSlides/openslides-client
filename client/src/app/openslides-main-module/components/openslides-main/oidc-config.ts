import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
    issuer: `https://localhost:8000/idp/realms/os`,
    redirectUri: window.location.origin + `/`,
    clientId: `os-ui`,
    responseType: `code`,
    scope: `profile email offline_access`,
    showDebugInformation: true,
    timeoutFactor: 0.75
};
