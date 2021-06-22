import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { first, mergeMap } from 'rxjs/operators';

import { OpenSlidesStatusService } from '../openslides-status.service';

@Injectable({
    providedIn: 'root'
})
export class StableInterceptorService {
    private readonly stableSubject = new BehaviorSubject<boolean>(false);

    public constructor(private openslidesStatus: OpenSlidesStatusService) {
        this.update();
    }

    public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.stableSubject.pipe(
            first(stable => stable),
            mergeMap(() => {
                return next.handle(req);
            })
        );
    }

    private async update(): Promise<void> {
        await this.openslidesStatus.stable;
        this.stableSubject.next(true);
    }
}
