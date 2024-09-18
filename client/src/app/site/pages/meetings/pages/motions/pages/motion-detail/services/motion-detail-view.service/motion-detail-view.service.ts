import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { MotionDetailServiceModule } from '../motion-detail-service.module';

export enum ModifiedFinalVersionAction {
    CANCEL = `cancel`,
    EDIT = `edit`,
    SAVE = `save`
}

@Injectable({
    providedIn: MotionDetailServiceModule
})
export class MotionDetailViewService {
    public get currentShowAllAmendmentsState(): boolean {
        return this.showAllAmendmentsStateSubject.value;
    }

    public readonly showAllAmendmentsStateSubject = new BehaviorSubject<boolean>(false);
    public readonly modifiedFinalVersionActionSubject = new Subject<ModifiedFinalVersionAction>();

    /**
     * Resets subjects to their default value.
     */
    public reset(): void {
        this.showAllAmendmentsStateSubject.next(false);
    }
}
