import { Injectable } from '@angular/core';
import { MotionWorkingGroupSpeaker } from 'src/app/domain/models/motions/motion-working-group-speaker';

import { ViewMotionWorkingGroupSpeaker } from '../../../../site/pages/meetings/pages/motions/modules/working-group-speakers/view-models/view-motion-working-group-speaker';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionWorkingGroupSpeakerAction } from './motion-working-group-speaker.action';

@Injectable({
    providedIn: `root`
})
export class MotionWorkingGroupSpeakerRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    protected sortPayloadField = `motion_working_group_speaker_ids`;

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionWorkingGroupSpeaker, MotionWorkingGroupSpeakerAction);
    }

    public getVerboseName = (plural = false) =>
        this.translate.instant(plural ? `Spokespersons` : `Spokesperson`);
}
