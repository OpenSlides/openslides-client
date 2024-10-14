import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthTokenService } from '../../site/services/auth-token.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    public constructor(private authTokenService: AuthTokenService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authTokenService.accessToken) {
            const authentication = `Bearer ` + this.authTokenService.accessToken.rawAccessToken;
            request = request.clone({
                headers: new HttpHeaders({
                    authentication
                })
            });
        }
        return next.handle(request);
    }
}
