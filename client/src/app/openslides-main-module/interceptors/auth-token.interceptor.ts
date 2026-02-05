import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthTokenService } from '../../site/services/auth-token.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    private isReloading = false;

    public constructor(private authTokenService: AuthTokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authTokenService.rawAccessToken) {
            request = request.clone({
                setHeaders: {
                    authentication: this.authTokenService.rawAccessToken
                }
            });
        }
        return next.handle(request).pipe(
            tap({
                next: httpEvent => {
                    if (httpEvent instanceof HttpResponse && httpEvent.headers.get(`authentication`)) {
                        // Successful request
                        this.authTokenService.setRawAccessToken(httpEvent.headers.get(`Authentication`));
                    }
                },
                error: (error: unknown) => {
                    if (error instanceof HttpErrorResponse) {
                        // When OIDC is enabled (via Traefik middleware) and we get 401/403, the token has expired.
                        // Reload the page to trigger Traefik's OIDC flow.
                        if ((error.status === 401 || error.status === 403) && this.isOidcEnabled() && !this.isReloading) {
                            this.isReloading = true;
                            console.log(`OIDC: Token expired, reloading page to re-authenticate`);
                            location.reload();
                        }
                    }
                }
            })
        );
    }

    /**
     * Check if user logged in via OIDC by looking for the Traefik session cookie.
     */
    private isOidcEnabled(): boolean {
        return document.cookie.includes('TraefikOidcAuth.Session');
    }
}
