import { Injectable } from '@angular/core';

import { Deferred } from '../promises/deferred';

@Injectable({
    providedIn: `root`
})
export class OpenSlidesStatusService {
    public get stable(): Promise<void> {
        return this._stable;
    }

    private _stable = new Deferred();

    public setStable(): void {
        this._stable.resolve();
    }

    public reset(): void {
        this._stable = new Deferred();
    }
}
