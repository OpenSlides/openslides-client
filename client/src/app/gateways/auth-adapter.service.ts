import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { HttpService } from './http.service';

interface AuthServiceResponse {
    message: string;
    success: boolean;
    token?: string;
}

@Injectable({
    providedIn: `root`
})
export class AuthAdapterService {
    private get authUrl(): string {
        return `/${environment.authUrlPrefix}`;
    }

    private get authSecureUrl(): string {
        return `${this.authUrl}/${environment.authSecurePrefix}`;
    }

    public constructor(private http: HttpService) {}

    public login(user: { username: string; password: string }): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authUrl}/login/`, user);
    }

    public logout(): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authSecureUrl}/logout/`);
    }

    public whoAmI(): Promise<AuthServiceResponse> {
        return this.http.post<AuthServiceResponse>(`${this.authUrl}/who-am-i/`);
    }

    public async startSamlLogin(): Promise<string> {
        const { message } = await this.http.get<AuthServiceResponse>(`/system/saml/getUrl`);
        return message;
    }
}
