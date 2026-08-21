import { inject, Service } from '@angular/core';
import { MotionSubmitter } from '@app/domain/models/motions/motion-submitter';

import { ViewMotionSubmitter } from '../../../../site/pages/meetings/pages/motions/modules/submitters/view-models/view-motion-submitter';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionSubmitterAction } from './motion-submitter.action';

@Service()
export class MotionSubmitterRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    protected sortPayloadField = `motion_submitter_ids`;

    public constructor() {
        const repositoryServiceCollector = inject(RepositoryMeetingServiceCollectorService);
        super(repositoryServiceCollector, MotionSubmitter, MotionSubmitterAction);
    }

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Submitters` : `Submitter`);
}
