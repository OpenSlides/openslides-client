import { Injectable } from '@angular/core';
import { MotionSubmitterAction } from 'app/core/actions/motion-submitter-action';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({
    providedIn: `root`
})
export class MotionSubmitterRepositoryService extends BaseRepositoryWithActiveMeeting<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, MotionSubmitter);
    }

    public getFieldsets(): Fieldsets<MotionSubmitter> {
        const listFields: (keyof MotionSubmitter)[] = [`user_id`, `weight`];

        return {
            [DEFAULT_FIELDSET]: listFields
        };
    }

    public getTitle = (submitter: ViewMotionSubmitter) => submitter?.user.getTitle();

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Submitters` : `Submitter`);

    public create(motion: ViewMotion, ...userIds: Id[]): Promise<Identifiable[]> {
        const payload: MotionSubmitterAction.CreatePayload[] = userIds.map(userId => ({
            user_id: userId,
            motion_id: motion.id
        }));
        return this.sendBulkActionToBackend(MotionSubmitterAction.CREATE, payload);
    }

    public delete(...submitterIds: Id[]): Promise<void[]> {
        const payload: MotionSubmitterAction.DeletePayload[] = submitterIds.map(submitterId => ({
            id: submitterId
        }));
        return this.sendBulkActionToBackend(MotionSubmitterAction.DELETE, payload);
    }

    public async sort(submitters: ViewMotionSubmitter[], motion: ViewMotion): Promise<void> {
        const payload: MotionSubmitterAction.SortPayload = {
            motion_submitter_ids: submitters.map(s => s.id),
            motion_id: motion.id
        };
        await this.sendActionToBackend(MotionSubmitterAction.SORT, payload);
    }
}
