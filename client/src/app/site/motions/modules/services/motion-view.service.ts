import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { ChangeRecoMode, LineNumberingMode } from '../../motions.constants';

/**
 * A service, that handles change-recommendation-mode and line-numbering-mode.
 */
@Injectable({
    providedIn: 'root'
})
export class MotionViewService {
    public get currentLineNumberingMode(): LineNumberingMode {
        return this.lineNumberingModeSubject.value;
    }

    public get currentChangeRecommendationMode(): ChangeRecoMode {
        return this.changeRecommendationModeSubject.value;
    }

    private readonly lineNumberingModeSubject = new BehaviorSubject<LineNumberingMode>(LineNumberingMode.None);
    private readonly changeRecommendationModeSubject = new BehaviorSubject<ChangeRecoMode>(ChangeRecoMode.Original);

    public constructor() {}

    public nextLineNumberingMode(mode: LineNumberingMode): void {
        this.lineNumberingModeSubject.next(mode);
    }

    public nextChangeRecoMode(mode: ChangeRecoMode): void {
        this.changeRecommendationModeSubject.next(mode);
    }

    public getLineNumberingModeObservable(): Observable<LineNumberingMode> {
        return this.lineNumberingModeSubject.asObservable();
    }

    public getChangeRecommendationModeObservable(): Observable<ChangeRecoMode> {
        return this.changeRecommendationModeSubject.asObservable();
    }
}
