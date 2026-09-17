import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { AuthTokenService } from '../../site/services/auth-token.service';
import { UserHeaderInterceptor } from './user-header.interceptor';

export const httpInterceptorProviders: Provider[] = [
    {
        provide: HTTP_INTERCEPTORS,
        useClass: UserHeaderInterceptor,
        deps: [AuthTokenService],
        multi: true
    }
];
