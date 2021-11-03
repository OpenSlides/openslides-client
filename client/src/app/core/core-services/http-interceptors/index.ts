import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { AuthTokenService } from '../auth-token.service';
import { AuthTokenInterceptorService } from './auth-token-interceptor.service';
import { StableInterceptorService } from './stable-interceptor.service';

export const httpInterceptorProviders: Provider[] = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthTokenInterceptorService,
        deps: [AuthTokenService],
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: StableInterceptorService,
        multi: true
    }
];
