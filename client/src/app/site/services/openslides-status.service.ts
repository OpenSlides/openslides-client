import { Injectable } from '@angular/core';
import { Deferred } from 'src/app/infrastructure/utils/promises';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class OpenSlidesStatusService {
    public get stable(): Promise<void> {
        return this._stable;
    }

    public get isStableObservable(): Observable<boolean> {
        return this._stableSubject.asObservable();
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
