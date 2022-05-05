import { Injectable } from '@angular/core';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { ViewMotionSubmitter } from '../../../../site/pages/meetings/pages/motions/modules/submitters/view-models/view-motion-submitter';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { Fieldsets, DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { Identifiable } from '../../../../domain/interfaces/identifiable';
import { Id } from 'src/app/domain/definitions/key-types';
import { MotionSubmitterAction } from './motion-submitter.action';
import { Action } from 'src/app/gateways/actions';

@Injectable({
    providedIn: 'root'
})
export class MotionSubmitterRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionSubmitter);
    }

    public override getFieldsets(): Fieldsets<MotionSubmitter> {
        const listFields: (keyof MotionSubmitter)[] = [`user_id`, `weight`];

        return {
            [DEFAULT_FIELDSET]: listFields
        };
    }

    public getTitle = (submitter: ViewMotionSubmitter) => submitter?.user.getTitle();

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Submitters` : `Submitter`);

    public create(motion: Identifiable, ...users: Identifiable[]): Action<Identifiable[]> {
        const payload = users.map(user => ({
            user_id: user.id,
            motion_id: motion.id
        }));
        return this.createAction(MotionSubmitterAction.CREATE, payload);
    }

    public delete(...submitters: Identifiable[]): Action<void> {
        const payload = submitters.map(submitter => ({
            id: submitter.id
        }));
        return this.createAction(MotionSubmitterAction.DELETE, payload);
    }

    public async sort(submitters: Identifiable[], motion: Identifiable): Promise<void> {
        const payload = {
            motion_submitter_ids: submitters.map(submitter => submitter.id),
            motion_id: motion.id
        };
        await this.sendActionToBackend(MotionSubmitterAction.SORT, payload);
    }
}
