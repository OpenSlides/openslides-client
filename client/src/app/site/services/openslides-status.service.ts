import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Deferred } from 'src/app/infrastructure/utils/promises';

@Injectable({
    providedIn: `root`
})
export class OpenSlidesStatusService {
    public get stable(): Promise<void> {
        return this._stable;
    }

    public get isStableObservable(): Observable<boolean> {
        return this._stableSubject;
    }

    private _stable = new Deferred();
    private readonly _stableSubject = new BehaviorSubject(false);

    public setStable(): void {
        this._stable.resolve();
        this._stableSubject.next(true);
    }

    public reset(): void {
        this._stable = new Deferred();
    }
}
