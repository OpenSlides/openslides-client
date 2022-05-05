import { AppConfig } from '../../../infrastructure/definitions/app-config';
import { Meeting } from '../../../domain/models/meetings/meeting';
import { ViewMeeting } from './view-models/view-meeting';
import { MeetingRepositoryService } from 'src/app/gateways/repositories/meeting-repository.service';
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
