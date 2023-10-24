import { Injectable } from '@angular/core';
import { LegacyProgressBarMode as ProgressBarMode } from '@angular/material/legacy-progress-bar';
import { Subject } from 'rxjs';

import { ProgressSnackBarServiceModule } from './progress-snack-bar-service.module';

@Injectable({
    providedIn: ProgressSnackBarServiceModule
})
export class ProgressSnackBarControlService {
    /**
     * Subject to get text to display
     */
    private _messageSubject: Subject<string> = new Subject();

    /**
     * Subject to get the chosen progress mode
     */
    private _progressModeSubject: Subject<ProgressBarMode> = new Subject();

    /**
     * Subject to get the progress amount
     */
    private _amountSubject: Subject<number> = new Subject();

    /**
     * Get the progress information as observable
     */
    public get messageSubject(): Subject<string> {
        return this._messageSubject;
    }

    /**
     * get the progress mode as observable
     */
    public get progressModeSubject(): Subject<ProgressBarMode> {
        return this._progressModeSubject;
    }

    /**
     * Get the progress amount as observable
     */
    public get amountSubject(): Subject<number> {
        return this._amountSubject;
    }

    /**
     * Set the progress info. Usually only required once for every part if new information
     */
    public set message(newText: string) {
        setTimeout(() => this._messageSubject.next(newText));
    }

    /**
     * Set the new progress mode
     */
    public set progressMode(mode: ProgressBarMode) {
        this._progressModeSubject.next(mode);
    }

    /**
     * Set the new progress amount. Can be called whenever new info about the progress
     * is available. Required only if the ProgressMode is set to 'determinate'
     */
    public set progressAmount(newAmount: number) {
        this._amountSubject.next(newAmount);
    }
}
