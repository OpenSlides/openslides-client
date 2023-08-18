import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { MeetingUserRepositoryService } from './meeting-user-repository.service';

export const MeetingUserAppConfig: AppConfig = {
    name: `meeting_users`,
    models: [
        {
            model: MeetingUser,
            viewModel: ViewMeetingUser,
            repository: MeetingUserRepositoryService
        }
    ]
};
