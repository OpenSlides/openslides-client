import { Injectable } from '@angular/core';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';

import { ViewMotionSubmitter } from '../../../../site/pages/meetings/pages/motions/modules/submitters/view-models/view-motion-submitter';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionSubmitterAction } from './motion-submitter.action';

@Injectable({
    providedIn: `root`
})
export class MotionSubmitterRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionSubmitter,
    MotionSubmitter
> {
    protected sortPayloadField = `motion_submitter_ids`;

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionSubmitter, MotionSubmitterAction);
    }

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Submitters` : `Submitter`);
}
