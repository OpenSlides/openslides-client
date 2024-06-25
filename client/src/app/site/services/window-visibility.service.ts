import { Injectable } from '@angular/core';
import { debounceTime, filter, firstValueFrom, fromEvent, map, Observable, skipUntil } from 'rxjs';

import { LifecycleService } from './lifecycle.service';

@Injectable({
    providedIn: `root`
})
export class WindowVisibilityService {
    public constructor(private lifecycle: LifecycleService) {}

    public async waitUntilVisible(): Promise<void> {
        if (document.visibilityState !== `visible`) {
            await firstValueFrom(
                fromEvent(document, `visibilitychange`).pipe(filter(() => document.visibilityState === `visible`))
            );
        }
    }

    public hiddenFor(ms: number): Observable<void> {
        return fromEvent(document, `visibilitychange`).pipe(
            skipUntil(this.lifecycle.appLoaded),
            debounceTime(ms),
            filter(() => document.visibilityState === `hidden`),
            map(() => {})
        );
    }
}
