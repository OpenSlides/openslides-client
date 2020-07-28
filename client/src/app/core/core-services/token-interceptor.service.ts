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

import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {
    public constructor(private tokenService: TokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.tokenService.accessToken) {
            // redirect to /login ??
        }
        const copy = request.clone({
            setHeaders: {
                authentication: this.tokenService.accessToken
            }
        });
        return next.handle(copy).pipe(
            tap(
                httpEvent => {
                    if (httpEvent instanceof HttpResponse) {
                        // Successful request
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
