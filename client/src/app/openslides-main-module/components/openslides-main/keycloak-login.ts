export type KeycloakLoginConfig = {
    bootAsKeycloakPage: boolean;
    jumpToRoute: string;
    loginAction: string;
    fieldErrors: {
        password: string;
        username: string;
    };
};

export function getKeycloakLoginConfig(): KeycloakLoginConfig {
    // @ts-expect-error bootAsKeycloakPage is a global variable
    return window.keycloakLoginConfig ? (window.keycloakLoginConfig as KeycloakLoginConfig) : null;
}
