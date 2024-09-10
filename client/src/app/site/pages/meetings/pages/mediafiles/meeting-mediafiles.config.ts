import { MeetingMediafile } from 'src/app/domain/models/meeting-mediafile/meeting-mediafile';
import { MeetingMediafileRepositoryService } from 'src/app/gateways/repositories/meeting-mediafile/meeting-mediafile-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import { ViewMeetingMediafile } from './view-models';

export const MeetingMediafileAppConfig: AppConfig = {
    name: `meeting_mediafiles`,
    models: [
        {
            model: MeetingMediafile,
            viewModel: ViewMeetingMediafile,
            repository: MeetingMediafileRepositoryService
        }
    ]
};
