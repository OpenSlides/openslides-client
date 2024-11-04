import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';

import { AuthTokenService } from './auth-token.service';

@Injectable({
    providedIn: `root`
})
export class AccountService {
    private realm = `<realm>`;
    private baseUrl = `https://<keycloak-server>/auth/realms/${this.realm}/account/credentials/password`;

    public constructor(
        private http: HttpClient,
        private authTokenService: AuthTokenService
    ) {}

    public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authTokenService.rawAccessToken}`,
            'Content-Type': `application/json`
        });

        const body = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        const observable = this.http.put(this.baseUrl, body, { headers, responseType: `text` }).pipe(
            map(() => undefined),
            catchError(this.handleError)
        );
        return firstValueFrom(observable);
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = `An unknown error occurred`;

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            switch (error.status) {
                case 400:
                    errorMessage = `Bad request. Please check the current password and new password format.`;
                    break;
                case 401:
                    errorMessage = `Unauthorized. Please log in again.`;
                    break;
                case 403:
                    errorMessage = `Forbidden. You do not have permission to change the password.`;
                    break;
                case 500:
                    errorMessage = `Internal server error. Please try again later.`;
                    break;
                default:
                    errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }
        return throwError(() => new Error(errorMessage));
    }
}
