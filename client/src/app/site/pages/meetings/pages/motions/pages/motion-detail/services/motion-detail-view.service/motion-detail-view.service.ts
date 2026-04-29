import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum ModifiedFinalVersionAction {
    CANCEL = `cancel`,
    EDIT = `edit`,
    SAVE = `save`
}

@Injectable({
    providedIn: 'root'
})
export class MotionDetailViewService {
    public readonly modifiedFinalVersionActionSubject = new Subject<ModifiedFinalVersionAction>();
}
