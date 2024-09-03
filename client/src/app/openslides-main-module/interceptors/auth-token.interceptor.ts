import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthTokenService } from '../../site/services/auth-token.service';
import { SharedWorkerService } from '../services/shared-worker.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    private accessToken: string | null = null;
    public constructor(
        private authTokenService: AuthTokenService,
        private sharedWorkerService: SharedWorkerService
    ) {
        authTokenService.accessTokenObservable.subscribe(token => {
            if (token) {
                console.log(`Access token: ${token.accessToken}`);
                this.accessToken = token.accessToken;
                // sharedWorkerService.sendMessage(`autoupdate`, {
                //     action: `set-auth-token`,
                //     content: {
                //         token: token.accessToken
                //     }
                // });
            }
        });
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.accessToken) {
            const authentication = `Bearer ` + this.accessToken;
            // console.log(`Adding authentication header: ${authentication}`);
            request = request.clone({
                headers: new HttpHeaders({
                    authentication
                })
            });
        }
        return next.handle(request).pipe(
            tap({
                error: (error: unknown) => {
                    if (error instanceof HttpErrorResponse) {
                        // Here you can cache failed responses and try again
                    }
                }
            })
        );
    }
}
