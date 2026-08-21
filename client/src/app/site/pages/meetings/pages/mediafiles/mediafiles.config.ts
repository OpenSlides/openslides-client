import { Permission } from '@app/domain/definitions/permission';
import { Mediafile } from '@app/domain/models/mediafiles/mediafile';
import { MediafileRepositoryService } from '@app/gateways/repositories/mediafiles/mediafile-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewMediafile } from './view-models';

export const MediafileAppConfig: AppConfig = {
    name: `mediafiles`,
    models: [
        {
            model: Mediafile,
            viewModel: ViewMediafile,
            repository: MediafileRepositoryService
        }
    ],
    meetingMenuMentries: [
        {
            route: `mediafiles`,
            displayName: `Files`,
            icon: `attach_file`,
            weight: 600,
            permission: Permission.mediafileCanSee
        }
    ]
};
