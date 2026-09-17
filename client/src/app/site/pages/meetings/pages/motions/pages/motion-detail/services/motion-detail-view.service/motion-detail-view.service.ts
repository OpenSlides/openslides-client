import { Service } from '@angular/core';
import { Subject } from 'rxjs';

export enum ModifiedFinalVersionAction {
    CANCEL = `cancel`,
    EDIT = `edit`,
    SAVE = `save`
}

@Service()
export class MotionDetailViewService {
    public readonly modifiedFinalVersionActionSubject = new Subject<ModifiedFinalVersionAction>();
}
