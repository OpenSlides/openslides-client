import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { Motion } from '@app/domain/models/motions/motion';
import { CreateResponse } from '@app/gateways/repositories/base-repository';
import { MotionRepositoryService } from '@app/gateways/repositories/motions';
import { viewModelListEqual } from '@app/infrastructure/utils';
import { distinctUntilChanged, map, Observable } from 'rxjs';

import { ViewMotion } from '../../../view-models';
import { MotionControllerService } from '../motion-controller.service';

@Service()
export class AmendmentControllerService {
    private controller = inject(MotionControllerService);
    private repo = inject(MotionRepositoryService);

    public getViewModelObservable(amendmentId: Id): Observable<ViewMotion | null> {
        return this.controller.getViewModelObservable(amendmentId);
    }

    public getViewModel(amendmentId: Id): ViewMotion | null {
        return this.controller.getViewModel(amendmentId);
    }

    public getViewModelList(): ViewMotion[] {
        return this.controller.getViewModelList().filter(motion => !!motion.lead_motion_id);
    }

    public getViewModelListFor(motion: Identifiable): ViewMotion[] {
        return this.getViewModelList().filter(amendment => amendment.lead_motion_id === motion.id);
    }

    public getViewModelListObservable(): Observable<ViewMotion[]> {
        return this.controller
            .getViewModelListObservable()
            .pipe(map(motions => motions.filter(motion => !!motion.lead_motion_id)));
    }

    public getViewModelListObservableFor(motion: Identifiable): Observable<ViewMotion[]> {
        return this.getViewModelListObservable().pipe(
            map(_motions => _motions.filter(_motion => _motion.lead_motion_id === motion.id)),
            distinctUntilChanged(viewModelListEqual)
        );
    }

    public getSortedViewModelList(key = `default`): ViewMotion[] {
        return this.controller.getSortedViewModelList(key).filter(motion => !!motion.lead_motion_id);
    }

    public getSortedViewModelListFor(motion: Identifiable, key = `default`): ViewMotion[] {
        return this.getSortedViewModelList(key).filter(amendment => amendment.lead_motion_id === motion.id);
    }

    public getSortedViewModelListObservable(key = `default`): Observable<ViewMotion[]> {
        return this.controller
            .getSortedViewModelListObservable(key)
            .pipe(map(motions => motions.filter(motion => !!motion.lead_motion_id)));
    }

    public getSortedViewModelListObservableFor(motion: Identifiable, key = `default`): Observable<ViewMotion[]> {
        return this.getSortedViewModelListObservable(key).pipe(
            map(_motions => _motions.filter(_motion => _motion.hasLeadMotion === true))
        );
    }

    public async createTextBased(partialMotion: Partial<Motion>): Promise<CreateResponse> {
        const result = await (this.repo.createTextBased(partialMotion).resolve() as Promise<CreateResponse[]>);
        return result[0];
    }

    public async createParagraphBased(partialMotion: Partial<Motion>): Promise<CreateResponse> {
        const result = await (this.repo.createParagraphBased(partialMotion).resolve() as Promise<CreateResponse[]>);
        return result[0];
    }
}
