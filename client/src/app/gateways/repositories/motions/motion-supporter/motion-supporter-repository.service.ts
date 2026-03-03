import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { MotionSupporter } from 'src/app/domain/models/motions/motion-supporter';
import { Action } from 'src/app/gateways/actions';

import { ViewMotionSupporter } from '../../../../site/pages/meetings/pages/motions/modules/supporters/view-models/view-motion-supporter';
import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { MotionSupporterAction } from './motion-supporter.action';

@Injectable({
    providedIn: `root`
})
export class MotionSupporterRepositoryService extends BaseMeetingRelatedRepository<
    ViewMotionSupporter,
    MotionSupporter
> {
    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Motion supporters` : `Motion supporter`);

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionSupporter);
    }

    public getTitle = (model: ViewMotionSupporter): string =>
        model?.user?.getTitle() || this.translate.instant(`Deleted user`);

    public create(motion: Identifiable, ...meetingUsers: Identifiable[]): Action<Identifiable[]> {
        const payload = meetingUsers.map(user => ({
            meeting_user_id: user.id,
            motion_id: motion.id
        }));
        return this.createAction(MotionSupporterAction.CREATE, payload);
    }

    public delete(...models: Identifiable[]): Action<void> {
        const payload = models.map(model => ({
            id: model.id
        }));
        return this.createAction(MotionSupporterAction.DELETE, payload);
    }
}
