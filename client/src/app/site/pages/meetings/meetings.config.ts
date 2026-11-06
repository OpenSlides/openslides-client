import { MeetingPollDefault } from '@app/domain/models/meetings/meeting-poll-default';
import { MeetingRepositoryService } from '@app/gateways/repositories/meeting-repository.service';
import { MeetingPollDefaultRepositoryService } from '@app/gateways/repositories/meetings/meeting-poll-default-repository.service';

import { Meeting } from '../../../domain/models/meetings/meeting';
import { AppConfig } from '../../../infrastructure/definitions/app-config';
import { ViewMeeting } from './view-models/view-meeting';
import { ViewMeetingPollDefault } from './view-models/view-meeting-poll-default';

export const MeetingsAppConfig: AppConfig = {
    name: `meeting`,
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        },
        {
            model: MeetingPollDefault,
            viewModel: ViewMeetingPollDefault,
            repository: MeetingPollDefaultRepositoryService
        }
    ]
};
