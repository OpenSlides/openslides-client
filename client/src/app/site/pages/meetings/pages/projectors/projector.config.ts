import { Permission } from 'src/app/domain/definitions/permission';
import { Projection } from 'src/app/domain/models/projector/projection';
import { Projector } from 'src/app/domain/models/projector/projector';
import { ProjectorCountdown } from 'src/app/domain/models/projector/projector-countdown';
import { ProjectorMessage } from 'src/app/domain/models/projector/projector-message';
import { ProjectionRepositoryService } from 'src/app/gateways/repositories/projections/projection-repository.service';
import { ProjectorCountdownRepositoryService } from 'src/app/gateways/repositories/projector-countdowns/projector-countdown-repository.service';
import { ProjectorMessageRepositoryService } from 'src/app/gateways/repositories/projector-messages/projector-message-repository.service';
import { ProjectorRepositoryService } from 'src/app/gateways/repositories/projectors/projector-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import { ViewProjection, ViewProjector, ViewProjectorCountdown, ViewProjectorMessage } from './view-models';

export const ProjectorAppConfig: AppConfig = {
    name: `projector`,
    models: [
        {
            model: Projector,
            viewModel: ViewProjector,
            repository: ProjectorRepositoryService
        },
        {
            model: Projection,
            viewModel: ViewProjection,
            repository: ProjectionRepositoryService
        },
        {
            model: ProjectorCountdown,
            viewModel: ViewProjectorCountdown,
            repository: ProjectorCountdownRepositoryService
        },
        {
            model: ProjectorMessage,
            viewModel: ViewProjectorMessage,
            repository: ProjectorMessageRepositoryService
        }
    ],
    meetingMenuMentries: [
        {
            route: `projectors`,
            displayName: `Projector`,
            icon: `videocam`,
            weight: 700,
            permission: Permission.projectorCanSee
        }
    ]
};
