import { AppConfig } from '../core/definitions/app-config';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganisationRepositoryService } from 'app/core/repositories/management/organisation-repository.service';
import { ResourceRepositoryService } from 'app/core/repositories/management/resource-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { Committee } from 'app/shared/models/event-management/committee';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { Organisation } from 'app/shared/models/event-management/organisation';
import { Resource } from 'app/shared/models/event-management/resource';
import { User } from 'app/shared/models/users/user';
import { ViewCommittee } from './models/view-committee';
import { ViewMeeting } from './models/view-meeting';
import { ViewOrganisation } from './models/view-organisation';
import { ViewResource } from './models/view-resource';
import { ViewUser } from '../site/users/models/view-user';

export const ManagementAppConfig: AppConfig = {
    name: 'event-management',
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        },
        {
            model: Organisation,
            viewModel: ViewOrganisation,
            repository: OrganisationRepositoryService
        },
        {
            model: User,
            viewModel: ViewUser,
            repository: UserRepositoryService
        },
        {
            model: Committee,
            viewModel: ViewCommittee,
            repository: CommitteeRepositoryService
        },
        {
            model: Resource,
            viewModel: ViewResource,
            repository: ResourceRepositoryService
        }
    ]
};
