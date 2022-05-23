import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';

import { Meeting } from '../../../domain/models/meetings/meeting';
import { AppConfig } from '../../../infrastructure/definitions/app-config';
import { ViewMeeting } from './view-models/view-meeting';
export const MeetingsAppConfig: AppConfig = {
    name: `meeting`,
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        }
    ]
};
