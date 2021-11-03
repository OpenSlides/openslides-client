import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthTokenService } from '../auth-token.service';

@Injectable({
    providedIn: `root`
})
export class AuthTokenInterceptorService implements HttpInterceptor {
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
            tap(
                httpEvent => {
                    if (httpEvent instanceof HttpResponse && httpEvent.headers.get(`Authentication`)) {
                        // Successful request
                        this.authTokenService.setRawAccessToken(httpEvent.headers.get(`Authentication`));
                    }
                },
                error => {
                    if (error instanceof HttpErrorResponse) {
                        // Here you can cache failed responses and try again
                    }
                }
            )
        );
    }
}
