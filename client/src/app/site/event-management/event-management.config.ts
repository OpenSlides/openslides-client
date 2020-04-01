import { AppConfig } from '../../core/definitions/app-config';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { ViewMeeting } from './models/view-meeting';

export const EventManagementAppConfig: AppConfig = {
    name: 'event-management',
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        }
    ]
};
