import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { MotionDetailServiceModule } from '../motion-detail-service.module';

export enum ModifiedFinalVersionAction {
    CANCEL = `cancel`,
    EDIT = `edit`,
    SAVE = `save`,
    APPLY = `apply`
}

@Injectable({
    providedIn: MotionDetailServiceModule
})
export class MotionDetailViewService {
    public readonly modifiedFinalVersionActionSubject = new Subject<ModifiedFinalVersionAction>();
}
