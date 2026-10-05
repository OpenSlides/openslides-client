import { MeetingPollSetting } from '@app/domain/models/meetings/meeting-poll-setting';
import { MeetingRepositoryService } from '@app/gateways/repositories/meeting-repository.service';
import { MeetingPollSettingRepositoryService } from '@app/gateways/repositories/meetings/meeting-poll-setting-repository.service';

import { Meeting } from '../../../domain/models/meetings/meeting';
import { AppConfig } from '../../../infrastructure/definitions/app-config';
import { ViewMeeting } from './view-models/view-meeting';
import { ViewMeetingPollSetting } from './view-models/view-meeting-poll-setting';

export const MeetingsAppConfig: AppConfig = {
    name: `meeting`,
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        },
        {
            model: MeetingPollSetting,
            viewModel: ViewMeetingPollSetting,
            repository: MeetingPollSettingRepositoryService
        }
    ]
};
