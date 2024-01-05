import { Injectable } from '@angular/core';
import { debounceTime, filter, firstValueFrom, fromEvent, map, Observable } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class WindowVisibilityService {
    public async waitUntilVisible(): Promise<void> {
        if (document.visibilityState !== `visible`) {
            await firstValueFrom(
                fromEvent(document, `visibilitychange`).pipe(filter(() => document.visibilityState === `visible`))
            );
        }
    }

    public hiddenFor(ms: number): Observable<void> {
        return fromEvent(document, `visibilitychange`).pipe(
            debounceTime(ms),
            filter(() => document.visibilityState === `hidden`),
            map(() => {})
        );
    }
}
