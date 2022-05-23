import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { AuthTokenService } from '../../site/services/auth-token.service';
import { AuthTokenInterceptor } from './auth-token.interceptor';

export const httpInterceptorProviders: Provider[] = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthTokenInterceptor,
        deps: [AuthTokenService],
        multi: true
    }
];
