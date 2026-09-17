import { inject, Service } from '@angular/core';
import { debounceTime, filter, firstValueFrom, fromEvent, map, Observable, skipUntil } from 'rxjs';

import { LifecycleService } from './lifecycle.service';

@Service()
export class WindowVisibilityService {
    private lifecycle = inject(LifecycleService);

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
