import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChangeRecoMode, LineNumberingMode } from 'src/app/domain/models/motions/motions.constants';

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
    public get currentChangeRecommendationMode(): ChangeRecoMode {
        return this.changeRecommendationModeSubject.value;
    }

    public get currentShowAllAmendmentsState(): boolean {
        return this.showAllAmendmentsStateSubject.value;
    }

    public readonly lineNumberingModeSubject = new BehaviorSubject<LineNumberingMode>(LineNumberingMode.None);
    public readonly changeRecommendationModeSubject = new BehaviorSubject<ChangeRecoMode>(ChangeRecoMode.Original);
    public readonly showAllAmendmentsStateSubject = new BehaviorSubject<boolean>(false);
    public readonly modifiedFinalVersionActionSubject = new Subject<ModifiedFinalVersionAction>();

    /**
     * Resets subjects to their default value.
     */
    public reset(): void {
        this.showAllAmendmentsStateSubject.next(false);
        this.changeRecommendationModeSubject.next(ChangeRecoMode.Original);
        this.lineNumberingModeSubject.next(LineNumberingMode.None);
    }
}
