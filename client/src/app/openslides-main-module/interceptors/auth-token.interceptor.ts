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
    private isRedirecting = false;

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
                        // When OIDC is enabled (via Traefik middleware) and we get 401, the token has expired.
                        // Redirect to /oauth2/logout to clear Traefik's session cookie and force a fresh login.
                        if ((error.status === 401) && AuthTokenService.isOidcSession() && !this.isRedirecting) {
                            this.isRedirecting = true;
                            location.replace('/oauth2/logout');
                        }
                    }
                }
            })
        );
    }
}
