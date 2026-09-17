import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthTokenService } from '../../site/services/auth-token.service';

@Injectable()
export class UserHeaderInterceptor implements HttpInterceptor {
    public constructor(private authTokenService: AuthTokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap({
                next: httpEvent => {
                    if (httpEvent instanceof HttpResponse && httpEvent.headers.get(`x-user-id`) !== null) {
                        this.authTokenService.setUserId(+httpEvent.headers.get(`x-user-id`));
                    }
                },
                error: (_error: unknown) => {}
            })
        );
    }
}
