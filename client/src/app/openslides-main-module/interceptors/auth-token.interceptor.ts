import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthTokenService } from '../../site/services/auth-token.service';

@Service()
export class AuthTokenInterceptor implements HttpInterceptor {
    private authTokenService = inject(AuthTokenService);

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
                        // Here you can cache failed responses and try again
                    }
                }
            })
        );
    }
}
