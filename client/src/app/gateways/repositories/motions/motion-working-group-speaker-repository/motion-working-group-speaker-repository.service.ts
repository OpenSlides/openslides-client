import { inject, Service } from '@angular/core';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';

import { ViewMotionWorkingGroupSpeaker } from '../../../../site/pages/meetings/pages/motions/modules/working-group-speakers/view-models/view-motion-working-group-speaker';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionWorkingGroupSpeakerAction } from './motion-working-group-speaker.action';

@Service()
export class MotionWorkingGroupSpeakerRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionWorkingGroupSpeaker,
    MotionWorkingGroupSpeaker
> {
    protected sortPayloadField = `motion_working_group_speaker_ids`;

    public constructor() {
        const repositoryServiceCollector = inject(RepositoryMeetingServiceCollectorService);
        super(repositoryServiceCollector, MotionWorkingGroupSpeaker, MotionWorkingGroupSpeakerAction);
    }

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Spokespersons` : `Spokesperson`);
}
