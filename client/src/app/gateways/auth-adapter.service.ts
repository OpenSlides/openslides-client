import { inject, Service } from '@angular/core';

import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

interface AuthServiceResponse {
    message: string;
    success: boolean;
    token?: string;
}

@Service()
export class AuthAdapterService {
    private get authUrl(): string {
        return `/${environment.authUrlPrefix}`;
    }

    private get authSecureUrl(): string {
        return `${this.authUrl}/${environment.authSecurePrefix}`;
    }

    private http = inject(HttpService);

    public login(user: { username: string; password: string }): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authUrl}/login/`, user);
    }

    public logout(): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authSecureUrl}/logout/`);
    }

    public whoAmI(): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authUrl}/who-am-i/`);
    }

    public async startSamlLogin(redirectUrl?: string): Promise<string> {
        const queryParams = {};
        if (redirectUrl) {
            queryParams['redirectUrl'] = redirectUrl;
        }

        const { message } = await this.http.get<AuthServiceResponse>(`/system/saml/getUrl`, null, {
            queryParams
        });
        return message;
    }
}
