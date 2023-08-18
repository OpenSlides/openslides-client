import { Injectable } from '@angular/core';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { Action } from 'src/app/gateways/actions';

import { Identifiable } from '../../../../domain/interfaces/identifiable';
import { ViewMotionSubmitter } from '../../../../site/pages/meetings/pages/motions/modules/submitters/view-models/view-motion-submitter';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionSubmitterAction } from './motion-submitter.action';

@Injectable({
    providedIn: `root`
})
export class MotionSubmitterRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionSubmitter);
    }

    public getTitle = (submitter: ViewMotionSubmitter) =>
        submitter?.user?.getTitle() || this.translate.instant(`Unknown participant`);

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Submitters` : `Submitter`);

    public create(motion: Identifiable, ...meetingUsers: Identifiable[]): Action<Identifiable[]> {
        const payload = meetingUsers.map(user => ({
            meeting_user_id: user.id,
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
