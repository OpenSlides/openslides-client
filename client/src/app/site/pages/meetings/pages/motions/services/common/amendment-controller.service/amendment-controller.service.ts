import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionRepositoryService } from 'src/app/gateways/repositories/motions';
import { ViewMotion } from '../../../view-models';
import { Motion } from 'src/app/domain/models/motions/motion';
import { Id } from 'src/app/domain/definitions/key-types';

@Injectable({
    providedIn: 'root'
})
export class AmendmentControllerService {
    constructor(private repo: MotionRepositoryService) {}

    public getViewModelObservable(amendmentId: Id): Observable<ViewMotion | null> {
        return this.repo.getViewModelObservable(amendmentId);
    }

    public getViewModel(amendmentId: Id): ViewMotion | null {
        return this.repo.getViewModel(amendmentId);
    }

    public getViewModelList(): ViewMotion[] {
        return this.repo.getViewModelList().filter(motion => !!motion.lead_motion_id);
    }

    public getViewModelListFor(motion: Identifiable): ViewMotion[] {
        return this.getViewModelList().filter(amendment => amendment.lead_motion_id === motion.id);
    }

    public getViewModelListObservable(): Observable<ViewMotion[]> {
        return this.repo
            .getViewModelListObservable()
            .pipe(map(motions => motions.filter(motion => !!motion.lead_motion_id)));
    }

    public getViewModelListObservableFor(motion: Identifiable): Observable<ViewMotion[]> {
        return this.repo
            .getViewModelListObservable()
            .pipe(map(_motions => _motions.filter(_motion => _motion.lead_motion_id === motion.id)));
    }

    public async createTextBased(partialMotion: Partial<Motion>): Promise<Identifiable> {
        const result = await (this.repo.createTextBased(partialMotion).resolve() as Promise<Identifiable[]>);
        return result[0];
    }

    public async createParagraphBased(partialMotion: Partial<Motion>): Promise<Identifiable> {
        const result = await (this.repo.createParagraphBased(partialMotion).resolve() as Promise<Identifiable[]>);
        return result[0];
    }

    public async createStatuteAmendment(partialMotion: Partial<Motion>): Promise<Identifiable> {
        const result = await (this.repo.createStatuteAmendment(partialMotion).resolve() as Promise<Identifiable[]>);
        return result[0];
    }
}
