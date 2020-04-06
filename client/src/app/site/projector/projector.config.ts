import { AppConfig } from '../../core/definitions/app-config';
import { ProjectionDefaultRepositoryService } from 'app/core/repositories/projector/projection-default-repository.service';
import { ProjectionRepositoryService } from 'app/core/repositories/projector/projection-repository.service';
import { CountdownRepositoryService } from 'app/core/repositories/projector/projector-countdown-repository.service';
import { ProjectorMessageRepositoryService } from 'app/core/repositories/projector/projector-message-repository.service';
import { ProjectorRepositoryService } from 'app/core/repositories/projector/projector-repository.service';
import { Projection } from 'app/shared/models/projector/projection';
import { ProjectionDefault } from 'app/shared/models/projector/projection-default';
import { Projector } from 'app/shared/models/projector/projector';
import { ProjectorCountdown } from 'app/shared/models/projector/projector-countdown';
import { ProjectorMessage } from 'app/shared/models/projector/projector-message';
import { ViewProjection } from './models/view-projection';
import { ViewProjectionDefault } from './models/view-projection-default';
import { ViewProjector } from './models/view-projector';
import { ViewProjectorCountdown } from './models/view-projector-countdown';
import { ViewProjectorMessage } from './models/view-projector-message';

export const ProjectorAppConfig: AppConfig = {
    name: 'projector',
    models: [
        {
            model: Projector,
            viewModel: ViewProjector,
            repository: ProjectorRepositoryService
        },
        {
            model: ProjectionDefault,
            viewModel: ViewProjectionDefault,
            repository: ProjectionDefaultRepositoryService
        },
        {
            model: Projection,
            viewModel: ViewProjection,
            repository: ProjectionRepositoryService
        },
        {
            model: ProjectorCountdown,
            viewModel: ViewProjectorCountdown,
            repository: CountdownRepositoryService
        },
        {
            model: ProjectorMessage,
            viewModel: ViewProjectorMessage,
            repository: ProjectorMessageRepositoryService
        }
    ],
    mainMenuEntries: [
        {
            route: '/projectors',
            displayName: 'Projector',
            icon: 'videocam',
            weight: 700,
            permission: 'core.can_see_projector'
        }
    ]
};
